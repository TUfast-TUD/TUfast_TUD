import type { OpalSearchNode, OpalSearchResult } from '../../../../modules/opalSmartSearch/types'

type SmartSearchStrings = typeof globalThis.TUFAST_STRINGS.opal.smartSearch

export function renderResults(
  results: OpalSearchResult[],
  selectedIndex: number,
  strings: SmartSearchStrings,
  emptyMessage: string
): string {
  if (results.length === 0) {
    return `<div class="tufast-smart-search__empty" role="status" aria-live="polite">${escapeHtml(emptyMessage)}</div>`
  }

  return results.map((result, index) => renderResult(result.node, index, index === selectedIndex, strings)).join('')
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function escapeAttr(value: string): string {
  return escapeHtml(value)
}

function renderResult(node: OpalSearchNode, index: number, selected: boolean, strings: SmartSearchStrings): string {
  const type = typeLabel(node.type, strings)
  const trail = renderTrail(node, type, strings.pathSeparator)
  return `
    <a id="tufast-smart-search-result-${index}" href="${escapeAttr(node.url)}" data-index="${index}"
      role="option" aria-selected="${selected}" tabindex="-1"
      class="tufast-smart-search__result${selected ? ' is-selected' : ''}">
      <span class="tufast-smart-search__type tufast-smart-search__type--${node.type}" aria-label="${escapeAttr(
        type
      )}">${escapeHtml(type.slice(0, 1).toUpperCase())}</span>
      <span class="tufast-smart-search__copy">
        <strong>${escapeHtml(node.title)}</strong>
        <small>${trail}</small>
      </span>
      <span class="tufast-smart-search__arrow" aria-hidden="true">&rsaquo;</span>
    </a>
  `
}

function typeLabel(type: OpalSearchNode['type'], strings: SmartSearchStrings): string {
  switch (type) {
    case 'course':
      return strings.typeCourse
    case 'folder':
      return strings.typeFolder
    case 'file':
      return strings.typeFile
  }
}

function renderTrail(node: OpalSearchNode, type: string, separator: string): string {
  const parents = (node.pathTitles || []).filter(Boolean).slice(0, -1)
  const context =
    parents.length > 3
      ? [parents[0], '…', parents[parents.length - 1]].join(` ${separator} `)
      : parents.join(` ${separator} `)
  const kind = node.fileExtension ? node.fileExtension.toUpperCase() : type
  return context ? `${escapeHtml(kind)} &middot; ${escapeHtml(context)}` : escapeHtml(kind)
}
