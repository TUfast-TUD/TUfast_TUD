import { getIndexedOpalSearchNode, upsertOpalSearchNodes } from './messages'
import { publishActiveIndexProgress } from './activeIndexProgress'
import {
  extractCourseIdFromUrl,
  extractCourseNodeLinks,
  extractCourseNodeLinksFromMarkup,
  inferExtensionFromName,
  inferExtensionFromUrl,
  inferNodeType,
  isDownloadUrl,
  readBestLinkTitle,
  urlToOpalSearchId
} from './opalParser'
import {
  loadSmartSearchSettings,
  OPAL_SMART_SEARCH_ACTIVE_PROMPT_DISMISSED_KEY,
  saveSmartSearchSettings
} from '../../../../modules/opalSmartSearch/settings'
import type {
  OpalActiveIndexProgress,
  OpalSearchNode,
  OpalStoredCourse
} from '../../../../modules/opalSmartSearch/types'
import {
  isIndexableOpalTarget,
  isOpalUiControlTarget,
  normalizeAllowedOpalUrl
} from '../../../../modules/opalSmartSearch/urlPolicy'

const ACTIVE_INDEX_KEY = 'opalSmartSearchActiveIndexRuns'
const ACTIVE_INDEX_COOLDOWN_MS = 6 * 60 * 60 * 1000
const MAX_ACTIVE_COURSES_PER_RUN = 8
const MAX_SECTIONS_PER_COURSE = 16
const MAX_ACTIVE_DEPTH = 3
const MAX_ACTIVE_RENDER_NAVIGATIONS = 10
const ACTIVE_COURSE_TIME_BUDGET_MS = 60000
const ACTIVE_SECTION_COOLDOWN_MS = 6 * 60 * 60 * 1000
const ACTIVE_FETCH_TIMEOUT_MS = 10000
const ACTIVE_FRAME_LOAD_TIMEOUT_MS = 12000
const FRAME_SETTLE_DELAY_MS = 350
const SECTION_DELAY_MS = 80

let activeIndexStarted = false

interface BreadcrumbEntry {
  title: string
  url: string
}

interface CourseTarget {
  title: string
  url: string
}

type RenderPreflight =
  | { kind: 'html'; url: string }
  | { kind: 'file'; url: string; title: string; fileExtension?: string }
  | { kind: 'skip'; reason: string }

export async function indexCurrentOpalPage(): Promise<void> {
  const currentUrl = normalizeAllowedOpalUrl(location.href)
  if (!currentUrl) return

  const title = readPageTitle(document)
  if (!title || isOpalHomeUrl(currentUrl)) return

  const now = Date.now()
  const breadcrumbs = parseBreadcrumbs(document)
  const breadcrumbText = breadcrumbs.map((crumb) => crumb.title).join(' ')
  const courseId =
    breadcrumbs.length > 0 ? extractCourseIdFromUrl(breadcrumbs[0].url) : extractCourseIdFromUrl(currentUrl)
  const currentId = urlToOpalSearchId(currentUrl)
  const breadcrumbNodes = breadcrumbs.map((crumb, index): OpalSearchNode => {
    const id = urlToOpalSearchId(crumb.url)
    return {
      id,
      title: crumb.title,
      url: crumb.url,
      type: index === 0 ? 'course' : inferNodeType(crumb.url),
      courseId,
      parentId: index > 0 ? urlToOpalSearchId(breadcrumbs[index - 1].url) : null,
      lastVisited: now,
      visitCount: 1,
      source: 'user',
      searchText: breadcrumbText
    }
  })
  const parentBreadcrumb = [...breadcrumbNodes].reverse().find((crumb) => crumb.id !== currentId)
  const currentNode: OpalSearchNode = {
    id: currentId,
    title,
    url: currentUrl,
    type: inferNodeType(currentUrl),
    courseId,
    parentId: parentBreadcrumb?.id || null,
    lastVisited: now,
    visitCount: 1,
    fileExtension: inferExtensionFromUrl(currentUrl),
    source: 'user',
    lastFetchedAt: now,
    structureHash: await computeStructureHash(document, currentUrl),
    searchText: breadcrumbText
  }

  await upsertOpalSearchNodes([...breadcrumbNodes, currentNode])
  await indexCourseLinks(document, currentUrl, courseId, currentId, 'user', now)
  await indexVisibleFiles(document, currentNode, 'user')
}

