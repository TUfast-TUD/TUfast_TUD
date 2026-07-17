import {
  claimActiveIndexJob,
  commitActiveIndexedCourse,
  pruneIndexedOpalCourse,
  upsertOpalSearchNodes
} from './messages'
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
import { loadSmartSearchSettings, SmartSearchKey } from '../../../../modules/opalSmartSearch/settings'
import type {
  OpalActiveIndexProgress,
  OpalSearchNode,
  OpalStoredCourse
} from '../../../../modules/opalSmartSearch/types'
import {
  readStoredCourses,
  readStoredCourseTitle,
  readStoredCourseUrl
} from '../../../../modules/opalSmartSearch/storedCourses'
import {
  isIndexableOpalTarget,
  isOpalLoginUrl,
  isOpalUiControlTarget,
  isOpalTargetInRepositoryScope,
  isSameOpalRepository,
  normalizeAllowedOpalUrl
} from '../../../../modules/opalSmartSearch/urlPolicy'

const ACTIVE_INDEX_COOLDOWN_MS = 6 * 60 * 60 * 1000
// OPAL courses can expose 25+ weekly exercise nodes; the time budget below remains the real safety brake.
const MAX_SECTIONS_PER_COURSE = 64
// OPAL material folders can be nested a few levels deep; raise this if real courses hide files deeper.
const MAX_ACTIVE_DEPTH = 4
const MAX_ACTIVE_RENDER_NAVIGATIONS = 64
const ACTIVE_COURSE_TIME_BUDGET_MS = 5 * 60 * 1000
const ACTIVE_FETCH_TIMEOUT_MS = 10000
const ACTIVE_FRAME_LOAD_TIMEOUT_MS = 12000
const FRAME_SETTLE_DELAY_MS = 350
const SECTION_DELAY_MS = 80

let activeIndexPromise: Promise<void> | null = null
let activeJobStartedAt = 0

interface BreadcrumbEntry {
  title: string
  url: string
}

interface CourseTarget {
  title: string
  url: string
}

interface CourseIndexResult {
  indexedItems: number
  complete: boolean
}

