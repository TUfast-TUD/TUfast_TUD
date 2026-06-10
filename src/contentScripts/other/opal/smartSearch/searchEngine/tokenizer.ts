const UMLAUTS: [RegExp, string][] = [
  [/\u00e4/gi, 'ae'],
  [/\u00f6/gi, 'oe'],
  [/\u00fc/gi, 'ue'],
  [/\u00df/g, 'ss']
]

export const GENERIC_ALIASES = new Map<string, string[]>([
  ['vl', ['vorlesung', 'lecture']],
  ['vorlesung', ['vl', 'lecture']],
  ['lecture', ['vl', 'vorlesung']],
  ['ue', ['uebung', 'exercise']],
  ['uebung', ['ue', 'exercise']],
  ['exercise', ['ue', 'uebung']],
  ['skript', ['script', 'lecture', 'notes']],
  ['script', ['skript']],
  ['folien', ['slides']],
  ['slides', ['folien']],
  ['klausur', ['exam', 'pruefung']],
  ['exam', ['klausur', 'pruefung']],
  ['pruefung', ['exam', 'klausur']]
])

const STOP_WORDS = new Set(['der', 'die', 'das', 'und', 'fuer', 'für', 'von', 'zur', 'zum', 'des', 'the', 'and', 'of'])

export function normalizeText(value: string): string {
  let normalized = String(value || '')
  for (const [pattern, replacement] of UMLAUTS) normalized = normalized.replace(pattern, replacement)

  return normalized
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_./()[\]{}:;,+-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

export function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(/\s+/)
    .filter((token) => token.length > 0)
}

export function extractNumbers(value: string): string[] {
  return [
    ...new Set(
      tokenize(value)
        .filter((token) => /^\d+$/.test(token))
        .map(normalizeNumberToken)
    )
  ]
}

export function extractPrimaryNumber(value: string): string | undefined {
  return extractNumbers(value)[0]
}

export function extractExtension(titleOrUrl: string): string | null {
  const match = String(titleOrUrl || '')
    .toLowerCase()
    .match(/\.([a-z0-9]{2,5})(?:$|[?#])/)
  return match?.[1] || null
}

export function expandQueryTokens(tokens: string[]): string[] {
  const expanded = new Set(tokens)
  for (const token of tokens) {
    for (const alias of expandToken(token)) expanded.add(alias)
  }
  return [...expanded]
}

export function expandToken(token: string): string[] {
  return [token, ...(GENERIC_ALIASES.get(token) || []).map((alias) => normalizeText(alias))]
}

export function generateNameAliases(title: string): string[] {
  const tokens = tokenize(title).filter((token) => !STOP_WORDS.has(token))
  const aliases = new Set<string>()
  const initials = tokens.map((token) => token[0]).join('')
  const trailingNumber = tokens.find((token) => /^\d+$/.test(token)) || ''

  if (initials.length >= 2) aliases.add(initials)
  if (initials.length >= 2 && trailingNumber && !initials.endsWith(trailingNumber))
    aliases.add(`${initials}${trailingNumber}`)

  return [...aliases]
}

function normalizeNumberToken(token: string): string {
  return token.replace(/^0+(?=\d)/, '')
}
