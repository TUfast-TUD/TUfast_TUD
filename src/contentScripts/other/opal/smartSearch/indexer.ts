import { upsertOpalSearchNodes } from './messages'
import {
  extractCourseIdFromUrl,
  extractCourseNodeLinks,
  inferExtensionFromName,
  inferExtensionFromUrl,
  inferNodeType,
  isDownloadUrl,
  readBestLinkTitle,
  urlToOpalSearchId
} from './opalParser'
import {
  loadSmartSearchSettings,
  OPAL_SMART_SEARCH_ACTIVE_PROGRESS_EVENT,
  OPAL_SMART_SEARCH_ACTIVE_PROGRESS_KEY
} from '../../../../modules/opalSmartSearch/settings'
import type { OpalActiveIndexProgress, OpalSearchNode, OpalStoredCourse } from '../../../../modules/opalSmartSearch/types'
import {
  isIndexableOpalTarget,
  isOpalUiControlTarget,
  normalizeAllowedOpalUrl
} from '../../../../modules/opalSmartSearch/urlPolicy'

const ACTIVE_INDEX_KEY = 'opalSmartSearchActiveIndexRuns'
const ACTIVE_INDEX_COOLDOWN_MS = 6 * 60 * 60 * 1000
const MAX_ACTIVE_COURSES_PER_RUN = 3
const MAX_SECTIONS_PER_COURSE = 16
const MAX_ACTIVE_DEPTH = 3
const MAX_ACTIVE_NAVIGATIONS_PER_COURSE = 10
const COURSE_LOAD_TIMEOUT_MS = 15000
const SECTION_LOAD_TIMEOUT_MS = 10000
const FRAME_SETTLE_DELAY_MS = 350

let activeIndexStarted = false

interface BreadcrumbEntry {
  title: string
  url: string
}

type ActiveIndexProgressUpdate = Partial<Omit<OpalActiveIndexProgress, 'startedAt' | 'updatedAt'>> & {
  startedAt?: number
}

export async function indexCurrentOpalPage(): Promise<void> {
  // Check if current page can be indexed
  const currentUrl = normalizeAllowedOpalUrl(location.href)
  if (!currentUrl) return

  const title = readPageTitle(document)

  if (!title || location.pathname.includes('/opal/home')) return

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
      lastVisited: Date.now(),
      visitCount: 1,
      source: 'user',
      searchText: breadcrumbText
    }
  })
  const parentBreadcrumb = [...breadcrumbNodes].reverse().find((crumb) => crumb.id !== currentId)

  // Index current page and breadcrumb path
  const currentNode: OpalSearchNode = {
    id: currentId,
    title,
    url: currentUrl,
    type: inferNodeType(currentUrl),
    courseId,
    parentId: parentBreadcrumb?.id || null,
    lastVisited: Date.now(),
    visitCount: 1,
    fileExtension: inferExtensionFromUrl(currentUrl),
    source: 'user',
    searchText: breadcrumbText
  }

  await upsertOpalSearchNodes([...breadcrumbNodes, currentNode])
  await indexVisibleFiles(document, currentNode, 'user')
}

export async function bootstrapCoursesFromStorage(): Promise<void> {
  // Add already known OPAL courses from the dashboard storage
  const data = await chrome.storage.local.get(['favoriten', 'meine_kurse'])
  const courses = [...readStoredCourses(data.favoriten), ...readStoredCourses(data.meine_kurse)]
  const seen = new Set<string>()
  const nodes: OpalSearchNode[] = []

  for (const course of courses) {
    const title = course.title || course.name || ''
    const url = normalizeAllowedOpalUrl(course.href || course.link || '') || ''
    const id = urlToOpalSearchId(url)
    if (!title || !url || seen.has(id)) continue
    seen.add(id)

    nodes.push({
      id,
      title,
      url,
      type: 'course',
      courseId: extractCourseIdFromUrl(url),
      parentId: null,
      lastVisited: Date.now(),
      visitCount: 1,
      source: 'user'
    })
  }

  await upsertOpalSearchNodes(nodes)
}

