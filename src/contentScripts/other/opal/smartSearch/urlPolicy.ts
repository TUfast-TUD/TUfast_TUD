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

export function sanitizeOpalSearchNode(node: OpalSearchNode): OpalSearchNode | null {
  const url = normalizeAllowedOpalUrl(node.url)
  if (!url) return null

  return {
    ...node,
    url
  }
}

export function sanitizeOpalSearchNodes(nodes: OpalSearchNode[]): OpalSearchNode[] {
  return nodes.map(sanitizeOpalSearchNode).filter((node): node is OpalSearchNode => Boolean(node))
}
