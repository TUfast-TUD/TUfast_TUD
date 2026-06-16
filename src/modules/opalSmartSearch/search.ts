import { getAllOpalSearchNodes } from './indexDb'
import { createMiniSearchCandidateAdapter } from './searchEngine/miniSearchAdapter'
import type { CandidateAdapter } from './searchEngine/miniSearchAdapter'
import { parseOpalSearchQuery } from './searchEngine/query'
import { scoreCandidates } from './searchEngine/scorer'
import type { OpalSearchNode, OpalSearchResult } from './types'

let cachedAdapter: CandidateAdapter | null = null
let cachedSignature = ''

export async function searchOpalNodes(rawQuery: string, courseId = '', limit = 8): Promise<OpalSearchResult[]> {
  // Parse query and skip empty searches
  const parsed = parseOpalSearchQuery(rawQuery)
  if (!parsed.normalized && !parsed.extensionFilter) return []

  const nodes = await getAllOpalSearchNodes()

  // MiniSearch only finds candidates. Our scorer decides the order.
  const adapter = ensureCandidateAdapter(nodes)
  const candidateIds = adapter.candidateIds(parsed)
  const results = scoreCandidates({
    candidates: candidateIds,
    graphNodes: nodes,
    parsedQuery: parsed,
    activeCourseId: courseId,
    limit: limit * 3
  })

  return dedupeByUrl(results).slice(0, limit)
}

function ensureCandidateAdapter(nodes: OpalSearchNode[]): CandidateAdapter {
  // Rebuild MiniSearch only when the local index changed
  const signature = nodes
    .map((node) => `${node.id}:${node.indexedAt || node.lastVisited || 0}`)
    .sort()
    .join('|')

  if (!cachedAdapter || cachedSignature !== signature) {
    cachedAdapter = createMiniSearchCandidateAdapter(nodes)
    cachedSignature = signature
  }

  return cachedAdapter
}

function dedupeByUrl(results: OpalSearchResult[]): OpalSearchResult[] {
  const seen = new Set<string>()
  const deduped: OpalSearchResult[] = []

  for (const result of results) {
    const key = result.node.url.replace(/\/+$/, '').split('?')[0]
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(result)
  }

  return deduped
}