export async function maybeRunActiveIndexing(): Promise<void> {
  // Make sure active indexing only starts once per page
  if (activeIndexStarted) return
  activeIndexStarted = true

  const settings = await loadSmartSearchSettings()
  if (!settings.enabled || !settings.activeIndexing) return

  const data = await chrome.storage.local.get(['favoriten', 'meine_kurse', ACTIVE_INDEX_KEY])
  const courses = [...readStoredCourses(data.favoriten), ...readStoredCourses(data.meine_kurse)]
  const cooldowns = (data[ACTIVE_INDEX_KEY] || {}) as Record<string, number>
  const toIndex = uniqueCourses(courses)
    .filter((course) => course.href || course.link)
    .filter((course) => Date.now() - (cooldowns[course.href || course.link || ''] || 0) > ACTIVE_INDEX_COOLDOWN_MS)
    .slice(0, MAX_ACTIVE_COURSES_PER_RUN)

  const startedAt = Date.now()
  let indexedItems = 0

  if (toIndex.length === 0) {
    await publishActiveIndexProgress({
      status: 'done',
      startedAt,
      totalCourses: 0,
      completedCourses: 0,
      indexedItems: 0
    })
    return
  }

  await publishActiveIndexProgress({
    status: 'running',
    startedAt,
    totalCourses: toIndex.length,
    completedCourses: 0,
    indexedItems
  })

  // Crawl only a few courses per run
  for (const [index, course] of toIndex.entries()) {
    const url = course.href || course.link
    if (!url) continue
    const currentCourseTitle = course.title || course.name || url

    await publishActiveIndexProgress({
      status: 'running',
      startedAt,
      totalCourses: toIndex.length,
      completedCourses: index,
      indexedItems,
      currentCourseTitle
    })

    try {
      await indexCourseViaIframe(url, async (addedItems) => {
        indexedItems += addedItems
        await publishActiveIndexProgress({
          status: 'running',
          startedAt,
          totalCourses: toIndex.length,
          completedCourses: index,
          indexedItems,
          currentCourseTitle
        })
      })
      cooldowns[url] = Date.now()
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
      currentCourseTitle
    })

    await wait(500)
  }

  await publishActiveIndexProgress({
    status: 'done',
    startedAt,
    totalCourses: toIndex.length,
    completedCourses: toIndex.length,
    indexedItems
  })
}

export async function checkAndHighlightIndexedFile(): Promise<void> {
  // Check if the palette asked us to highlight a file after navigation
  const { opalSmartSearchHighlight } = await chrome.storage.local.get(['opalSmartSearchHighlight'])
  const intent = opalSmartSearchHighlight as { title: string; url: string } | undefined
  const targetUrl = intent ? normalizeAllowedOpalUrl(intent.url) : null
  if (!intent || !targetUrl) return

  await chrome.storage.local.remove(['opalSmartSearchHighlight'])

  const highlight = (): boolean => {
    const byName = document.querySelector<HTMLAnchorElement>(`a[data-file-name="${CSS.escape(intent.title)}"]`)
    if (byName && applyHighlight(byName)) return true

    try {
      const targetPath = new URL(targetUrl).pathname
      for (const anchor of Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))) {
        try {
          if (new URL(anchor.href).pathname === targetPath && applyHighlight(anchor)) return true
        } catch {
          // Ignore malformed links.
        }
      }
    } catch {
      return false
    }

    return false
  }

  if (!highlight()) setTimeout(highlight, 800)
}