interface MaterialLink {
  url: string
  title: string
  type: 'folder' | 'file'
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
  if (breadcrumbs.length === 0 && !/\/(?:RepositoryEntry|FolderResource|CourseNode)\//i.test(currentUrl)) return
  const courseId =
    breadcrumbs.length > 0 ? extractCourseIdFromUrl(breadcrumbs[0].url) : extractCourseIdFromUrl(currentUrl)
  const currentId = urlToOpalSearchId(currentUrl)
  const breadcrumbNodes = breadcrumbs.map((crumb, index): OpalSearchNode => {
    const id = urlToOpalSearchId(crumb.url)
    return {
      id,
      title: crumb.title,
      url: crumb.url,
      type:
        index === 0
          ? 'course'
          : inferExtensionFromUrl(crumb.url) || inferExtensionFromName(crumb.title)
            ? 'file'
            : inferNodeType(crumb.url),
      courseId,
      parentId: index > 0 ? urlToOpalSearchId(breadcrumbs[index - 1].url) : null,
      lastVisited: now,
      visitCount: 0,
      source: 'user'
    }
  })
  const parentBreadcrumb = [...breadcrumbNodes].reverse().find((crumb) => crumb.id !== currentId)
  const currentNode: OpalSearchNode = {
    id: currentId,
    title,
    url: currentUrl,
    type: inferExtensionFromUrl(currentUrl) || inferExtensionFromName(title) ? 'file' : inferNodeType(currentUrl),
    courseId,
    parentId: parentBreadcrumb?.id || null,
    lastVisited: now,
    visitCount: 1,
    fileExtension: inferExtensionFromUrl(currentUrl) || inferExtensionFromName(title),
    source: 'user'
  }

  await upsertOpalSearchNodes([...breadcrumbNodes, currentNode])
  await indexCourseLinks(document, currentUrl, courseId, currentId, 'user', now)
  await indexVisibleFiles(document, currentNode, 'user')
}

export async function bootstrapCoursesFromStorage(): Promise<void> {
  const data = await chrome.storage.local.get(['favoriten', 'meine_kurse'])
  const nodes = readBootstrapCourseTargets(data)
    .map(
      ({ title, url }): OpalSearchNode => ({
        id: urlToOpalSearchId(url),
        title,
        url,
        type: 'course',
        courseId: extractCourseIdFromUrl(url),
        parentId: null,
        lastVisited: Date.now(),
        visitCount: 0,
        source: 'user'
      })
    )
    .filter((node) => node.id && node.title && node.url)

  await upsertOpalSearchNodes(nodes)
}

export function maybeRunActiveIndexing(): Promise<void> {
  if (activeIndexPromise) return activeIndexPromise

  activeIndexPromise = runActiveIndexing()
    .catch((error) => handleActiveIndexFailure(error, activeJobStartedAt))
    .finally(() => {
      activeJobStartedAt = 0
      activeIndexPromise = null
    })
  return activeIndexPromise
}

async function runActiveIndexing(): Promise<void> {
  const settings = await loadSmartSearchSettings()
  if (!settings.enabled) return

  const data = await chrome.storage.local.get([
    'favoriten',
    'meine_kurse',
    SmartSearchKey.activeProgress,
    SmartSearchKey.activeRuns
  ])
  const previousProgress = data[SmartSearchKey.activeProgress] as OpalActiveIndexProgress | undefined
  const cooldowns = (data[SmartSearchKey.activeRuns] || {}) as Record<string, number>
  const toIndex = readActiveCourseTargets(data).filter(
    (course) => Date.now() - (cooldowns[course.url] || 0) > ACTIVE_INDEX_COOLDOWN_MS
  )
  const startedAt = Number(previousProgress?.startedAt || Date.now())
  if (!(await isActiveIndexingRequested(startedAt))) return
  activeJobStartedAt = startedAt
  let indexedItems = previousProgress?.indexedItems || 0
  let completedCourses = previousProgress?.completedCourses || 0
  let failedCourses = previousProgress?.failedCourses || 0
  const totalCourses = Math.max(previousProgress?.totalCourses || 0, completedCourses + failedCourses + toIndex.length)
  let cancelled = false

  await publishActiveIndexProgress({
    status: toIndex.length === 0 ? (failedCourses > 0 ? 'failed' : 'done') : 'running',
    startedAt,
    totalCourses,
    completedCourses,
    failedCourses,
    indexedItems
  })

  for (const course of toIndex) {
    if (!(await isActiveIndexingRequested(startedAt))) {
      cancelled = true
      break
    }

    await publishActiveIndexProgress({
      status: 'running',
      startedAt,
      totalCourses,
      completedCourses,
      failedCourses,
      indexedItems,
      currentCourseTitle: course.title
    })

    try {
      const courseStartItems = indexedItems
      const courseStartedAt = Date.now()
      const result = await indexSingleCourse(course, startedAt, async (addedItems) => {
        indexedItems += addedItems
        await publishActiveIndexProgress({
          status: 'running',
          startedAt,
          totalCourses,
          completedCourses,
          failedCourses,
          indexedItems,
          currentCourseTitle: course.title
        })
      })
      indexedItems = Math.max(indexedItems, courseStartItems + result.indexedItems)
      if (!(await isActiveIndexingRequested(startedAt))) {
        cancelled = true
        break
      }
      if (result.complete) {
        try {
          await pruneIndexedOpalCourse(extractCourseIdFromUrl(course.url), courseStartedAt, startedAt)
        } catch (error) {
          // A failed prune only leaves stale nodes for the next crawl — it must not fail the indexed course.
          console.warn('[TUfast Smart Search] Pruning stale course nodes failed:', error)
        }
      }
      const committed = await commitActiveIndexedCourse(course.url, startedAt, result.complete)
      completedCourses = committed.completedCourses
      failedCourses = committed.failedCourses
    } catch (error) {
      if (!(await isActiveIndexingRequested(startedAt))) {
        cancelled = true
        break
      }
      const committed = await commitActiveIndexedCourse(course.url, startedAt, false)
      completedCourses = committed.completedCourses
      failedCourses = committed.failedCourses
      console.warn('[TUfast Smart Search] Active indexing skipped course:', error)
    }

    await publishActiveIndexProgress({
      status: 'running',
      startedAt,
      totalCourses,
      completedCourses,
      failedCourses,
      indexedItems,
      currentCourseTitle: course.title
    })

    await wait(SECTION_DELAY_MS)
  }

  if (!cancelled) {
    await publishActiveIndexProgress({
      status: failedCourses > 0 ? 'failed' : 'done',
      startedAt,
      totalCourses,
      completedCourses,
      failedCourses,
      indexedItems
    })
  }
}

export async function startActiveIndexing(): Promise<void> {
  if (!canRunActiveIndexingOnCurrentPage()) throw new Error('OPAL is not ready for active indexing yet')
  const data = await chrome.storage.local.get([SmartSearchKey.activeProgress])
  const progress = data[SmartSearchKey.activeProgress] as OpalActiveIndexProgress | undefined
  if (!progress || progress.status !== 'running') return

  try {
    await bootstrapCoursesFromStorage()
    maybeRunActiveIndexing().catch(handleActiveIndexFailure)
  } catch (error) {
    await handleActiveIndexFailure(error, progress.startedAt)
    throw error
  }
}

export function canRunActiveIndexingOnCurrentPage(): boolean {
  return !isOpalLoginUrl(location.href)
}

export async function handleActiveIndexFailure(error: unknown, jobStartedAt = activeJobStartedAt): Promise<void> {
  console.warn('[TUfast Smart Search] Active indexing failed:', error)
  const data = await chrome.storage.local.get([SmartSearchKey.activeProgress])
  const progress = data[SmartSearchKey.activeProgress] as OpalActiveIndexProgress | undefined
  if (jobStartedAt && progress?.status === 'running' && progress.startedAt === jobStartedAt) {
    await publishActiveIndexProgress({ status: 'failed', startedAt: jobStartedAt })
  }
}

async function indexSingleCourse(
  course: CourseTarget,
  jobStartedAt: number,
  onProgress?: (addedItems: number) => Promise<void>
): Promise<CourseIndexResult> {
  const safeCourseUrl = normalizeAllowedOpalUrl(course.url)
  if (!safeCourseUrl) return { indexedItems: 0, complete: false }

  // The rendered pass sees OPAL's script-built tables, so keep the fetch parser as a fallback only.
  const rendered = await indexRenderedCourse(course, jobStartedAt, onProgress)
  if (rendered.indexedItems > 1) return rendered

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
      visitCount: 0,
      source: 'active'
    }

