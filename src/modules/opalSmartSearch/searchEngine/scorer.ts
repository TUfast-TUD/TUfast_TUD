import type { OpalSearchNode, OpalSearchResult } from '../types'
import type { ParsedOpalSearchQuery } from './query'
import { expandToken } from './tokenizer'

interface ScoreCandidatesOptions {
  candidates: string[]
  graphNodes: OpalSearchNode[]
  parsedQuery: ParsedOpalSearchQuery
  activeCourseId?: string
  candidateRelevance?: Map<string, number>
  limit?: number
}

// Keep ranking weights together so later config extraction does not change `scoreCandidates`.
const SCORE_WEIGHTS = {
  primaryTitleNumber: 42,
  secondaryTitleNumber: 10,
  pathNumber: 8,
  titleNumberMismatch: -48,
  missingExactNumber: -32,
  extension: 12,
  activeCourse: 8,
  filePreference: 4,
  folderPreference: 18,
  exactTitleToken: 18,
  alias: 16,
  exactPathToken: 10,
  partialTitleToken: 8,
  partialPathToken: 5,
  recentVisit: 4,
  recentWeek: 2,
  frequentVisit: 2,
  fullCoverage: 10,
  partialCoveragePerToken: 2
} as const

export function scoreCandidates({
  candidates,
  graphNodes,
  parsedQuery,
  activeCourseId,
  candidateRelevance = new Map(),
  limit = 8
}: ScoreCandidatesOptions): OpalSearchResult[] {
  const nodeById = new Map(graphNodes.map((node) => [node.id, node]))
  const now = Date.now()
  const scored: OpalSearchResult[] = []

  // Score all candidates found by MiniSearch
  for (const candidateId of candidates) {
    const node = nodeById.get(candidateId)
    if (!node || !matchesFilters(node, parsedQuery)) continue

    let score = 0
    let matchedQueryTokens = 0

    for (const token of parsedQuery.tokens) {
      const tokenScore = scoreToken(node, token)
      if (tokenScore > 0) matchedQueryTokens++
      score += tokenScore
    }

    for (const number of parsedQuery.numbers) {
      const primaryTitleNumber = node.primaryTitleNumber
      const titleNumbers = node.titleNumbers || []
      const pathNumbers = node.pathNumbers || []
      const titleHasNumbers = titleNumbers.length > 0

      // First title number is usually the exercise/sheet number
      if (primaryTitleNumber === number) {
        score += SCORE_WEIGHTS.primaryTitleNumber
      } else if (titleNumbers.includes(number)) {
        score += SCORE_WEIGHTS.secondaryTitleNumber
      } else if (pathNumbers.includes(number)) {
        // A matching path number (e.g. folder "Analysis 2") suppresses the title-mismatch penalty,
        // otherwise the correct file would fall below the score gate.
        score += SCORE_WEIGHTS.pathNumber
      } else if (titleHasNumbers) {
        score += SCORE_WEIGHTS.titleNumberMismatch
      } else {
        score += SCORE_WEIGHTS.missingExactNumber
      }
    }

    const candidateBoost = Math.min(24, (candidateRelevance.get(node.id) || 0) * 10)
    if (candidateBoost > 0) {
      score += candidateBoost
    }

    if (parsedQuery.extensionFilter && node.fileExtension === parsedQuery.extensionFilter) {
      score += SCORE_WEIGHTS.extension
    }

    const hasDirectTokenMatch = matchedQueryTokens > 0 || parsedQuery.tokens.length === 0

    if (hasDirectTokenMatch && activeCourseId && node.courseId === activeCourseId) {
      score += SCORE_WEIGHTS.activeCourse
    }

    if (hasDirectTokenMatch && node.type === 'file') {
      score += SCORE_WEIGHTS.filePreference
    } else if (
      hasDirectTokenMatch &&
      node.type === 'folder' &&
      !parsedQuery.typeFilter &&
      !parsedQuery.extensionFilter
    ) {
      score += SCORE_WEIGHTS.folderPreference
    }

    if (hasDirectTokenMatch) score += recencyAndVisitBoost(node, now)

    const coverageBonus =
      matchedQueryTokens === parsedQuery.tokens.length
        ? SCORE_WEIGHTS.fullCoverage
        : matchedQueryTokens * SCORE_WEIGHTS.partialCoveragePerToken
    score += coverageBonus

    if (score > 0) scored.push({ node, score })
  }

  return scored
    .sort((a, b) => b.score - a.score || (a.node.pathTitles || []).length - (b.node.pathTitles || []).length)
    .slice(0, limit)
}

function scoreToken(node: OpalSearchNode, token: string): number {
  const alternatives = expandToken(token)
  const titleTokens = node.titleTokens || []
  const pathTokens = node.pathTokens || []
  const aliases = node.aliases || []
  const aliasHit = alternatives.find((candidate) => aliases.includes(candidate))
  const titleHit = alternatives.find((candidate) => titleTokens.includes(candidate))
  const pathHit = alternatives.find((candidate) => pathTokens.includes(candidate))
  const partialTitleHit = alternatives.find((candidate) =>
    titleTokens.some((titleToken) => titleToken.length >= 4 && titleToken.includes(candidate) && candidate.length >= 4)
  )
  const partialPathHit = alternatives.find((candidate) =>
    pathTokens.some((pathToken) => pathToken.length >= 4 && pathToken.includes(candidate) && candidate.length >= 4)
  )

  if (titleHit) {
    return SCORE_WEIGHTS.exactTitleToken
  }

  if (aliasHit) {
    return SCORE_WEIGHTS.alias
  }

  if (pathHit) {
    return SCORE_WEIGHTS.exactPathToken
  }

  if (partialTitleHit) {
    return SCORE_WEIGHTS.partialTitleToken
  }

  if (partialPathHit) {
    return SCORE_WEIGHTS.partialPathToken
  }

  return 0
}

function recencyAndVisitBoost(node: OpalSearchNode, now: number): number {
  let score = 0
  const age = now - (node.lastVisited || 0)

  if (age > 0 && age < 86_400_000) {
    score += SCORE_WEIGHTS.recentVisit
  } else if (age > 0 && age < 7 * 86_400_000) {
    score += SCORE_WEIGHTS.recentWeek
  }

  if ((node.visitCount || 0) > 5) {
    score += SCORE_WEIGHTS.frequentVisit
  }

  return score
}

function matchesFilters(node: OpalSearchNode, parsedQuery: ParsedOpalSearchQuery): boolean {
  if (parsedQuery.typeFilter && node.type !== parsedQuery.typeFilter) return false
  if (parsedQuery.extensionFilter && node.fileExtension !== parsedQuery.extensionFilter) return false
  return true
}
