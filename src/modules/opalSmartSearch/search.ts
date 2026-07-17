import { getAllOpalSearchNodes, getOpalSearchIndexRevision } from './indexDb'
import { createMiniSearchCandidateAdapter } from './searchEngine/miniSearchAdapter'
import type { CandidateAdapter } from './searchEngine/miniSearchAdapter'
import { parseOpalSearchQuery } from './searchEngine/query'
import { scoreCandidates } from './searchEngine/scorer'
import type { OpalSearchNode, OpalSearchResult } from './types'

let cachedAdapter: CandidateAdapter | null = null
let cachedAdapterNodes: OpalSearchNode[] | null = null
let cachedGraphNodes: OpalSearchNode[] | null = null
let cachedGraphRevision = -1

export async function searchOpalNodes(rawQuery: string, courseId?: string, limit = 8): Promise<OpalSearchResult[]> {
  // This is the reusable result-provider boundary. A future central TUfast search can call this through
  // `opal_smart_search_query` while the separate OPAL palette keeps its own UI.
  return searchOpalNodesFromGraph(await getSearchGraphNodes(), rawQuery, courseId, limit)
}

export function searchOpalNodesFromGraph(
  nodes: OpalSearchNode[],
  rawQuery: string,
  courseId?: string,
  limit = 8
): OpalSearchResult[] {
  // Parse query and skip empty searches
  const parsed = parseOpalSearchQuery(rawQuery)
  if (!parsed.normalized && !parsed.extensionFilter) return []

  // MiniSearch only finds candidates. Our scorer decides the order.
  const adapter = ensureCandidateAdapter(nodes)
  const candidates = adapter.candidates(parsed)
  const results = scoreCandidates({
    candidates: candidates.ids,
    graphNodes: nodes,
    parsedQuery: parsed,
    activeCourseId: courseId,
    candidateRelevance: candidates.relevance,
    limit: limit * 3
  })

  const deduped = dedupeById(results)
  if (parsed.typeFilter !== 'file') return deduped.slice(0, limit)

  const folderCandidates = adapter.candidates({ ...parsed, typeFilter: null, extensionFilter: null })
  const folderFiles = findFilesFromMatchingFolders({
    nodes,
    candidateIds: folderCandidates.ids,
    candidateRelevance: folderCandidates.relevance,
    parsed,
    courseId,
    limit: limit * 3
  })

  return dedupeById([...deduped, ...folderFiles].sort((a, b) => b.score - a.score)).slice(0, limit)
}

function ensureCandidateAdapter(nodes: OpalSearchNode[]): CandidateAdapter {
  if (!cachedAdapter || cachedAdapterNodes !== nodes) {
    cachedAdapter = createMiniSearchCandidateAdapter(nodes)
    cachedAdapterNodes = nodes
  }

  return cachedAdapter
}

async function getSearchGraphNodes(): Promise<OpalSearchNode[]> {
  let revision = getOpalSearchIndexRevision()
  if (cachedGraphNodes && cachedGraphRevision === revision) return cachedGraphNodes

  let nodes: OpalSearchNode[]
  do {
    revision = getOpalSearchIndexRevision()
    nodes = await getAllOpalSearchNodes()
  } while (revision !== getOpalSearchIndexRevision())

  cachedGraphNodes = nodes
  cachedGraphRevision = revision
  return nodes
}

function dedupeById(results: OpalSearchResult[]): OpalSearchResult[] {
  const seen = new Set<string>()
  const deduped: OpalSearchResult[] = []

  for (const result of results) {
    // Node ids are the one identity definition (they keep e.g. `assid=` queries) — don't re-derive a weaker key.
    if (seen.has(result.node.id)) continue
    seen.add(result.node.id)
    deduped.push(result)
  }

  return deduped
}

function findFilesFromMatchingFolders({
  nodes,
  candidateIds,
  candidateRelevance,
  parsed,
  courseId,
  limit
}: {
  nodes: OpalSearchNode[]
  candidateIds: string[]
  candidateRelevance: Map<string, number>
  parsed: ReturnType<typeof parseOpalSearchQuery>
  courseId?: string
  limit: number
}): OpalSearchResult[] {
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const folderResults = scoreCandidates({
    candidates: candidateIds,
    graphNodes: nodes,
    parsedQuery: { ...parsed, typeFilter: null, extensionFilter: null },
    activeCourseId: courseId,
    candidateRelevance,
    limit
  }).filter((result) => result.node.type === 'folder')

  const files: OpalSearchResult[] = []
  for (const folder of folderResults) {
    for (const childId of folder.node.childrenIds || []) {
      const child = byId.get(childId)
      if (!child || child.type !== 'file') continue
      if (parsed.extensionFilter && child.fileExtension !== parsed.extensionFilter) continue
      files.push({
        node: child,
        score: Math.max(1, folder.score - 1)
      })
    }
  }

  return files.sort((a, b) => b.score - a.score)
}