    await upsertOpalSearchNodes([courseNode], jobStartedAt)
    let indexed = 1
    indexed += await indexCourseLinks(fetchedDoc, safeCourseUrl, courseId, courseNode.id, 'active', now, jobStartedAt)
    indexed += await indexVisibleFiles(fetchedDoc, courseNode, 'active', jobStartedAt)
    return { indexedItems: indexed, complete: false }
  }

  return rendered
}

async function indexRenderedCourse(
  course: CourseTarget,
  jobStartedAt: number,
  onProgress?: (addedItems: number) => Promise<void>
): Promise<CourseIndexResult> {
  const safeCourseUrl = normalizeAllowedOpalUrl(course.url)
  if (!safeCourseUrl) return { indexedItems: 0, complete: false }

  // OPAL renders some course folders only after its own scripts run, so fetch-only parsing misses them.
  // A hidden same-origin iframe gives those scripts a real document without taking over the user's page.
  const iframe = document.createElement('iframe')
  iframe.dataset.tufastSmartSearchActiveIndexer = 'true'
  iframe.setAttribute('aria-hidden', 'true')
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms')
  iframe.tabIndex = -1
  iframe.style.cssText =
    'position:fixed;width:960px;height:720px;border:0;opacity:0;pointer-events:none;left:-12000px;top:-12000px;'
  document.documentElement.appendChild(iframe)

  try {
    const coursePreflight = await preflightRenderedTarget(safeCourseUrl, course.title, safeCourseUrl)
    if (coursePreflight.kind !== 'html') return { indexedItems: 0, complete: false }

    let courseDoc = await loadFrameDocument(iframe, coursePreflight.url, safeCourseUrl)
    if (!courseDoc) return { indexedItems: 0, complete: false }
    const coursePager = await expandRenderedPager(iframe, courseDoc, safeCourseUrl)
    courseDoc = coursePager.doc

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
      visitCount: 0,
      source: 'active'
    }

    await upsertOpalSearchNodes([courseNode], jobStartedAt)
    indexed += 1
    await onProgress?.(1)
    const courseLinks = await indexCourseLinks(
      courseDoc,
      safeCourseUrl,
      courseId,
      courseRootId,
      'active',
      now,
      jobStartedAt
    )
    const courseFiles = await indexVisibleFiles(courseDoc, courseNode, 'active', jobStartedAt)
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
    let truncated = !coursePager.expanded

    while (sectionQueue.length > 0 && visited.size < MAX_SECTIONS_PER_COURSE) {
      if (!(await isActiveIndexingRequested(jobStartedAt))) throw new Error('SmartSearch improvement cancelled')
      if (Date.now() - startedAt > ACTIVE_COURSE_TIME_BUDGET_MS) break
      if (renderedNavigations >= MAX_ACTIVE_RENDER_NAVIGATIONS) break

      const section = sectionQueue.shift()
      if (!section) break
      const sectionUrl = normalizeAllowedOpalUrl(section.url)
      if (!sectionUrl) {
        truncated = true
        continue
      }
      const sectionId = urlToOpalSearchId(sectionUrl)
      if (!sectionId) {
        truncated = true
        continue
      }
      if (visited.has(sectionId)) continue
      visited.add(sectionId)

      const preflight = await preflightRenderedTarget(sectionUrl, section.title, safeCourseUrl)
      if (preflight.kind === 'file') {
        const fileNode: OpalSearchNode = {
          id: urlToOpalSearchId(preflight.url),
          title: preflight.title,
          url: preflight.url,
          type: 'file',
          courseId,
          parentId: section.parentId,
          lastVisited: Date.now(),
          visitCount: 0,
          fileExtension: preflight.fileExtension,
          source: 'active'
        }
        await upsertOpalSearchNodes([fileNode], jobStartedAt)
        indexed += 1
        await onProgress?.(1)
        continue
      }
      if (preflight.kind === 'skip') {
        truncated = true
        continue
      }

      let sectionDoc = await loadFrameDocument(iframe, preflight.url, safeCourseUrl)
      if (!sectionDoc) {
        truncated = true
        continue
      }
      const sectionPager = await expandRenderedPager(iframe, sectionDoc, safeCourseUrl)
      sectionDoc = sectionPager.doc
      if (!sectionPager.expanded) truncated = true
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
        visitCount: 0,
        source: 'active'
      }

      await upsertOpalSearchNodes([sectionNode], jobStartedAt)
      indexed += 1
      const fileLinks = await indexVisibleFiles(sectionDoc, sectionNode, 'active', jobStartedAt)
      indexed += fileLinks
      await onProgress?.(1 + fileLinks)

      const nestedLinks = findMaterialSectionLinks(sectionDoc, safeCourseUrl)
      if (section.depth < MAX_ACTIVE_DEPTH) {
        const children = enqueueSectionLinks(nestedLinks, sectionId, section.depth + 1, queued, visited)
        const availableSlots = Math.max(0, MAX_SECTIONS_PER_COURSE - visited.size - sectionQueue.length)
        if (children.length > availableSlots) truncated = true
        sectionQueue.push(...children.slice(0, availableSlots))
      } else if (enqueueSectionLinks(nestedLinks, sectionId, section.depth + 1, new Set(queued), visited).length > 0) {
        truncated = true
      }

      await wait(SECTION_DELAY_MS)
    }

    return { indexedItems: indexed, complete: sectionQueue.length === 0 && !truncated }
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
  now: number,
  jobStartedAt?: number
): Promise<number> {
  const nodes: OpalSearchNode[] = []

  for (const link of findMaterialSectionLinks(root, courseUrl)) {
    if (link.type === 'file') continue
    const href = normalizeAllowedOpalUrl(link.url)
    if (!href || !isIndexableOpalTarget(href) || isOpalUiControlTarget(href, link.title)) continue
    if (!isOpalTargetInRepositoryScope(courseId, href)) continue
    nodes.push({
      id: urlToOpalSearchId(href),
      title: link.title,
      url: href,
      type: 'folder',
      courseId,
      parentId,
      lastVisited: now,
      visitCount: 0,
      source
    })
  }

  await upsertOpalSearchNodes(nodes, jobStartedAt)
  return nodes.length
}