export async function bootstrapCoursesFromStorage(): Promise<void> {
  const data = await chrome.storage.local.get(['favoriten', 'meine_kurse'])
  const nodes = readStoredCourseTargets(data)
    .map(
      ({ title, url }): OpalSearchNode => ({
        id: urlToOpalSearchId(url),
        title,
        url,
        type: 'course',
        courseId: extractCourseIdFromUrl(url),
        parentId: null,
        lastVisited: Date.now(),
        visitCount: 1,
        source: 'user'
      })
    )
    .filter((node) => node.id && node.title && node.url)

  await upsertOpalSearchNodes(nodes)
}

export async function maybeRunActiveIndexing(): Promise<void> {
  if (activeIndexStarted) return
  activeIndexStarted = true

  const settings = await loadSmartSearchSettings()
  if (!settings.enabled || !settings.activeIndexing) return

  const data = await chrome.storage.local.get(['favoriten', 'meine_kurse', ACTIVE_INDEX_KEY])
  const cooldowns = (data[ACTIVE_INDEX_KEY] || {}) as Record<string, number>
  const toIndex = readActiveCourseTargets(data)
    .filter((course) => Date.now() - (cooldowns[course.url] || 0) > ACTIVE_INDEX_COOLDOWN_MS)
    .slice(0, MAX_ACTIVE_COURSES_PER_RUN)
  const startedAt = Date.now()
  let indexedItems = 0

  await publishActiveIndexProgress({
    status: toIndex.length === 0 ? 'done' : 'running',
    startedAt,
    totalCourses: toIndex.length,
    completedCourses: 0,
    indexedItems
  })

  for (const [index, course] of toIndex.entries()) {
    await publishActiveIndexProgress({
      status: 'running',
      startedAt,
      totalCourses: toIndex.length,
      completedCourses: index,
      indexedItems,
      currentCourseTitle: course.title
    })

    try {
      const courseStartItems = indexedItems
      const courseIndexedItems = await indexSingleCourse(course, async (addedItems) => {
        indexedItems += addedItems
        await publishActiveIndexProgress({
          status: 'running',
          startedAt,
          totalCourses: toIndex.length,
          completedCourses: index,
          indexedItems,
          currentCourseTitle: course.title
        })
      })
      indexedItems = courseStartItems + courseIndexedItems
      cooldowns[course.url] = Date.now()
      await chrome.storage.local.set({ [ACTIVE_INDEX_KEY]: cooldowns })
    } catch (error) {
      console.warn('[TUfast Smart Search] Active indexing skipped course:', error)
    }

    await publishActiveIndexProgress({
      status: 'running',
      startedAt,
      totalCourses: toIndex.length,
      completedCourses: index + 1,
      indexedItems,
      currentCourseTitle: course.title
    })

    await wait(SECTION_DELAY_MS)
  }

  await publishActiveIndexProgress({
    status: 'done',
    startedAt,
    totalCourses: toIndex.length,
    completedCourses: toIndex.length,
    indexedItems
  })
}

export async function startActiveIndexing(): Promise<OpalActiveIndexProgress> {
  const settings = await loadSmartSearchSettings()
  await chrome.storage.local.remove([OPAL_SMART_SEARCH_ACTIVE_PROMPT_DISMISSED_KEY])
  await saveSmartSearchSettings({ ...settings, activeIndexing: true })
  await bootstrapCoursesFromStorage()

  const progress: OpalActiveIndexProgress = {
    status: 'running',
    startedAt: Date.now(),
    updatedAt: Date.now(),
    totalCourses: 0,
    completedCourses: 0,
    indexedItems: 0
  }

  activeIndexStarted = false
  await publishActiveIndexProgress(progress)
  maybeRunActiveIndexing().catch((error) => console.warn('[TUfast Smart Search] Active indexing failed:', error))
  return progress
}

