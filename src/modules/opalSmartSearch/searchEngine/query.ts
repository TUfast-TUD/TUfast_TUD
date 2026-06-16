import type { OpalSearchNodeType } from '../types'
import { expandQueryTokens, extractExtension, extractNumbers, normalizeText, tokenize } from './tokenizer'

const FILE_EXTENSIONS = new Set([
  'pdf',
  'zip',
  'doc',
  'docx',
  'ppt',
  'pptx',
  'xls',
  'xlsx',
  'txt',
  'md',
  'csv',
  'png',
  'jpg',
  'jpeg',
  'svg',
  'mp4',
  'webm'
])

export interface ParsedOpalSearchQuery {
  raw: string
  normalized: string
  typeFilter: OpalSearchNodeType | null
  extensionFilter: string | null
  tokens: string[]
  expandedTokens: string[]
  numbers: string[]
}

export function parseOpalSearchQuery(rawQuery: string): ParsedOpalSearchQuery {
  let query = String(rawQuery || '').trim()
  let typeFilter: OpalSearchNodeType | null = null

  if (query.startsWith('/f ')) {
    typeFilter = 'file'
    query = query.slice(3).trim()
  } else if (query.startsWith('/c ')) {
    typeFilter = 'course'
    query = query.slice(3).trim()
  }

  const rawTokens = tokenize(query)
  const extensionFilter = rawTokens.find((token) => FILE_EXTENSIONS.has(token)) || extractExtension(query)
  const tokens = rawTokens.filter((token) => token !== extensionFilter)

  return {
    raw: rawQuery,
    normalized: normalizeText(query),
    typeFilter,
    extensionFilter,
    tokens,
    expandedTokens: expandQueryTokens(tokens),
    numbers: extractNumbers(query)
  }
}