async function indexVisibleFiles(
  doc: Document,
  pageNode: OpalSearchNode,
  source: 'user' | 'active',
  jobStartedAt?: number
): Promise<number> {
  const courseId = pageNode.courseId || extractCourseIdFromUrl(pageNode.url)
  const parentId = pageNode.id
  const indexed = new Set<string>()
  const nodes: OpalSearchNode[] = []

  for (const anchor of Array.from(doc.querySelectorAll<HTMLAnchorElement>('a[data-file-name], a[href]'))) {
    const rawHref = readAnchorUrl(anchor)
    if (!rawHref) continue
    const href = normalizeAllowedOpalUrl(rawHref)
    if (!href) continue
    if (!isOpalTargetInRepositoryScope(courseId, href)) continue

    const title = readBestLinkTitle(
      {
        'data-file-name': anchor.getAttribute('data-file-name') || undefined,
        download: anchor.getAttribute('download') || undefined,
        title: anchor.getAttribute('title') || undefined,
        'aria-label': anchor.getAttribute('aria-label') || undefined
      },
      anchor.textContent ?? '',
      rawHref
    )
    if (!title || title.length < 2) continue
    if (!isIndexableOpalTarget(href) || isOpalUiControlTarget(href, title)) continue

    const row = anchor.closest('tr')
    const icon = row?.querySelector<HTMLElement>('span.fonticon, i[class*="icon"], .o_icon')
    const lowerHref = href.toLowerCase()
    const titleExtension = inferExtensionFromName(title)
    const fileExtension = inferExtensionFromUrl(href) || titleExtension
    const isFile = Boolean(fileExtension) || anchor.hasAttribute('data-file-name') || isDownloadUrl(href, true)
    // OPAL file URLs also live below CourseNode paths, so explicit file signals must win over folder hints.
    const isFolder =
      !isFile &&
      Boolean(
        icon?.classList.contains('icon-folder') ||
          /folder|ordner/i.test(String(icon?.className ?? '')) ||
          lowerHref.includes('coursenode') ||
          lowerHref.includes('/folder/') ||
          lowerHref.includes('briefcase')
      )
    // Folder links are queued by `findMaterialSectionLinks`; indexing them here re-parents OPAL side navigation.
    if (isFolder || !isFile) continue

    const id = urlToOpalSearchId(href)
    if (!id || id === parentId || indexed.has(id)) continue
    indexed.add(id)

    nodes.push({
      id,
      title,
      url: href,
      type: 'file',
      courseId,
      parentId,
      lastVisited: Date.now(),
      visitCount: 0,
      fileExtension,
      source
    })
  }

  // Wicket sometimes keeps the real file URL only in onclick/data markup, outside the anchor href.
  for (const link of findMaterialSectionLinks(doc, pageNode.url)) {
    if (link.type !== 'file') continue
    const href = normalizeAllowedOpalUrl(link.url)
    const id = href ? urlToOpalSearchId(href) : ''
    if (!href || !id || id === parentId || indexed.has(id) || !isOpalTargetInRepositoryScope(courseId, href)) continue
    indexed.add(id)
    nodes.push({
      id,
      title: link.title,
      url: href,
      type: 'file',
      courseId,
      parentId,
      lastVisited: Date.now(),
      visitCount: 0,
      fileExtension: inferExtensionFromUrl(href) || inferExtensionFromName(link.title),
      source
    })
  }

  await upsertOpalSearchNodes(nodes, jobStartedAt)
  return nodes.length
}

