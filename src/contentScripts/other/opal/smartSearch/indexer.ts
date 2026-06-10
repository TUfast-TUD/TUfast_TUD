import { upsertGraphNodes } from './indexDb'
import {
  extractCourseIdFromUrl,
  extractCourseNodeLinksFromMarkup,
  inferExtensionFromName,
  inferExtensionFromUrl,
  inferNodeType,
  isDownloadUrl,
  readBestLinkTitle,
  urlToOpalSearchId
} from './opalParser'
import { loadSmartSearchSettings } from './settings'
import type { OpalSearchNode, OpalStoredCourse } from './types'

const ACTIVE_INDEX_KEY = 'opalSmartSearchActiveIndexRuns'
const ACTIVE_INDEX_COOLDOWN_MS = 6 * 60 * 60 * 1000
const MAX_ACTIVE_COURSES_PER_RUN = 3
const MAX_SECTIONS_PER_COURSE = 16
const COURSE_LOAD_TIMEOUT_MS = 15000
const SECTION_LOAD_TIMEOUT_MS = 10000

let activeIndexStarted = false

interface BreadcrumbEntry {
  title: string
  url: string
}

export async function indexCurrentOpalPage(): Promise<void> {
  if (!location.href.includes('/opal/')) return

  const title =
    document.title.replace(/ [-\u2013\u2014] .*$/, '').trim() || document.querySelector('h1')?.textContent?.trim() || ''

  if (!title || location.pathname.includes('/opal/home')) return

  const breadcrumbs = parseBreadcrumbs(document)
  const breadcrumbText = breadcrumbs.map((crumb) => crumb.title).join(' ')
  const courseId =
    breadcrumbs.length > 0 ? extractCourseIdFromUrl(breadcrumbs[0].url) : extractCourseIdFromUrl(location.href)
  const currentId = urlToOpalSearchId(location.href)
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
  const currentNode: OpalSearchNode = {
    id: currentId,
    title,
    url: location.href,
    type: inferNodeType(location.href),
    courseId,
    parentId: parentBreadcrumb?.id || null,
    lastVisited: Date.now(),
    visitCount: 1,
    fileExtension: inferExtensionFromUrl(location.href),
    source: 'user',
    searchText: breadcrumbText
  }

  await upsertGraphNodes([...breadcrumbNodes, currentNode])
  await indexVisibleFiles(document, currentNode, 'user')
}