async function indexCourseViaIframe(courseUrl: string, onIndexedItems?: (addedItems: number) => Promise<void>): Promise<void> {
  // Load course pages in a hidden iframe, so OPAL renders its links
  const normalizedCourseUrl = normalizeAllowedOpalUrl(courseUrl)
  if (!normalizedCourseUrl) return

  const iframe = document.createElement('iframe')
  iframe.style.cssText =
    'position:fixed;width:800px;height:600px;border:0;opacity:0;pointer-events:none;left:-9999px;top:-9999px;'
  iframe.tabIndex = -1
  iframe.setAttribute('aria-hidden', 'true')
  document.body.appendChild(iframe)

  try {
    iframe.src = normalizedCourseUrl
    if (!(await waitForLoad(iframe, COURSE_LOAD_TIMEOUT_MS))) return

    const doc = iframe.contentDocument
    if (!doc) return

    const courseId = extractCourseIdFromUrl(normalizedCourseUrl)
    const pageTitle = doc.title.replace(/ [-\u2013\u2014] .*$/, '').trim()
    const courseNode: OpalSearchNode = {
      id: urlToOpalSearchId(normalizedCourseUrl),
      title: pageTitle || normalizedCourseUrl,
      url: normalizedCourseUrl,
      type: 'course',
      courseId,
      parentId: null,
      lastVisited: Date.now(),
      visitCount: 1,
      source: 'active'
    }
    if (pageTitle) {
      await upsertOpalSearchNodes([courseNode])
      await onIndexedItems?.(1)
    }

    // Walk through visible course sections with hard limits
    const queued = new Set<string>([courseNode.id])
    const visited = new Set<string>()
    const sectionQueue = enqueueSectionLinks(
      findMaterialSectionLinks(doc, normalizedCourseUrl),
      courseNode.id,
      1,
      queued
    )
    let navigations = 0

    while (
      sectionQueue.length > 0 &&
      visited.size < MAX_SECTIONS_PER_COURSE &&
      navigations < MAX_ACTIVE_NAVIGATIONS_PER_COURSE
    ) {
      const section = sectionQueue.shift()
      if (!section) break
      const sectionUrl = normalizeAllowedOpalUrl(section.url)
      if (!sectionUrl) continue
      const sectionId = urlToOpalSearchId(sectionUrl)
      if (!sectionId || visited.has(sectionId)) continue
      visited.add(sectionId)

      iframe.src = section.url
      if (!(await waitForLoad(iframe, SECTION_LOAD_TIMEOUT_MS))) continue
      if (!iframe.contentDocument) continue
      navigations += 1

      await wait(FRAME_SETTLE_DELAY_MS)

      const sectionNode: OpalSearchNode = {
        id: sectionId,
        title: readSectionTitle(iframe.contentDocument, section.title),
        url: sectionUrl,
        type: 'folder',
        courseId,
        parentId: section.parentId,
        lastVisited: Date.now(),
        visitCount: 1,
        source: 'active',
        searchText: pageTitle
      }

      await upsertOpalSearchNodes([sectionNode])
      await onIndexedItems?.(1)
      const indexedFiles = await indexVisibleFiles(iframe.contentDocument, sectionNode, 'active')
      if (indexedFiles > 0) await onIndexedItems?.(indexedFiles)

      if (section.depth < MAX_ACTIVE_DEPTH) {
        const childSections = enqueueSectionLinks(
          findMaterialSectionLinks(iframe.contentDocument, normalizedCourseUrl),
          sectionId,
          section.depth + 1,
          queued,
          visited
        ).slice(0, Math.max(0, MAX_SECTIONS_PER_COURSE - visited.size - sectionQueue.length))
        sectionQueue.push(...childSections)
      }

      await wait(300)
    }
  } finally {
    iframe.remove()
  }
}