async function indexSingleCourse(
  course: CourseTarget,
  onProgress?: (addedItems: number) => Promise<void>
): Promise<number> {
  let indexed = 0
  const safeCourseUrl = normalizeAllowedOpalUrl(course.url)
  if (!safeCourseUrl) return indexed

  const fetchedDoc = await fetchOpalDocument(safeCourseUrl)
  if (fetchedDoc) {
    const now = Date.now()
    const courseId = extractCourseIdFromUrl(safeCourseUrl)
    const courseNode: OpalSearchNode = {
      id: urlToOpalSearchId(safeCourseUrl),
      title: readDocumentTitle(fetchedDoc) || course.title || safeCourseUrl,
      url: safeCourseUrl,
      type: 'course',
      courseId,
      parentId: null,
      lastVisited: now,
      visitCount: 1,
      source: 'active',
      lastFetchedAt: now,
      structureHash: await computeStructureHash(fetchedDoc, safeCourseUrl),
      searchText: fetchedDoc.title
    }

    await upsertOpalSearchNodes([courseNode])
    indexed += 1
    indexed += await indexCourseLinks(fetchedDoc, safeCourseUrl, courseId, courseNode.id, 'active', now)
    indexed += await indexVisibleFiles(fetchedDoc, courseNode, 'active')
  }

  const rendered = await indexRenderedCourse(course, onProgress)
  return indexed + rendered
}

async function indexRenderedCourse(
  course: CourseTarget,
  onProgress?: (addedItems: number) => Promise<void>
): Promise<number> {
  const safeCourseUrl = normalizeAllowedOpalUrl(course.url)
  if (!safeCourseUrl) return 0

  const iframe = document.createElement('iframe')
  iframe.dataset.tufastSmartSearchActiveIndexer = 'true'
  iframe.setAttribute('aria-hidden', 'true')
  iframe.tabIndex = -1
  iframe.style.cssText =
    'position:fixed;width:960px;height:720px;border:0;opacity:0;pointer-events:none;left:-12000px;top:-12000px;'
  document.documentElement.appendChild(iframe)

  try {
    const coursePreflight = await preflightRenderedTarget(safeCourseUrl, course.title)
    if (coursePreflight.kind !== 'html') return 0

    const courseDoc = await loadFrameDocument(iframe, coursePreflight.url)
    if (!courseDoc) return 0

    const courseId = extractCourseIdFromUrl(safeCourseUrl)
    const courseRootId = urlToOpalSearchId(safeCourseUrl)
    const courseTitle = readDocumentTitle(courseDoc) || course.title || safeCourseUrl
    let indexed = 0
    const now = Date.now()
    const courseNode: OpalSearchNode = {
      id: courseRootId,
      title: courseTitle,
      url: safeCourseUrl,
      type: 'course',
      courseId,
      parentId: null,
      lastVisited: now,
      visitCount: 1,
      source: 'active',
      lastFetchedAt: now,
      structureHash: await computeStructureHash(courseDoc, safeCourseUrl),
      searchText: courseDoc.title
    }

    await upsertOpalSearchNodes([courseNode])
    indexed += 1
    await onProgress?.(1)
    const courseLinks = await indexCourseLinks(courseDoc, safeCourseUrl, courseId, courseRootId, 'active', now)
    const courseFiles = await indexVisibleFiles(courseDoc, courseNode, 'active')
    indexed += courseLinks + courseFiles
    if (courseLinks + courseFiles > 0) await onProgress?.(courseLinks + courseFiles)

    const queued = new Set<string>([courseRootId])
    const visited = new Set<string>()
    const sectionQueue = enqueueSectionLinks(
      findMaterialSectionLinks(courseDoc, safeCourseUrl),
      courseRootId,
      1,
      queued
    )
    const startedAt = Date.now()
    let renderedNavigations = 0

    while (sectionQueue.length > 0 && visited.size < MAX_SECTIONS_PER_COURSE) {
      if (Date.now() - startedAt > ACTIVE_COURSE_TIME_BUDGET_MS) break
      if (renderedNavigations >= MAX_ACTIVE_RENDER_NAVIGATIONS) break

      const section = sectionQueue.shift()
      if (!section) break
      const sectionUrl = normalizeAllowedOpalUrl(section.url)
      if (!sectionUrl) continue
      const sectionId = urlToOpalSearchId(sectionUrl)
      if (!sectionId || visited.has(sectionId)) continue
      visited.add(sectionId)
      if (await isFreshKnownSection(sectionId)) continue

      const preflight = await preflightRenderedTarget(sectionUrl, section.title)
      if (preflight.kind === 'file') {
        const fileNode: OpalSearchNode = {
          id: urlToOpalSearchId(preflight.url),
          title: preflight.title,
          url: preflight.url,
          type: 'file',
          courseId,
          parentId: section.parentId,
          lastVisited: Date.now(),
          visitCount: 1,
          fileExtension: preflight.fileExtension,
          source: 'active',
          searchText: courseTitle
        }
        await upsertOpalSearchNodes([fileNode])
        indexed += 1
        await onProgress?.(1)
        continue
      }
      if (preflight.kind === 'skip') continue

      const sectionDoc = await loadFrameDocument(iframe, preflight.url)
      if (!sectionDoc) continue
      renderedNavigations += 1

      const sectionTitle = readSectionTitle(sectionDoc, section.title)
      const sectionNode: OpalSearchNode = {
        id: sectionId,
        title: sectionTitle,
        url: sectionUrl,
        type: 'folder',
        courseId,
        parentId: section.parentId,
        lastVisited: Date.now(),
        visitCount: 1,
        source: 'active',
        lastFetchedAt: Date.now(),
        structureHash: await computeStructureHash(sectionDoc, safeCourseUrl),
        searchText: courseTitle
      }

      await upsertOpalSearchNodes([sectionNode])
      indexed += 1
      const childLinks = await indexCourseLinks(sectionDoc, safeCourseUrl, courseId, sectionId, 'active', Date.now())
      const fileLinks = await indexVisibleFiles(sectionDoc, sectionNode, 'active')
      indexed += childLinks + fileLinks
      await onProgress?.(1 + childLinks + fileLinks)

      if (section.depth < MAX_ACTIVE_DEPTH) {
        sectionQueue.push(
          ...enqueueSectionLinks(
            findMaterialSectionLinks(sectionDoc, safeCourseUrl),
            sectionId,
            section.depth + 1,
            queued,
            visited
          ).slice(0, Math.max(0, MAX_SECTIONS_PER_COURSE - visited.size - sectionQueue.length))
        )
      }

      await wait(SECTION_DELAY_MS)
    }

    return indexed
  } finally {
    iframe.remove()
  }
}

