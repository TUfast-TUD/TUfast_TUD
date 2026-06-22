export interface ExtractedCourseNodeLink {
  url: string
  title: string
}

const FILE_EXTENSION_PATTERN =
  /\.(pdf|zip|docx?|pptx?|xlsx?|mp4|png|jpe?g|svg|csv|txt|7z|rar|html?|odt|ods|odp|md|json|xml|webm|mov)(\?|$)/i

const DOWNLOAD_EXTENSION_PATTERN =
  /\.(pdf|zip|docx?|pptx?|xlsx?|mp4|png|jpe?g|svg|csv|txt|7z|rar|odt|ods|odp|md|json|xml|webm|mov)(\?|$)/i

export function urlToOpalSearchId(url: string): string {
  if (!url || !/^https?:\/\//i.test(url)) return ''

  try {
    const parsed = new URL(url)
    const search = shouldDropOpalSearch(parsed) ? '' : parsed.search
    return (parsed.pathname + search).replace(/\/$/, '') || url
  } catch {
    return url
  }
}

export function extractCourseIdFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname
    const match = path.match(/(\/opal\/[^/]*\/RepositoryEntry\/\d+)/i) || path.match(/(\/RepositoryEntry\/\d+)/i)
    return match ? match[1] : urlToOpalSearchId(url)
  } catch {
    return urlToOpalSearchId(url)
  }
}

export function inferNodeType(url: string): 'course' | 'folder' | 'file' | 'action' {
  const lowerUrl = url.toLowerCase()
  if (FILE_EXTENSION_PATTERN.test(lowerUrl)) return 'file'
  if (lowerUrl.includes('coursenode')) return 'folder'
  if (lowerUrl.includes('/course/') || lowerUrl.includes('repositoryentry')) return 'course'
  if (lowerUrl.includes('/folder/') || lowerUrl.includes('briefcase')) return 'folder'
  return 'action'
}

export function inferExtensionFromUrl(url: string): string | undefined {
  const match = url.toLowerCase().match(/\.([a-z0-9]{2,5})(\?|$)/)
  return match ? match[1] : undefined
}

export function inferExtensionFromName(name: string): string | undefined {
  const match = name.toLowerCase().match(/\.([a-z0-9]{2,5})$/)
  return match ? match[1] : undefined
}

export function isDownloadUrl(url: string, includeHtml = false): boolean {
  if (!includeHtml) return DOWNLOAD_EXTENSION_PATTERN.test(url)
  if (!FILE_EXTENSION_PATTERN.test(url)) return false
  return !/\.html?(\?|$)/i.test(url) || url.includes('FolderResource')
}

export function readBestLinkTitle(
  attrs: Record<string, string | undefined>,
  textContent: string,
  href: string
): string {
  return cleanLinkTitle(
    attrs['data-file-name'] ||
      attrs.download ||
      attrs.title ||
      attrs['aria-label'] ||
      textContent ||
      filenameFromUrl(href)
  )
}