async function indexVisibleFiles(doc: Document, pageNode: OpalSearchNode, source: 'user' | 'active'): Promise<number> {
  // Index visible folders first
  const courseId = pageNode.courseId || extractCourseIdFromUrl(pageNode.url)
  const parentId = pageNode.id
  const indexed = new Set<string>()
  const nodes: OpalSearchNode[] = []

  for (const section of findMaterialSectionLinks(doc, pageNode.url)) {
    nodes.push({
      id: urlToOpalSearchId(section.url),
      title: section.title,
      url: section.url,
      type: 'folder',
      courseId,
      parentId,
      lastVisited: Date.now(),
      visitCount: 1,
      source,
      searchText: doc.title
    })
  }

  // Then index visible files and file-like OPAL links
  for (const anchor of Array.from(doc.querySelectorAll<HTMLAnchorElement>('a[data-file-name], a[href]'))) {
    const href = normalizeAllowedOpalUrl(anchor.href)
    if (!href) continue

    const title = readBestLinkTitle(
      {
        'data-file-name': anchor.getAttribute('data-file-name') || undefined,
        download: anchor.getAttribute('download') || undefined,
        title: anchor.getAttribute('title') || undefined,
        'aria-label': anchor.getAttribute('aria-label') || undefined
      },
      anchor.textContent || '',
      href
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

    // OPAL sometimes exposes files through folder-looking URLs
    const type = fileExtension ? 'file' : isFolder ? 'folder' : 'file'

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

async function publishActiveIndexProgress(update: ActiveIndexProgressUpdate): Promise<void> {
  const data = await chrome.storage.local.get([OPAL_SMART_SEARCH_ACTIVE_PROGRESS_KEY])
  const previous = data[OPAL_SMART_SEARCH_ACTIVE_PROGRESS_KEY] as OpalActiveIndexProgress | undefined
  const progress: OpalActiveIndexProgress = {
    status: update.status || previous?.status || 'idle',
    startedAt: update.startedAt || previous?.startedAt || Date.now(),
    updatedAt: Date.now(),
    totalCourses: update.totalCourses ?? previous?.totalCourses ?? 0,
    completedCourses: update.completedCourses ?? previous?.completedCourses ?? 0,
    indexedItems: update.indexedItems ?? previous?.indexedItems ?? 0,
    currentCourseTitle: update.currentCourseTitle
  }

  await chrome.storage.local.set({ [OPAL_SMART_SEARCH_ACTIVE_PROGRESS_KEY]: progress })
  window.dispatchEvent(new CustomEvent(OPAL_SMART_SEARCH_ACTIVE_PROGRESS_EVENT, { detail: progress }))
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

function findMaterialSectionLinks(root: Document | HTMLElement, courseUrl: string): { url: string; title: string }[] {
  const repoId = /\/RepositoryEntry\/(\d+)/i.exec(courseUrl)?.[1] || ''
  const origin = safeOrigin(courseUrl)
  const seen = new Set<string>()
  const links: { url: string; title: string }[] = []

  // Add a section link if it belongs to the current course
  const add = (url: string, title: string) => {
    let fullUrl = ''
    try {
      fullUrl = new URL(url, origin).href
    } catch {
      return
    }

    const safeUrl = normalizeAllowedOpalUrl(fullUrl)
    if (!safeUrl) return
    if (!isIndexableOpalTarget(safeUrl)) return
    if (repoId && !safeUrl.includes(`/RepositoryEntry/${repoId}`)) return
    if (urlToOpalSearchId(safeUrl) === urlToOpalSearchId(courseUrl)) return

    const key = urlToOpalSearchId(safeUrl)
    if (seen.has(key)) return
    const cleanTitle = cleanIndexedTitle(title) || key
    if (isNavigationOnlyTitle(cleanTitle)) return
    if (isOpalUiControlTarget(safeUrl, cleanTitle)) return
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
  if (/^(Zum Kursmen\u00fc|Zum Inhalt|Kursmen\u00fc|Inhalt|Zum KursmenÃ¼|KursmenÃ¼)$/i.test(cleanTitle)) return true
  if (isOpalUiControlTarget(url, cleanTitle)) return true
  return false
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

function uniqueCourses(courses: OpalStoredCourse[]): OpalStoredCourse[] {
  const seen = new Set<string>()
  return courses.filter((course) => {
    const url = course.href || course.link || ''
    if (!url || seen.has(url)) return false
    seen.add(url)
    return true
  })
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

function applyHighlight(anchor: HTMLAnchorElement): boolean {
  const target = anchor.closest('tr') || anchor.parentElement
  if (!target) return false

  target.classList.add('tufast-smart-search-highlight')
  target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  window.setTimeout(() => target.classList.remove('tufast-smart-search-highlight'), 3500)
  return true
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
