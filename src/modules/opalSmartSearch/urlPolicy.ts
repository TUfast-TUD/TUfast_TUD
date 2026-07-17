import type { OpalSearchNode } from './types'

const OPAL_HOST = 'bildungsportal.sachsen.de'

export function normalizeAllowedOpalUrl(value: string): string | null {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return null
    if (url.hostname !== OPAL_HOST) return null
    if (!url.pathname.startsWith('/opal/')) return null
    return url.href
  } catch {
    return null
  }
}

export function isAllowedOpalUrl(value: string): boolean {
  return Boolean(normalizeAllowedOpalUrl(value))
}

export function isOpalLoginUrl(value: string): boolean {
  try {
    return /\/(?:shib)?login(?:\/|$)/i.test(new URL(value).pathname)
  } catch {
    return false
  }
}

export function extractOpalRepositoryId(value: string): string | null {
  let path = value
  try {
    path = new URL(value).pathname
  } catch {
    path = value
  }

  const repoId = path.match(/\/RepositoryEntry\/(\d+)/i)?.[1] ?? path.match(/\/FolderResource\/(\d+)/i)?.[1]
  return repoId ? `/opal/auth/RepositoryEntry/${repoId}` : null
}

export function isSameOpalRepository(left: string, right: string): boolean {
  const leftId = extractOpalRepositoryId(left)
  const rightId = extractOpalRepositoryId(right)
  return Boolean(leftId && rightId && leftId === rightId)
}

export function isOpalTargetInRepositoryScope(scope: string, target: string): boolean {
  const targetId = extractOpalRepositoryId(target)
  return !targetId || isSameOpalRepository(scope, target)
}

export function sanitizeOpalSearchNode(node: OpalSearchNode): OpalSearchNode | null {
  const url = normalizeAllowedOpalUrl(node.url)
  if (!url) return null

  // Keep SmartSearch course-scoped; cross-course references need their own result type.
  if (
    extractOpalRepositoryId(url) &&
    extractOpalRepositoryId(node.courseId) &&
    !isSameOpalRepository(url, node.courseId)
  )
    return null

  return {
    ...node,
    url
  }
}

export function sanitizeOpalSearchNodes(nodes: OpalSearchNode[]): OpalSearchNode[] {
  return nodes.map(sanitizeOpalSearchNode).filter((node): node is OpalSearchNode => Boolean(node))
}

export function isIndexableOpalTarget(value: string): boolean {
  const url = normalizeAllowedOpalUrl(value)
  if (!url) return false

  try {
    const parsed = new URL(url)
    const lower = `${parsed.pathname}${parsed.search}`.toLowerCase()

    if (isOpalUiControlTarget(url)) return false
    if (lower.includes('/opal/home/notifications')) return false
    if (lower.includes('notificationslink')) return false
    if (lower.includes('navigationpersonalcontainer')) return false
    if (lower.includes('header-navicontainer')) return false
    if (lower.includes('html-body-wrapper-header')) return false
    if (lower.includes('/opal/home') && !lower.includes('repositoryentry')) return false

    return (
      /\/repositoryentry\/\d+/i.test(parsed.pathname) ||
      lower.includes('/folder/') ||
      lower.includes('briefcase') ||
      /\.(pdf|zip|docx?|pptx?|xlsx?|mp4|png|jpe?g|svg|csv|txt|7z|rar|odt|ods|odp|md|json|xml|webm|mov)(\?|$)/i.test(
        lower
      )
    )
  } catch {
    return false
  }
}

export function isOpalUiControlTarget(value: string, title = ''): boolean {
  try {
    const parsed = new URL(value)
    const lower = `${parsed.pathname}${parsed.search}${parsed.hash}`.toLowerCase()
    const cleanTitle = title.trim().replace(/\s+/g, ' ')
    const normalizedTitle = normalizeUiControlTitle(cleanTitle)

    if (lower.includes('#main-nav')) return true
    if (lower.includes('#main-content')) return true
    if (lower.includes('#side-menu')) return true
    if (lower.includes('pager-navigation')) return true
    if (lower.includes('downloadtablecontainer')) return true
    if (lower.includes('tableform-download')) return true
    if (lower.includes('contentcontainer-tablecontainer-pager')) return true
    if (/^(aktuelle seite|seite \d+|tabelle herunterladen|zum inhalt|link \d+)$/i.test(cleanTitle)) return true
    if (/^(zum kursmenue|kursmenue|zum inhalt|inhalt)$/.test(normalizedTitle)) return true
    if (/^gehe (zu|zur) /i.test(cleanTitle)) return true

    return false
  } catch {
    return false
  }
}

function normalizeUiControlTitle(value: string): string {
  return value
    .toLowerCase()
    .replace(/\u00e4/g, 'ae')
    .replace(/\u00f6/g, 'oe')
    .replace(/\u00fc/g, 'ue')
    .replace(/\u00df/g, 'ss')
}
