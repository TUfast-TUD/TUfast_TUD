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
  candidateIds: (parsedQuery: ParsedOpalSearchQuery) => string[]
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
      extension: node.fileExtension || ''
    }))
  )

  return {
    candidateIds(parsedQuery) {
      const term = [...parsedQuery.expandedTokens, parsedQuery.extensionFilter].filter(Boolean).join(' ')
      if (!term.trim()) return graphNodes.map((node) => node.id)
      return index.search(term, { combineWith: 'OR' }).map((result) => result.id)
    }
  }
}