export function normalizeSearchText(value: string): string {
  return value
    .replace(/\u00e4/gi, 'ae')
    .replace(/\u00f6/gi, 'oe')
    .replace(/\u00fc/gi, 'ue')
    .replace(/\u00df/g, 'ss')
    .replace(/[_.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

export function extractExtensionFilter(query: string): string | null {
  const match = query
    .toLowerCase()
    .match(
      /\b(?:ext:|type:)?(pdf|zip|docx?|pptx?|xlsx?|mp4|png|jpe?g|svg|csv|txt|7z|rar|html?|odt|ods|odp|md|json|xml|webm|mov)\b/
    )

  return match?.[1] || null
}

export function extractCourseNodeLinksFromMarkup(html: string, courseUrl: string): ExtractedCourseNodeLink[] {
  const repoId = /\/RepositoryEntry\/(\d+)/i.exec(courseUrl)?.[1]
  if (!repoId) return []

  const links: ExtractedCourseNodeLink[] = []
  const seen = new Set<string>()
  const origin = safeOrigin(courseUrl)
  const courseNodeRe = new RegExp(`(?:\\/opal\\/auth)?\\/RepositoryEntry\\/${repoId}\\/CourseNode\\/(\\d+)`, 'gi')

  for (const anchor of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attrs = readAttrs(anchor[1])
    const title = readBestLinkTitle(attrs, stripTags(anchor[2]), '')
    const payload = [
      attrs.href,
      attrs.onclick,
      attrs['data-url'],
      attrs['data-target'],
      attrs['data-href'],
      attrs['data-link']
    ]
      .filter(Boolean)
      .join(' ')

    let decoded = payload
    try {
      decoded = decodeURIComponent(payload)
    } catch {
      decoded = payload
    }

    for (const match of decoded.matchAll(courseNodeRe)) {
      addUnique(links, seen, `${origin}/opal/auth/RepositoryEntry/${repoId}/CourseNode/${match[1]}`, title)
    }
  }

  return links
}

export function extractCourseNodeLinks(root: Document | HTMLElement, courseUrl: string): ExtractedCourseNodeLink[] {
  const repoId = /\/RepositoryEntry\/(\d+)/i.exec(courseUrl)?.[1]
  if (!repoId) return []

  const links: ExtractedCourseNodeLink[] = []
  const seen = new Set<string>()
  const origin = safeOrigin(courseUrl)
  const courseNodeRe = new RegExp(`(?:\\/opal\\/auth)?\\/RepositoryEntry\\/${repoId}\\/CourseNode\\/(\\d+)`, 'i')

  for (const anchor of Array.from(root.querySelectorAll<HTMLAnchorElement>('a'))) {
    const payload = [
      anchor.getAttribute('href'),
      anchor.getAttribute('onclick'),
      anchor.getAttribute('data-url'),
      anchor.getAttribute('data-target'),
      anchor.getAttribute('data-href'),
      anchor.getAttribute('data-link')
    ]
      .filter(Boolean)
      .join(' ')

    let decoded = payload
    try {
      decoded = decodeURIComponent(payload)
    } catch {
      decoded = payload
    }

    const match = decoded.match(courseNodeRe)
    if (!match) continue

    const title = readBestLinkTitle(
      {
        title: anchor.getAttribute('title') || undefined,
        'aria-label': anchor.getAttribute('aria-label') || undefined
      },
      anchor.textContent || '',
      ''
    )
    addUnique(links, seen, `${origin}/opal/auth/RepositoryEntry/${repoId}/CourseNode/${match[1]}`, title)
  }

  const html =
    root instanceof Document ? root.documentElement.outerHTML : root instanceof HTMLElement ? root.outerHTML : ''
  if (html) {
    for (const link of extractCourseNodeLinksFromMarkup(html, courseUrl)) addUnique(links, seen, link.url, link.title)
  }

  return links
}

function filenameFromUrl(url: string): string {
  try {
    const path = new URL(url, 'https://bildungsportal.sachsen.de').pathname
    return decodeURIComponent(path.split('/').filter(Boolean).pop() || '')
  } catch {
    return ''
  }
}

function cleanLinkTitle(value: string): string {
  return decodeEntities(value.replace(/\s+/g, ' ').trim())
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function stripTags(html: string): string {
  return cleanLinkTitle(html.replace(/<[^>]*>/g, ' '))
}

function readAttrs(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gi)) {
    attrs[match[1].toLowerCase()] = decodeEntities(match[3])
  }
  return attrs
}

function safeOrigin(url: string): string {
  try {
    return new URL(url).origin
  } catch {
    return 'https://bildungsportal.sachsen.de'
  }
}

function addUnique(links: ExtractedCourseNodeLink[], seen: Set<string>, url: string, title: string): void {
  const key = url.split('?')[0].replace(/\/$/, '')
  if (seen.has(key)) return
  seen.add(key)
  links.push({ url, title: cleanLinkTitle(title) || key })
}

function shouldDropOpalSearch(parsed: URL): boolean {
  if (/^\?\d+$/.test(parsed.search)) return true
  if (!/\/CourseNode\//i.test(parsed.pathname)) return false

  const lower = parsed.search.toLowerCase()
  if (!lower) return true
  if (lower.includes('assid=')) return false
  if (lower.includes('anticache=')) return true
  if (lower.includes('fluidcontainer')) return true
  if (lower.includes('contentcontainer')) return true
  if (lower.includes('tableform')) return true
  if (lower.includes('pager-navigation')) return true
  return false
}