async function indexCourseLinks(
  root: Document | HTMLElement,
  courseUrl: string,
  courseId: string,
  parentId: string,
  source: 'user' | 'active',
  now: number
): Promise<number> {
  const nodes: OpalSearchNode[] = []

  for (const link of findMaterialSectionLinks(root, courseUrl)) {
    const href = normalizeAllowedOpalUrl(link.url)
    if (!href || !isIndexableOpalTarget(href) || isOpalUiControlTarget(href, link.title)) continue
    nodes.push({
      id: urlToOpalSearchId(href),
      title: link.title,
      url: href,
      type: 'folder',
      courseId,
      parentId,
      lastVisited: now,
      visitCount: 1,
      source,
      searchText: root instanceof Document ? root.title : document.title
    })
  }

  await upsertOpalSearchNodes(nodes)
  return nodes.length
}

async function indexVisibleFiles(doc: Document, pageNode: OpalSearchNode, source: 'user' | 'active'): Promise<number> {
  const courseId = pageNode.courseId || extractCourseIdFromUrl(pageNode.url)
  const parentId = pageNode.id
  const indexed = new Set<string>()
  const nodes: OpalSearchNode[] = []

  for (const anchor of Array.from(doc.querySelectorAll<HTMLAnchorElement>('a[data-file-name], a[href]'))) {
    const rawHref = anchor.href || anchor.getAttribute('href') || ''
    const href = normalizeAllowedOpalUrl(rawHref)
    if (!href) continue

    const title = readBestLinkTitle(
      {
        'data-file-name': anchor.getAttribute('data-file-name') || undefined,
        download: anchor.getAttribute('download') || undefined,
        title: anchor.getAttribute('title') || undefined,
        'aria-label': anchor.getAttribute('aria-label') || undefined
      },
      anchor.textContent || '',
      rawHref
    )
    if (!title || title.length < 2) continue
    if (!isIndexableOpalTarget(href) || isOpalUiControlTarget(href, title)) continue

    const row = anchor.closest('tr')
    const icon = row?.querySelector<HTMLElement>('span.fonticon, i[class*="icon"], .o_icon')
    const lowerHref = href.toLowerCase()
    const isFolder =
      icon?.classList.contains('icon-folder') ||
      /folder|ordner/i.test(icon?.className || '') ||
      lowerHref.includes('coursenode') ||
      lowerHref.includes('/folder/') ||
      lowerHref.includes('briefcase')
    const titleExtension = inferExtensionFromName(title)
    const fileExtension = inferExtensionFromUrl(href) || titleExtension
    const isFile = Boolean(fileExtension) || anchor.hasAttribute('data-file-name') || isDownloadUrl(href, true)
    if (!isFolder && !isFile) continue

    const id = urlToOpalSearchId(href)
    if (!id || indexed.has(id)) continue
    indexed.add(id)

    const type: OpalSearchNode['type'] = isFile ? 'file' : 'folder'
    nodes.push({
      id,
      title,
      url: href,
      type,
      courseId,
      parentId,
      lastVisited: Date.now(),
      visitCount: 1,
      fileExtension: type === 'file' ? fileExtension : undefined,
      source,
      searchText: doc.title
    })
  }

  await upsertOpalSearchNodes(nodes)
  return nodes.length
}