async function preflightRenderedTarget(
  url: string,
  fallbackTitle: string,
  repositoryScope: string
): Promise<RenderPreflight> {
  const safeUrl = normalizeAllowedOpalUrl(url)
  if (!safeUrl) return { kind: 'skip', reason: 'non-OPAL URL' }
  if (!isSameOpalRepository(repositoryScope, safeUrl)) return { kind: 'skip', reason: 'foreign OPAL course' }

  const knownFileExtension = inferExtensionFromUrl(safeUrl) || inferExtensionFromName(fallbackTitle)
  if (knownFileExtension && !/html?/i.test(knownFileExtension)) {
    return {
      kind: 'file',
      url: safeUrl,
      title: cleanIndexedTitle(fallbackTitle) || safeUrl,
      fileExtension: knownFileExtension
    }
  }

  // Some OPAL folder links redirect straight to downloads. Check headers before putting them in the iframe,
  // otherwise a background crawl can accidentally trigger browser download UI.
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), ACTIVE_FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(safeUrl, {
      credentials: 'include',
      cache: 'no-store',
      signal: controller.signal,
      headers: { Accept: 'text/html,application/xhtml+xml,*/*;q=0.8' }
    })
    const finalUrl = normalizeAllowedOpalUrl(response.url) ?? safeUrl
    if (!isSameOpalRepository(repositoryScope, finalUrl)) return { kind: 'skip', reason: 'foreign OPAL course' }
    const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
    const disposition = response.headers.get('content-disposition') ?? ''
    controller.abort()

    if (!response.ok) return { kind: 'skip', reason: `preflight HTTP ${response.status}` }

    const fileExtension = inferExtensionFromUrl(finalUrl) || inferExtensionFromName(fallbackTitle)
    const isAttachment = /attachment|filename=/i.test(disposition)
    const isHtml = contentType.includes('text/html') || contentType.includes('application/xhtml+xml')
    const isDownload =
      isAttachment || (fileExtension ? !/html?/i.test(fileExtension) : false) || isDownloadUrl(finalUrl, true)

    if (!isHtml || isDownload) {
      const dispositionTitle = readFilenameFromDisposition(disposition)
      const cleanFallbackTitle = cleanIndexedTitle(fallbackTitle)
      let title = dispositionTitle ?? cleanFallbackTitle
      if (!title) title = finalUrl
      return {
        kind: 'file',
        url: finalUrl,
        title,
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

async function loadFrameDocument(
  iframe: HTMLIFrameElement,
  url: string,
  repositoryScope: string
): Promise<Document | null> {
  const safeUrl = normalizeAllowedOpalUrl(url)
  if (!safeUrl) return null
  if (!isSameOpalRepository(repositoryScope, safeUrl)) return null

  const loadedPromise = waitForLoad(iframe, ACTIVE_FRAME_LOAD_TIMEOUT_MS)
  iframe.src = safeUrl
  if (!(await loadedPromise)) return null
  await wait(FRAME_SETTLE_DELAY_MS)

  try {
    const iframeUrl = iframe.contentWindow?.location.href
    const finalUrl = iframeUrl ? normalizeAllowedOpalUrl(iframeUrl) : null
    if (!finalUrl || !isSameOpalRepository(repositoryScope, finalUrl)) return null
    return iframe.contentDocument
  } catch {
    return null
  }
}

async function expandRenderedPager(
  iframe: HTMLIFrameElement,
  doc: Document,
  repositoryScope: string
): Promise<{ doc: Document; expanded: boolean }> {
  // OPAL pager ids are Wicket-generated and labels are localized; `.pager-showall` is the stable hook.
  const showAll = doc.querySelector<HTMLAnchorElement>('a.pager-showall, .pager-showall a, a[class*="pager-showall"]')
  if (!showAll) return { doc, expanded: doc.querySelectorAll('li.page').length <= 1 }

  const before = readRenderedContentSignature(doc)
  const beforeItems = readRenderedMaterialCount(doc)
  const settled = waitForFrameLoadOrContentChange(iframe, doc, before, ACTIVE_FRAME_LOAD_TIMEOUT_MS)

  try {
    if (showAll.target && showAll.target !== '_self') showAll.target = '_self'
    showAll.click()
    const changed = await settled
    await wait(FRAME_SETTLE_DELAY_MS)
    const expandedDoc = iframe.contentDocument || doc
    const finalUrl = normalizeAllowedOpalUrl(iframe.contentWindow?.location.href || '')
    const showAllGone = !expandedDoc.querySelector('a.pager-showall, .pager-showall a, a[class*="pager-showall"]')
    const numberedPagerGone = expandedDoc.querySelectorAll('li.page').length <= 1
    const validFinalUrl = Boolean(
      finalUrl && !isOpalLoginUrl(finalUrl) && isSameOpalRepository(repositoryScope, finalUrl)
    )
    return {
      doc: validFinalUrl ? expandedDoc : doc,
      expanded: Boolean(
        changed &&
          validFinalUrl &&
          (showAllGone || (numberedPagerGone && readRenderedMaterialCount(expandedDoc) > beforeItems))
      )
    }
  } catch {
    return { doc, expanded: false }
  }
}

function waitForFrameLoadOrContentChange(
  iframe: HTMLIFrameElement,
  doc: Document,
  beforeSignature: string,
  timeoutMs: number
): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false
    let observer: MutationObserver | null = null

    const finish = (changed: boolean) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      iframe.removeEventListener('load', onLoad)
      observer?.disconnect()
      resolve(changed)
    }

    const onLoad = () => finish(true)
    const timer = window.setTimeout(() => finish(false), timeoutMs)
    iframe.addEventListener('load', onLoad)

    observer = new MutationObserver(() => {
      const currentDoc = iframe.contentDocument || doc
      if (currentDoc !== doc || readRenderedContentSignature(currentDoc) !== beforeSignature) finish(true)
    })
    observer.observe(doc.documentElement, { childList: true, subtree: true, characterData: true })
  })
}

