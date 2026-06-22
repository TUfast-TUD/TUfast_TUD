import { OPAL_SMART_SEARCH_STRINGS } from '../../../../modules/opalSmartSearch/strings'
import type {
  OpalActiveIndexProgress,
  OpalSearchNode,
  OpalSearchResult
} from '../../../../modules/opalSmartSearch/types'

export function renderActiveIndexPrompt(
  element: HTMLElement,
  visible: boolean,
  progress?: OpalActiveIndexProgress
): void {
  element.hidden = !visible
  if (!visible) {
    element.innerHTML = ''
    return
  }

  if (progress?.status === 'running' || progress?.status === 'done') {
    element.innerHTML = renderActiveIndexProgress(progress)
    return
  }

  element.innerHTML = `
    <div>
      <strong>${escapeHtml(OPAL_SMART_SEARCH_STRINGS.palettePreloadPromptTitle)}</strong>
      <span>${escapeHtml(OPAL_SMART_SEARCH_STRINGS.palettePreloadPromptText)}</span>
    </div>
    <div class="tufast-smart-search__active-actions">
      <button type="button" data-active-index-action="start">${escapeHtml(
        OPAL_SMART_SEARCH_STRINGS.palettePreloadPromptStart
      )}</button>
      <button type="button" data-active-index-action="later">${escapeHtml(
        OPAL_SMART_SEARCH_STRINGS.palettePreloadPromptLater
      )}</button>
      <button type="button" data-active-index-action="dismiss">${escapeHtml(
        OPAL_SMART_SEARCH_STRINGS.palettePreloadPromptDismiss
      )}</button>
    </div>
  `
}

export function renderResults(results: OpalSearchResult[], selectedIndex: number): string {
  if (results.length === 0) {
    return `<div class="tufast-smart-search__empty">${escapeHtml(OPAL_SMART_SEARCH_STRINGS.paletteEmptyResults)}</div>`
  }

  return results.map((result, index) => renderResult(result.node, index, index === selectedIndex)).join('')
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

function renderActiveIndexProgress(progress: OpalActiveIndexProgress): string {
  const totalCourses = Math.max(0, progress.totalCourses)
  const completedCourses = Math.max(0, Math.min(progress.completedCourses, totalCourses))
  const coursePercent = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 100
  const completedGraphNodes =
    progress.status === 'done'
      ? 6
      : totalCourses > 0
        ? Math.min(5, Math.floor((completedCourses / totalCourses) * 6))
        : 0
  const pendingGraphNode = progress.status === 'running' ? Math.min(completedGraphNodes, 5) : -1
  const title =
    progress.status === 'done'
      ? OPAL_SMART_SEARCH_STRINGS.palettePreloadStatusDone
      : OPAL_SMART_SEARCH_STRINGS.palettePreloadStatusRunning
  const currentCourse = progress.currentCourseTitle
    ? `<span>${escapeHtml(OPAL_SMART_SEARCH_STRINGS.palettePreloadCurrentCourseLabel)}: ${escapeHtml(
        progress.currentCourseTitle
      )}</span>`
    : ''
  const nodes = Array.from({ length: 6 }, (_, index) => {
    const active = index < completedGraphNodes ? ' is-active' : ''
    const pending = index === pendingGraphNode ? ' is-pending' : ''
    return `<span class="tufast-smart-search__graph-node${active}${pending}"></span>`
  }).join('')

  return `
    <div class="tufast-smart-search__active-copy">
      <strong>${escapeHtml(title)}</strong>
      ${currentCourse}
      <span>${escapeHtml(OPAL_SMART_SEARCH_STRINGS.palettePreloadCoursesLabel)}: ${completedCourses}/${totalCourses} &middot; ${escapeHtml(
        OPAL_SMART_SEARCH_STRINGS.palettePreloadIndexedItemsLabel
      )}: ${progress.indexedItems}</span>
    </div>
    <div class="tufast-smart-search__graph" style="--graph-progress: ${coursePercent}%" aria-hidden="true">${nodes}</div>
  `
}

function renderResult(node: OpalSearchNode, index: number, selected: boolean): string {
  const extension = node.fileExtension ? ` &middot; .${escapeHtml(node.fileExtension.toUpperCase())}` : ''
  return `
    <a href="${escapeAttr(node.url)}" data-index="${index}"
      class="tufast-smart-search__result${selected ? ' is-selected' : ''}">
      <span class="tufast-smart-search__type tufast-smart-search__type--${node.type}">${typeLabel(node.type)}</span>
      <span class="tufast-smart-search__copy">
        <strong>${escapeHtml(node.title)}</strong>
        <small>${typeSubtitle(node.type)}${extension}</small>
      </span>
      <span class="tufast-smart-search__arrow" aria-hidden="true">&rsaquo;</span>
    </a>
  `
}

function typeLabel(type: OpalSearchNode['type']): string {
  switch (type) {
    case 'course':
      return 'K'
    case 'folder':
      return 'O'
    case 'file':
      return 'D'
    default:
      return 'A'
  }
}

function typeSubtitle(type: OpalSearchNode['type']): string {
  switch (type) {
    case 'course':
      return OPAL_SMART_SEARCH_STRINGS.paletteTypeCourse
    case 'folder':
      return OPAL_SMART_SEARCH_STRINGS.paletteTypeFolder
    case 'file':
      return OPAL_SMART_SEARCH_STRINGS.paletteTypeFile
    default:
      return OPAL_SMART_SEARCH_STRINGS.paletteTypeAction
  }
}