async function preflightRenderedTarget(url: string, fallbackTitle: string): Promise<RenderPreflight> {
  const safeUrl = normalizeAllowedOpalUrl(url)
  if (!safeUrl) return { kind: 'skip', reason: 'non-OPAL URL' }

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), ACTIVE_FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(safeUrl, {
      credentials: 'include',
      cache: 'no-store',
      signal: controller.signal,
      headers: { Accept: 'text/html,application/xhtml+xml,*/*;q=0.8' }
    })
    const finalUrl = normalizeAllowedOpalUrl(response.url) || safeUrl
    const contentType = response.headers.get('content-type')?.toLowerCase() || ''
    const disposition = response.headers.get('content-disposition') || ''
    controller.abort()

    if (!response.ok) return { kind: 'skip', reason: `preflight HTTP ${response.status}` }

    const fileExtension = inferExtensionFromUrl(finalUrl) || inferExtensionFromName(fallbackTitle)
    const isAttachment = /attachment|filename=/i.test(disposition)
    const isHtml = contentType.includes('text/html') || contentType.includes('application/xhtml+xml')
    const isDownload =
      isAttachment || (fileExtension ? !/html?/i.test(fileExtension) : false) || isDownloadUrl(finalUrl, true)

    if (!isHtml || isDownload) {
      return {
        kind: 'file',
        url: finalUrl,
        title: readFilenameFromDisposition(disposition) || cleanIndexedTitle(fallbackTitle) || finalUrl,
        fileExtension
      }
    }

    return { kind: 'html', url: finalUrl }
  } catch (error) {
    return { kind: 'skip', reason: `preflight failed: ${String(error)}` }
  } finally {
    window.clearTimeout(timeout)
    controller.abort()
  }
}

async function loadFrameDocument(iframe: HTMLIFrameElement, url: string): Promise<Document | null> {
  const safeUrl = normalizeAllowedOpalUrl(url)
  if (!safeUrl) return null

  const loadedPromise = waitForLoad(iframe, ACTIVE_FRAME_LOAD_TIMEOUT_MS)
  iframe.src = safeUrl
  if (!(await loadedPromise)) return null
  await wait(FRAME_SETTLE_DELAY_MS)

  try {
    return iframe.contentDocument
  } catch {
    return null
  }
}

function waitForLoad(iframe: HTMLIFrameElement, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false
    const finish = (value: boolean) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      iframe.removeEventListener('load', onLoad)
      iframe.removeEventListener('error', onError)
      resolve(value)
    }
    const onLoad = () => finish(true)
    const onError = () => finish(false)
    const timer = window.setTimeout(() => finish(false), timeoutMs)
    iframe.addEventListener('load', onLoad)
    iframe.addEventListener('error', onError)
  })
}

