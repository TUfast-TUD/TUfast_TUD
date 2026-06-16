import type { OpalSearchNode } from '../types'
import { extractExtension, extractNumbers, extractPrimaryNumber, generateNameAliases, tokenize } from './tokenizer'

export function rebuildGraphFields(nodes: OpalSearchNode[]): OpalSearchNode[] {
  // Clean parent links before building paths
  const initial = new Map(nodes.map((node) => [node.id, { ...node, childrenIds: [] as string[] }]))
  const byId = new Map<string, OpalSearchNode>()

  for (const node of initial.values()) {
    byId.set(node.id, {
      ...node,
      courseId: normalizeCourseId(node),
      parentId: sanitizeParentId(node, initial),
      childrenIds: []
    })
  }

  for (const node of byId.values()) {
    if (!node.parentId) continue
    byId.get(node.parentId)?.childrenIds?.push(node.id)
  }

  return [...byId.values()].map((node) => buildGraphNode(node, byId))
}

export function buildGraphNode(
  node: OpalSearchNode,
  allKnownNodes: Map<string, OpalSearchNode> | OpalSearchNode[]
): OpalSearchNode {
  const byId = Array.isArray(allKnownNodes) ? new Map(allKnownNodes.map((entry) => [entry.id, entry])) : allKnownNodes
  const path = getPath(node, byId)
  const course = path.find((entry) => entry.type === 'course' && sameRepository(entry.courseId, node.courseId))
  const pathTitles = path.map((entry) => entry.title)
  const aliases = new Set(generateNameAliases(node.title))

  for (const entry of path) {
    for (const alias of generateNameAliases(entry.title)) aliases.add(alias)
  }

  const titleTokens = tokenize(node.title)
  const pathTokens = tokenize(pathTitles.join(' '))
  // Keep title numbers stronger than date numbers from parent folders
  const titleNumbers = extractNumbers(node.title)
  const pathNumbers = extractNumbers(pathTitles.slice(0, -1).join(' '))
  const fileExtension =
    node.type === 'file'
      ? node.fileExtension || extractExtension(node.title) || extractExtension(node.url) || undefined
      : undefined

  return {
    ...node,
    courseId: course?.id || node.courseId,
    pathIds: path.map((entry) => entry.id),
    pathTitles,
    titleTokens,
    pathTokens,
    titleNumbers,
    pathNumbers,
    aliases: [...aliases],
    numbers: [...new Set([...titleNumbers, ...pathNumbers])],
    primaryTitleNumber: extractPrimaryNumber(node.title),
    fileExtension,
    childrenIds: node.childrenIds || []
  }
}

function sanitizeParentId(node: OpalSearchNode, byId: Map<string, OpalSearchNode>): string | null {
  const courseId = normalizeCourseId(node)
  if (!node.parentId || node.parentId === node.id) return null
  const parent = byId.get(node.parentId)
  if (parent && sameRepository(courseId, normalizeCourseId(parent))) return node.parentId
  return node.id !== courseId && byId.has(courseId) ? courseId : null
}

function normalizeCourseId(node: OpalSearchNode): string {
  return (
    extractRepositoryCourseId(node.url) ||
    extractRepositoryCourseId(node.id) ||
    extractFolderResourceCourseId(node.url) ||
    extractFolderResourceCourseId(node.id) ||
    extractRepositoryCourseId(node.courseId) ||
    node.courseId
  )
}

function extractRepositoryCourseId(value: string): string {
  return value.match(/(\/opal\/[^/]+\/RepositoryEntry\/\d+)/i)?.[1] || ''
}

function extractFolderResourceCourseId(value: string): string {
  const repoId = value.match(/\/opal\/FolderResource\/(\d+)/i)?.[1]
  return repoId ? `/opal/auth/RepositoryEntry/${repoId}` : ''
}

function sameRepository(left: string, right: string): boolean {
  const leftId = left.match(/\/RepositoryEntry\/(\d+)/i)?.[1]
  const rightId = right.match(/\/RepositoryEntry\/(\d+)/i)?.[1]
  return Boolean(leftId && rightId && leftId === rightId)
}

function getPath(node: OpalSearchNode, byId: Map<string, OpalSearchNode>): OpalSearchNode[] {
  const path: OpalSearchNode[] = []
  const seen = new Set<string>()
  let current: OpalSearchNode | undefined = node

  while (current && !seen.has(current.id)) {
    seen.add(current.id)
    path.unshift(current)
    current = current.parentId ? byId.get(current.parentId) : undefined
  }

  return path
}
