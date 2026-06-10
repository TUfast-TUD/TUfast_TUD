import type { OpalSearchNode, OpalSearchResult } from '../types'
import type { ParsedOpalSearchQuery } from './query'
import { expandToken } from './tokenizer'

interface ScoreCandidatesOptions {
  candidates: string[]
  graphNodes: OpalSearchNode[]
  parsedQuery: ParsedOpalSearchQuery
  activeCourseId?: string
  limit?: number
}

export function scoreCandidates({
  candidates,
  graphNodes,
  parsedQuery,
  activeCourseId = '',
  limit = 8
}: ScoreCandidatesOptions): OpalSearchResult[] {
  const nodeById = new Map(graphNodes.map((node) => [node.id, node]))
  const now = Date.now()
  const scored: OpalSearchResult[] = []

  for (const candidateId of candidates) {
    const node = nodeById.get(candidateId)
    if (!node || !matchesFilters(node, parsedQuery)) continue

    const explanation: string[] = []
    let score = 0
    let matchedQueryTokens = 0

    for (const token of parsedQuery.tokens) {
      const tokenScore = scoreToken(node, token, explanation)
      if (tokenScore > 0) matchedQueryTokens++
      score += tokenScore
    }

    for (const number of parsedQuery.numbers) {
      const primaryTitleNumber = node.primaryTitleNumber
      const titleNumbers = node.titleNumbers || []
      const pathNumbers = node.pathNumbers || []

      // OPAL folder titles often contain date ranges. Treat the first title number
      // as the structural number, and later title numbers as weaker date-like evidence.
      if (primaryTitleNumber === number) {
        score += 42
        explanation.push(`primary title number ${number} +42`)
      } else if (titleNumbers.includes(number)) {
        score += 10
        explanation.push(`secondary title number ${number} +10`)
      } else if (pathNumbers.includes(number)) {
        score += 8
        explanation.push(`path number ${number} +8`)
      } else {
        score -= 18
        explanation.push(`missing exact number ${number} -18`)
      }
    }

    if (parsedQuery.extensionFilter && node.fileExtension === parsedQuery.extensionFilter) {
      score += 12
      explanation.push(`extension ${parsedQuery.extensionFilter} +12`)
    }

    if (activeCourseId && node.courseId === activeCourseId) {
      score += 8
      explanation.push('active course +8')
    }

    if (node.type === 'file') {
      score += 4
      explanation.push('file preference +4')
    }

    score += recencyAndVisitBoost(node, now, explanation)

    const coverageBonus = matchedQueryTokens === parsedQuery.tokens.length ? 10 : matchedQueryTokens * 2
    score += coverageBonus
    explanation.push(`token coverage +${coverageBonus}`)

    if (score > 0) scored.push({ node, score, explanation })
  }

  return scored
    .sort((a, b) => b.score - a.score || (a.node.pathTitles || []).length - (b.node.pathTitles || []).length)
    .slice(0, limit)
}

function scoreToken(node: OpalSearchNode, token: string, explanation: string[]): number {
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
    explanation.push(`title token ${token}->${titleHit} +18`)
    return 18
  }

  if (aliasHit) {
    explanation.push(`alias ${token}->${aliasHit} +16`)
    return 16
  }

  if (pathHit) {
    explanation.push(`path token ${token}->${pathHit} +10`)
    return 10
  }

  if (partialTitleHit) {
    explanation.push(`partial title ${token}->${partialTitleHit} +8`)
    return 8
  }

  if (partialPathHit) {
    explanation.push(`partial path ${token}->${partialPathHit} +5`)
    return 5
  }

  return 0
}

function recencyAndVisitBoost(node: OpalSearchNode, now: number, explanation: string[]): number {
  let score = 0
  const age = now - (node.lastVisited || 0)

  if (age > 0 && age < 86_400_000) {
    score += 4
    explanation.push('recent visit +4')
  } else if (age > 0 && age < 7 * 86_400_000) {
    score += 2
    explanation.push('recent week +2')
  }

  if ((node.visitCount || 0) > 5) {
    score += 2
    explanation.push('visit count +2')
  }

  return score
}

function matchesFilters(node: OpalSearchNode, parsedQuery: ParsedOpalSearchQuery): boolean {
  if (parsedQuery.typeFilter && node.type !== parsedQuery.typeFilter) return false
  if (parsedQuery.extensionFilter && node.fileExtension !== parsedQuery.extensionFilter) return false
  return true
}