export async function bootstrapCoursesFromStorage(): Promise<void> {
  const data = await chrome.storage.local.get(['favoriten', 'meine_kurse'])
  const courses = [...readStoredCourses(data.favoriten), ...readStoredCourses(data.meine_kurse)]
  const seen = new Set<string>()
  const nodes: OpalSearchNode[] = []

  for (const course of courses) {
    const title = course.title || course.name || ''
    const url = course.href || course.link || ''
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

  await upsertGraphNodes(nodes)
}

export async function maybeRunActiveIndexing(): Promise<void> {
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

  for (const course of toIndex) {
    const url = course.href || course.link
    if (!url) continue

    try {
      await indexCourseViaIframe(url)
      cooldowns[url] = Date.now()
      await chrome.storage.local.set({ [ACTIVE_INDEX_KEY]: cooldowns })
    } catch (error) {
      console.warn('[TUfast Smart Search] Active indexing skipped course:', error)
    }

    await wait(500)
  }
}

export async function checkAndHighlightIndexedFile(): Promise<void> {
  const { opalSmartSearchHighlight } = await chrome.storage.local.get(['opalSmartSearchHighlight'])
  const intent = opalSmartSearchHighlight as { title: string; url: string } | undefined
  if (!intent) return

  await chrome.storage.local.remove(['opalSmartSearchHighlight'])

  const highlight = (): boolean => {
    const byName = document.querySelector<HTMLAnchorElement>(`a[data-file-name="${CSS.escape(intent.title)}"]`)
    if (byName && applyHighlight(byName)) return true

    try {
      const targetPath = new URL(intent.url).pathname
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

async function indexCourseViaIframe(courseUrl: string): Promise<void> {
  const iframe = document.createElement('iframe')
  iframe.style.cssText =
    'position:fixed;width:800px;height:600px;border:0;opacity:0;pointer-events:none;left:-9999px;top:-9999px;'
  iframe.tabIndex = -1
  iframe.setAttribute('aria-hidden', 'true')
  document.body.appendChild(iframe)

  try {
    iframe.src = courseUrl
    if (!(await waitForLoad(iframe, COURSE_LOAD_TIMEOUT_MS))) return

    const doc = iframe.contentDocument
    if (!doc) return

    const courseId = extractCourseIdFromUrl(courseUrl)
    const pageTitle = doc.title.replace(/ [-\u2013\u2014] .*$/, '').trim()
    const courseNode: OpalSearchNode = {
      id: urlToOpalSearchId(courseUrl),
      title: pageTitle || courseUrl,
      url: courseUrl,
      type: 'course',
      courseId,
      parentId: null,
      lastVisited: Date.now(),
      visitCount: 1,
      source: 'active'
    }
    if (pageTitle) {
      await upsertGraphNodes([courseNode])
    }

    const sections = findMaterialSectionLinks(doc, courseUrl).slice(0, MAX_SECTIONS_PER_COURSE)
    for (const section of sections) {
      iframe.src = section.url
      if (!(await waitForLoad(iframe, SECTION_LOAD_TIMEOUT_MS))) continue
      if (!iframe.contentDocument) continue

      const sectionNode: OpalSearchNode = {
        id: urlToOpalSearchId(section.url),
        title: section.title,
        url: section.url,
        type: 'folder',
        courseId,
        parentId: courseNode.id,
        lastVisited: Date.now(),
        visitCount: 1,
        source: 'active',
        searchText: pageTitle
      }

      await upsertGraphNodes([sectionNode])
      await indexVisibleFiles(iframe.contentDocument, sectionNode, 'active')
      await wait(300)
    }
  } finally {
    iframe.remove()
  }
}

async function indexVisibleFiles(doc: Document, pageNode: OpalSearchNode, source: 'user' | 'active'): Promise<void> {
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

  for (const anchor of Array.from(doc.querySelectorAll<HTMLAnchorElement>('a[data-file-name], a[href]'))) {
    const href = anchor.href
    if (!href || href.startsWith('javascript:')) continue

    const row = anchor.closest('tr')
    const icon = row?.querySelector<HTMLElement>('span.fonticon')
    const isFolder = icon?.classList.contains('icon-folder') || href.toLowerCase().includes('coursenode')
    const isFile = anchor.hasAttribute('data-file-name') || isDownloadUrl(href, true)

    if (!isFolder && !isFile) continue

    const id = urlToOpalSearchId(href)
    if (!id || indexed.has(id)) continue
    indexed.add(id)

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
    const titleExtension = inferExtensionFromName(title)
    const fileExtension = inferExtensionFromUrl(href) || titleExtension
    // OPAL sometimes exposes downloadable files through folder-like CourseNode links.
    // A file-looking title is a stronger signal than the URL shape.
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

  await upsertGraphNodes(nodes)
}

function parseBreadcrumbs(doc: Document): BreadcrumbEntry[] {
  return Array.from(
    doc.querySelectorAll<HTMLAnchorElement>('.o_breadcrumb a, nav.breadcrumb a, [class*="breadcrumb"] a')
  )
    .map((anchor) => ({ title: anchor.textContent?.trim() || '', url: anchor.href }))
    .filter(
      (entry) => entry.title && entry.url && !entry.url.includes('/opal/home') && !entry.url.startsWith('javascript:')
    )
}

function findMaterialSectionLinks(doc: Document, courseUrl: string): { url: string; title: string }[] {
  const repoId = /\/RepositoryEntry\/(\d+)/i.exec(courseUrl)?.[1] || ''
  const origin = safeOrigin(courseUrl)
  const seen = new Set<string>()
  const links: { url: string; title: string }[] = []

  const add = (url: string, title: string) => {
    const key = url.split('?')[0].replace(/\/$/, '')
    if (seen.has(key)) return
    seen.add(key)
    links.push({ url, title: title || key })
  }

  for (const anchor of Array.from(doc.querySelectorAll<HTMLAnchorElement>('a[href]'))) {
    const raw = anchor.getAttribute('href') || ''
    if (!raw || raw.startsWith('javascript:')) continue

    let fullUrl = ''
    try {
      fullUrl = new URL(raw, origin).href
    } catch {
      continue
    }

    const lower = fullUrl.toLowerCase()
    if (repoId && !fullUrl.includes(repoId)) continue
    if (lower.includes('/folder/') || lower.includes('/briefcase') || lower.includes('coursenode')) {
      add(fullUrl, anchor.textContent?.trim() || '')
    }
  }

  if (repoId) {
    const courseNodeRe = new RegExp(`RepositoryEntry\\/${repoId}\\/CourseNode\\/(\\d+)`, 'i')
    for (const anchor of Array.from(doc.querySelectorAll<HTMLAnchorElement>('a[href^="javascript:"]'))) {
      const raw = anchor.getAttribute('href') || ''
      const title = anchor.textContent?.trim() || ''
      let decoded = raw
      try {
        decoded = decodeURIComponent(raw)
      } catch {
        decoded = raw
      }

      const match = courseNodeRe.exec(decoded)
      if (match) add(`${origin}/opal/auth/RepositoryEntry/${repoId}/CourseNode/${match[1]}`, title)
    }
  }

  for (const link of extractCourseNodeLinksFromMarkup(doc.documentElement.outerHTML, courseUrl))
    add(link.url, link.title)

  return links
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
    const timer = window.setTimeout(() => resolve(false), timeoutMs)
    iframe.addEventListener(
      'load',
      () => {
        window.clearTimeout(timer)
        resolve(true)
      },
      { once: true }
    )
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