async function fetchOpalDocument(url: string): Promise<Document | null> {
  const safeUrl = normalizeAllowedOpalUrl(url)
  if (!safeUrl) return null

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), ACTIVE_FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(safeUrl, {
      credentials: 'include',
      cache: 'no-store',
      signal: controller.signal
    })
    window.clearTimeout(timeout)
    if (!response.ok) return null

    const buffer = await response.arrayBuffer()
    const html = decodeHtmlResponse(buffer, response)
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const base = doc.createElement('base')
    base.href = normalizeAllowedOpalUrl(response.url) || safeUrl
    doc.head.prepend(base)
    return doc
  } catch {
    return null
  } finally {
    window.clearTimeout(timeout)
    controller.abort()
  }
}

function decodeHtmlResponse(buffer: ArrayBuffer, response: Response): string {
  const headerCharset = response.headers
    .get('content-type')
    ?.match(/charset=([^;]+)/i)?.[1]
    ?.trim()
  const initial = decodeWithCharset(buffer, headerCharset || 'utf-8')
  const metaCharset = initial.match(/<meta[^>]+charset=["']?\s*([^"'\s/>]+)/i)?.[1]?.trim()
  if (!metaCharset || metaCharset.toLowerCase() === (headerCharset || 'utf-8').toLowerCase()) return initial
  return decodeWithCharset(buffer, metaCharset)
}

function decodeWithCharset(buffer: ArrayBuffer, charset: string): string {
  try {
    return new TextDecoder(charset).decode(buffer)
  } catch {
    return new TextDecoder('utf-8').decode(buffer)
  }
}

async function computeStructureHash(root: Document | HTMLElement, courseUrl: string): Promise<string> {
  const sections = findMaterialSectionLinks(root, courseUrl).map((link) => ({
    type: 'folder',
    id: urlToOpalSearchId(link.url),
    title: cleanIndexedTitle(link.title)
  }))
  const files = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href], a[data-file-name]'))
    .map((anchor) => {
      const href = normalizeAllowedOpalUrl(anchor.href)
      if (!href) return null
      const title = readBestLinkTitle(
        {
          'data-file-name': anchor.getAttribute('data-file-name') || undefined,
          download: anchor.getAttribute('download') || undefined,
          title: anchor.getAttribute('title') || undefined,
          'aria-label': anchor.getAttribute('aria-label') || undefined
        },
        anchor.textContent || '',
        anchor.href
      )
      if (!title || isOpalUiControlTarget(href, title) || !isDownloadUrl(href, true)) return null
      return { type: 'file', id: urlToOpalSearchId(href), title: cleanIndexedTitle(title) }
    })
    .filter((entry): entry is { type: string; id: string; title: string } => Boolean(entry))

  const stable = [...sections, ...files].sort((a, b) =>
    `${a.type}:${a.id}:${a.title}`.localeCompare(`${b.type}:${b.id}:${b.title}`)
  )
  return hashString(JSON.stringify(stable))
}

async function hashString(value: string): Promise<string> {
  if (!globalThis.crypto?.subtle) return fallbackHashString(value)
  const bytes = new TextEncoder().encode(value)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function fallbackHashString(value: string): string {
  let hash = 5381
  for (let index = 0; index < value.length; index += 1) hash = ((hash << 5) + hash) ^ value.charCodeAt(index)
  return `djb2:${(hash >>> 0).toString(16)}`
}

async function isFreshKnownSection(sectionId: string): Promise<boolean> {
  const existing = await getIndexedOpalSearchNode(sectionId)
  if (!existing?.lastFetchedAt || !existing.structureHash) return false
  return Date.now() - existing.lastFetchedAt < ACTIVE_SECTION_COOLDOWN_MS
}

function findMaterialSectionLinks(root: Document | HTMLElement, courseUrl: string): { url: string; title: string }[] {
  const repoId = /\/RepositoryEntry\/(\d+)/i.exec(courseUrl)?.[1] || ''
  const origin = safeOrigin(courseUrl)
  const seen = new Set<string>()
  const links: { url: string; title: string }[] = []

  const add = (value: string, title: string) => {
    let fullUrl = ''
    try {
      fullUrl = new URL(value, origin).href
    } catch {
      return
    }

    const safeUrl = normalizeAllowedOpalUrl(fullUrl)
    if (!safeUrl || !isIndexableOpalTarget(safeUrl)) return
    if (repoId && !safeUrl.includes(`/RepositoryEntry/${repoId}`)) return
    if (urlToOpalSearchId(safeUrl) === urlToOpalSearchId(courseUrl)) return

    const key = urlToOpalSearchId(safeUrl)
    if (seen.has(key)) return
    const cleanTitle = cleanIndexedTitle(title) || key
    if (isNavigationOnlyTitle(cleanTitle) || isOpalUiControlTarget(safeUrl, cleanTitle)) return
    seen.add(key)
    links.push({ url: safeUrl, title: cleanTitle })
  }

  for (const anchor of Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href]'))) {
    const raw = anchor.getAttribute('href') || ''
    const title = cleanIndexedTitle(
      readBestLinkTitle(
        {
          title: anchor.getAttribute('title') || undefined,
          'aria-label': anchor.getAttribute('aria-label') || undefined
        },
        anchor.textContent || '',
        raw
      )
    )
    if (!raw) continue

    if (!raw.startsWith('javascript:')) {
      const lower = raw.toLowerCase()
      if (lower.includes('/folder/') || lower.includes('/briefcase') || lower.includes('coursenode')) add(raw, title)
    }

    let decoded = raw
    try {
      decoded = decodeURIComponent(raw)
    } catch {
      decoded = raw
    }

    const courseNodeMatch = repoId
      ? new RegExp(`RepositoryEntry\\/${repoId}\\/CourseNode\\/(\\d+)`, 'i').exec(decoded)
      : null
    if (courseNodeMatch) add(`/opal/auth/RepositoryEntry/${repoId}/CourseNode/${courseNodeMatch[1]}`, title)
  }

  for (const link of extractCourseNodeLinks(root, courseUrl)) add(link.url, link.title)
  if (root instanceof Document || root instanceof HTMLElement) {
    const html = root instanceof Document ? root.documentElement.outerHTML : root.outerHTML
    for (const link of extractCourseNodeLinksFromMarkup(html, courseUrl)) add(link.url, link.title)
  }

  return links
}

function enqueueSectionLinks(
  links: Array<{ url: string; title: string }>,
  parentId: string,
  depth: number,
  queued: Set<string>,
  visited = new Set<string>()
): Array<{ url: string; title: string; parentId: string; depth: number }> {
  const result: Array<{ url: string; title: string; parentId: string; depth: number }> = []

  for (const link of links) {
    if (result.length >= MAX_SECTIONS_PER_COURSE) break
    const key = urlToOpalSearchId(link.url)
    if (!key || queued.has(key) || visited.has(key)) continue
    if (isLowValueRenderedSection(link.title, link.url)) continue
    queued.add(key)
    result.push({ ...link, parentId, depth })
  }

  return result
}

function parseBreadcrumbs(doc: Document): BreadcrumbEntry[] {
  return Array.from(
    doc.querySelectorAll<HTMLAnchorElement>('.o_breadcrumb a, nav.breadcrumb a, [class*="breadcrumb"] a')
  )
    .map((anchor) => ({ title: anchor.textContent?.trim() || '', url: normalizeAllowedOpalUrl(anchor.href) || '' }))
    .filter((entry) => entry.title && entry.url && !entry.url.includes('/opal/home'))
}

function readPageTitle(doc: Document): string {
  const heading = doc.querySelector('h1, .o_page_title, [class*="page-title"]')
  return heading?.textContent?.trim() || doc.title.replace(/ [-\u2013\u2014] .*$/, '').trim() || location.pathname
}

function readDocumentTitle(doc: Document): string {
  const heading = doc.querySelector('h1, .o_page_title, [class*="page-title"]')
  return heading?.textContent?.trim() || doc.title.replace(/ [-\u2013\u2014] .*$/, '').trim()
}

function readSectionTitle(doc: Document, fallback: string): string {
  const cleanFallback = cleanIndexedTitle(fallback)
  if (cleanFallback && cleanFallback.length > 3) return cleanFallback

  const crumb = doc
    .querySelector<HTMLElement>(
      '.o_breadcrumb li:last-child, nav.breadcrumb li:last-child, [class*="breadcrumb"] li:last-child'
    )
    ?.textContent?.trim()

  return cleanIndexedTitle(crumb || '') || cleanFallback || readPageTitle(doc)
}

function readActiveCourseTargets(data: Record<string, unknown>): CourseTarget[] {
  const currentUrl = normalizeAllowedOpalUrl(readCurrentCourseUrl())
  const currentTarget =
    currentUrl && !isOpalHomeUrl(currentUrl) && /\/RepositoryEntry\/\d+/i.test(currentUrl)
      ? [{ title: readPageTitle(document), url: currentUrl }]
      : []

  return uniqueCourseTargets([...currentTarget, ...readStoredCourseTargets(data), ...readPortletCourseTargets()])
}

function readStoredCourseTargets(data: Record<string, unknown>): CourseTarget[] {
  return [...readStoredCourses(data.favoriten), ...readStoredCourses(data.meine_kurse)]
    .map((course) => ({
      title: course.title || course.name || '',
      url: normalizeAllowedOpalUrl(course.href || course.link || '') || ''
    }))
    .filter((course) => course.title && course.url && /\/RepositoryEntry\/\d+/i.test(course.url))
}

function readPortletCourseTargets(): CourseTarget[] {
  const portlets = document.querySelectorAll(
    [
      'div[data-portlet-order="Bookmarks"]',
      'div[data-portlet-order="RepositoryPortletStudent"]',
      '.portlet.bookmarks',
      '.portlet.repositoryportletstudent',
      '.portlet.lastusedrepositoryportlet'
    ].join(',')
  )
  const courses: CourseTarget[] = []

  for (const portlet of Array.from(portlets)) {
    for (const anchor of Array.from(portlet.querySelectorAll<HTMLAnchorElement>('a[href*="/RepositoryEntry/"]'))) {
      const url = normalizeAllowedOpalUrl(anchor.href)
      if (!url) continue
      const title = readBestLinkTitle(
        {
          title: anchor.getAttribute('title') || undefined,
          'aria-label': anchor.getAttribute('aria-label') || undefined
        },
        anchor.textContent || '',
        url
      )
      if (title) courses.push({ title, url })
    }
  }

  return courses
}

function readCurrentCourseUrl(): string {
  const breadcrumbs = parseBreadcrumbs(document)
  return breadcrumbs[0]?.url || location.href
}

function uniqueCourseTargets(courses: CourseTarget[]): CourseTarget[] {
  const seen = new Set<string>()
  const unique: CourseTarget[] = []

  for (const course of courses) {
    const key = urlToOpalSearchId(course.url)
    if (!key || seen.has(key)) continue
    seen.add(key)
    unique.push(course)
  }

  return unique
}

function readStoredCourses(value: unknown): OpalStoredCourse[] {
  if (Array.isArray(value)) return value as OpalStoredCourse[]
  if (typeof value !== 'string') return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function readFilenameFromDisposition(disposition: string): string {
  const utfMatch = disposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1].replace(/"/g, '').trim())
    } catch {
      return utfMatch[1].replace(/"/g, '').trim()
    }
  }

  const plainMatch = disposition.match(/filename\s*=\s*"?([^";]+)"?/i)
  return plainMatch?.[1]?.trim() || ''
}

function cleanIndexedTitle(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .replace(/^Zur Navigation\s*>\s*/i, '')
    .replace(/^Zur Navigation$/i, '')
    .trim()
}

function isNavigationOnlyTitle(value: string): boolean {
  return !value || /^Zur Navigation$/i.test(value)
}

function isLowValueRenderedSection(title: string, url: string): boolean {
  const cleanTitle = cleanIndexedTitle(title)
  if (isNavigationOnlyTitle(cleanTitle)) return true
  if (/^(Zum Kursmenü|Zum Inhalt|Kursmenü|Inhalt|Zum KursmenÃƒÂ¼|KursmenÃƒÂ¼)$/i.test(cleanTitle)) return true
  if (isOpalUiControlTarget(url, cleanTitle)) return true
  return false
}

function isOpalHomeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.pathname.replace(/\/$/, '') === '/opal/home'
  } catch {
    return false
  }
}

function safeOrigin(url: string): string {
  try {
    return new URL(url).origin
  } catch {
    return 'https://bildungsportal.sachsen.de'
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
