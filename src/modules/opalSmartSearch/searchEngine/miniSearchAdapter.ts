import MiniSearch from 'minisearch'

import type { OpalSearchNode } from '../types'
import type { ParsedOpalSearchQuery } from './query'

interface MiniSearchDocument {
  id: string
  title: string
  path: string
  aliases: string
  extension: string
}

export interface CandidateAdapter {
  candidates: (parsedQuery: ParsedOpalSearchQuery) => {
    ids: string[]
    relevance: Map<string, number>
  }
}

export function createMiniSearchCandidateAdapter(graphNodes: OpalSearchNode[]): CandidateAdapter {
  const index = new MiniSearch<MiniSearchDocument>({
    fields: ['title', 'path', 'aliases', 'extension'],
    storeFields: ['id'],
    searchOptions: {
      boost: {
        title: 4,
        aliases: 3,
        path: 1.5,
        extension: 2
      },
      fuzzy: 0.2,
      prefix: true
    }
  })

  index.addAll(
    graphNodes.map((node) => ({
      id: node.id,
      title: (node.titleTokens || []).join(' '),
      path: (node.pathTokens || []).join(' '),
      aliases: (node.aliases || []).join(' '),
      extension: node.fileExtension ?? ''
    }))
  )

  return {
    candidates(parsedQuery) {
      const term = [...parsedQuery.expandedTokens, parsedQuery.extensionFilter].filter(Boolean).join(' ')
      if (!term.trim()) return { ids: graphNodes.map((node) => node.id), relevance: new Map() }

      const results = index.search(term, { combineWith: 'OR' })
      const ids = results.map((result) => result.id)
      const seen = new Set(ids)
      const relevance = new Map(results.map((result) => [result.id, result.score]))

      // MiniSearch supports prefix but not infix matching; include the latter so the scorer's partial-match rules run.
      for (const node of graphNodes) {
        if (seen.has(node.id) || !hasInfixMatch(node, parsedQuery.expandedTokens)) continue
        seen.add(node.id)
        ids.push(node.id)
      }

      return { ids, relevance }
    }
  }
}

function hasInfixMatch(node: OpalSearchNode, tokens: string[]): boolean {
  const indexedTokens = [...(node.titleTokens || []), ...(node.pathTokens || [])]
  return tokens.some(
    (token) =>
      token.length >= 4 &&
      indexedTokens.some((indexedToken) => indexedToken.length >= 4 && indexedToken.includes(token))
  )
}