function readRenderedContentSignature(doc: Document): string {
  return [
    doc.querySelectorAll('a[href], a[data-file-name]').length,
    doc.querySelectorAll('tr, .content-preview, li.page').length,
    doc.body?.textContent?.length || 0
  ].join(':')
}

function readRenderedMaterialCount(doc: Document): number {
  return doc.querySelectorAll('tr, .content-preview, a[data-file-name], a[download], a[href*="CourseNode"]').length
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
    // Parsed documents do not inherit response.url, but OPAL uses many relative links.
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

function findMaterialSectionLinks(root: Document | HTMLElement, courseUrl: string): MaterialLink[] {
  const repoId = /\/RepositoryEntry\/(\d+)/i.exec(courseUrl)?.[1]
  const origin = safeOrigin(courseUrl)
  const seen = new Map<string, number>()
  const links: MaterialLink[] = []

  const add = (value: string, title: string) => {
    let fullUrl: string
    try {
      fullUrl = new URL(value, origin).href
    } catch {
      return
    }

    const safeUrl = normalizeAllowedOpalUrl(fullUrl)
    if (!safeUrl || !isIndexableOpalTarget(safeUrl)) return
    if (repoId && !isSameOpalRepository(courseUrl, safeUrl)) return
    if (urlToOpalSearchId(safeUrl) === urlToOpalSearchId(courseUrl)) return

    const key = urlToOpalSearchId(safeUrl)
    const cleanTitle = cleanIndexedTitle(title) || key
    if (isNavigationOnlyTitle(cleanTitle) || isOpalUiControlTarget(safeUrl, cleanTitle)) return
    const link: MaterialLink = {
      url: safeUrl,
      title: cleanTitle,
      type:
        inferExtensionFromUrl(safeUrl) || inferExtensionFromName(cleanTitle) || isDownloadUrl(safeUrl, true)
          ? 'file'
          : 'folder'
    }
    const existingIndex = seen.get(key)
    if (existingIndex !== undefined) {
      if (link.type === 'file') links[existingIndex] = link
      return
    }
    seen.set(key, links.length)
    links.push(link)
  }

  for (const anchor of Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href]'))) {
    const raw = anchor.getAttribute('href')
    if (!raw) continue
    const title = cleanIndexedTitle(
      readBestLinkTitle(
        {
          'data-file-name': anchor.getAttribute('data-file-name') || undefined,
          download: anchor.getAttribute('download') || undefined,
          title: anchor.getAttribute('title') || undefined,
          'aria-label': anchor.getAttribute('aria-label') || undefined
        },
        anchor.textContent ?? '',
        raw
      )
    )

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
  links: MaterialLink[],
  parentId: string,
  depth: number,
  queued: Set<string>,
  visited = new Set<string>()
): Array<MaterialLink & { parentId: string; depth: number }> {
  const result: Array<MaterialLink & { parentId: string; depth: number }> = []

  for (const link of links) {
    if (link.type === 'file') continue
    const key = urlToOpalSearchId(link.url)
    if (!key || queued.has(key) || visited.has(key)) continue
    if (isLowValueRenderedSection(link.title, link.url)) continue
    queued.add(key)
    result.push({ ...link, parentId, depth })
  }

  return result
}

function parseBreadcrumbs(doc: Document): BreadcrumbEntry[] {
  const entries = Array.from(
    doc.querySelectorAll<HTMLAnchorElement>('.o_breadcrumb a, nav.breadcrumb a, [class*="breadcrumb"] a')
  ).map((anchor) => ({ title: anchor.textContent?.trim() ?? '', url: normalizeAllowedOpalUrl(anchor.href) }))

  return entries.filter((entry): entry is BreadcrumbEntry =>
    Boolean(entry.title && entry.url && !entry.url.includes('/opal/home'))
  )
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

  const cleanCrumb = crumb ? cleanIndexedTitle(crumb) : ''
  if (cleanCrumb) return cleanCrumb
  if (cleanFallback) return cleanFallback
  return readPageTitle(doc)
}

function readActiveCourseTargets(data: Record<string, unknown>): CourseTarget[] {
  const favoriteTargets = uniqueCourseTargets(readFavoriteCourseTargets(data))
  if (favoriteTargets.length > 0) return favoriteTargets

  const currentUrl = normalizeAllowedOpalUrl(readCurrentCourseUrl())
  const currentTarget =
    currentUrl && !isOpalHomeUrl(currentUrl) && /\/RepositoryEntry\/\d+/i.test(currentUrl)
      ? [{ title: readPageTitle(document), url: currentUrl }]
      : []

  return uniqueCourseTargets([...currentTarget, ...readStoredCourseTargets(data), ...readPortletCourseTargets()])
}

function readFavoriteCourseTargets(data: Record<string, unknown>): CourseTarget[] {
  return readCourseTargets(readStoredCourses(data.favoriten))
}

function readBootstrapCourseTargets(data: Record<string, unknown>): CourseTarget[] {
  const favoriteTargets = readFavoriteCourseTargets(data)
  return favoriteTargets.length > 0 ? favoriteTargets : readStoredCourseTargets(data)
}

function readStoredCourseTargets(data: Record<string, unknown>): CourseTarget[] {
  return readCourseTargets([...readStoredCourses(data.favoriten), ...readStoredCourses(data.meine_kurse)])
}

function readCourseTargets(courses: OpalStoredCourse[]): CourseTarget[] {
  return courses
    .map(readStoredCourseTarget)
    .filter((course): course is CourseTarget => Boolean(course && /\/RepositoryEntry\/\d+/i.test(course.url)))
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
        anchor.textContent ?? '',
        url
      )
      if (title) courses.push({ title, url })
    }
  }

  return courses
}

function readCurrentCourseUrl(): string {
  const breadcrumbs = parseBreadcrumbs(document)
  return breadcrumbs[0]?.url ?? location.href
}

function readStoredCourseTarget(course: OpalStoredCourse): CourseTarget | null {
  const title = readStoredCourseTitle(course)
  const url = readStoredCourseUrl(course)

  return title && url ? { title, url } : null
}

function readAnchorUrl(anchor: HTMLAnchorElement): string | undefined {
  const hrefAttribute = anchor.getAttribute('href')?.trim()
  if (!hrefAttribute || hrefAttribute === '#' || hrefAttribute.toLowerCase().startsWith('javascript:')) return undefined
  return anchor.href || hrefAttribute
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

function readFilenameFromDisposition(disposition: string): string | undefined {
  const utfMatch = disposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1].replace(/"/g, '').trim())
    } catch {
      return utfMatch[1].replace(/"/g, '').trim()
    }
  }

  const plainMatch = disposition.match(/filename\s*=\s*"?([^";]+)"?/i)
  const filename = plainMatch?.[1]?.trim()
  if (!filename) return undefined
  return filename
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

async function isActiveIndexingRequested(jobStartedAt: number): Promise<boolean> {
  return claimActiveIndexJob(jobStartedAt)
}
