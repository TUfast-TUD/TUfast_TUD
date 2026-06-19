import { getIndexedOpalSearchNode, searchIndexedOpalNodes } from './messages'
import { bootstrapCoursesFromStorage, maybeRunActiveIndexing } from './indexer'
import { extractCourseIdFromUrl, urlToOpalSearchId } from './opalParser'
import {
  loadSmartSearchSettings,
  OPAL_SMART_SEARCH_ACTIVE_PROMPT_DISMISSED_KEY,
  OPAL_SMART_SEARCH_ACTIVE_PROGRESS_EVENT,
  OPAL_SMART_SEARCH_ACTIVE_PROGRESS_KEY,
  OPAL_SMART_SEARCH_HIGHLIGHT_KEY,
  saveSmartSearchSettings
} from '../../../../modules/opalSmartSearch/settings'
import { OPAL_SMART_SEARCH_STRINGS } from '../../../../modules/opalSmartSearch/strings'
import type {
  OpalActiveIndexProgress,
  OpalSearchNode,
  OpalSearchResult,
  OpalStoredCourse
} from '../../../../modules/opalSmartSearch/types'
import { normalizeAllowedOpalUrl } from '../../../../modules/opalSmartSearch/urlPolicy'

const ACTIONS: OpalSearchResult[] = [
  {
    node: {
      id: '__action-open-opal-home',
      title: OPAL_SMART_SEARCH_STRINGS.actionOpenOpalHome,
      url: 'https://bildungsportal.sachsen.de/opal/home/',
      type: 'action',
      courseId: '',
      parentId: null,
      lastVisited: 0,
      visitCount: 0,
      searchText: 'home startseite dashboard'
    },
    score: 500
  },
  {
    node: {
      id: '__action-open-opal-courses',
      title: OPAL_SMART_SEARCH_STRINGS.actionOpenOpalCourses,
      url: 'https://bildungsportal.sachsen.de/opal/auth/resource/courses',
      type: 'action',
      courseId: '',
      parentId: null,
      lastVisited: 0,
      visitCount: 0,
      searchText: 'kurse courses meine'
    },
    score: 500
  }
]

const PRELOAD_FAVORITES_ACTION: OpalSearchResult = {
  node: {
    id: '__action-preload-opal-favorites',
    title: OPAL_SMART_SEARCH_STRINGS.actionPreloadOpalFavorites,
    url: 'https://bildungsportal.sachsen.de/opal/auth/resource/favorites',
    type: 'action',
    courseId: '',
    parentId: null,
    lastVisited: 0,
    visitCount: 0,
    searchText: 'favoriten favorites vorladen importieren aktualisieren'
  },
  score: 700
}

let registered = false

interface PaletteDefaults {
  results: OpalSearchResult[]
  showActiveIndexPrompt: boolean
  activeIndexProgress?: OpalActiveIndexProgress
}

export function bindOpalSmartSearchPalette(): void {
  // Register only once per OPAL page
  if (registered) return
  registered = true

  chrome.runtime.onMessage.addListener((request) => {
    // Background commands open the same dialog as the header trigger
    if (request.cmd === 'open_opal_smart_search') {
      openOpalSmartSearchPalette().catch((error) =>
        console.warn('[TUfast Smart Search] Could not open palette:', error)
      )
    }
  })

  injectHeaderTrigger()

  // OPAL changes parts of the header without a full reload
  const observer = new MutationObserver(() => {
    injectHeaderTrigger()
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}

function injectHeaderTrigger(): void {
  // Check if search trigger already exists
  if (document.getElementById('tufastSmartSearchTrigger')) return

  // Check if TUfast header exists
  const header = document.querySelector('.tufast-opal-header')
  if (!header) return

  // Create search-looking trigger
  const trigger = document.createElement('input')
  trigger.id = 'tufastSmartSearchTrigger'
  trigger.type = 'text'
  trigger.readOnly = true
  trigger.placeholder = OPAL_SMART_SEARCH_STRINGS.headerPlaceholder
  trigger.title = OPAL_SMART_SEARCH_STRINGS.openSearchTitle
  trigger.setAttribute('aria-label', OPAL_SMART_SEARCH_STRINGS.openSearchTitle)

  // Open the same dialog as the extension command
  const open = (event: Event) => {
    event.preventDefault()
    trigger.blur()
    openOpalSmartSearchPalette().catch((error) =>
      console.warn('[TUfast Smart Search] Could not open palette:', error)
    )
  }

  trigger.addEventListener('click', open)
  trigger.addEventListener('focus', open)
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') open(event)
  })

  header.appendChild(trigger)
}

export async function openOpalSmartSearchPalette(): Promise<void> {
  // Check if palette is already open
  if (document.getElementById('tufast-smart-search')) return

  // Create overlay
  const overlay = document.createElement('div')
  overlay.id = 'tufast-smart-search'
  overlay.innerHTML = `
    <div class="tufast-smart-search__panel" role="dialog" aria-modal="true" aria-label="${escapeAttr(
      OPAL_SMART_SEARCH_STRINGS.paletteLabel
    )}">
      <div class="tufast-smart-search__field">
        <span class="tufast-smart-search__lens" aria-hidden="true"></span>
        <input id="tufast-smart-search-input" type="text" autocomplete="off" spellcheck="false"
          placeholder="${escapeAttr(OPAL_SMART_SEARCH_STRINGS.palettePlaceholder)}" />
        <kbd>Esc</kbd>
      </div>
      <div id="tufast-smart-search-active-prompt" class="tufast-smart-search__active-prompt" hidden></div>
      <div id="tufast-smart-search-results" class="tufast-smart-search__results"></div>
      <div class="tufast-smart-search__footer">
        <span>${escapeHtml(OPAL_SMART_SEARCH_STRINGS.paletteFilterHint)}</span>
        <span>${escapeHtml(OPAL_SMART_SEARCH_STRINGS.paletteKeyboardHint)}</span>
      </div>
    </div>
  `

  document.body.appendChild(overlay)

  // Get palette elements
  const input = overlay.querySelector<HTMLInputElement>('#tufast-smart-search-input')!
  const activePromptElement = overlay.querySelector<HTMLElement>('#tufast-smart-search-active-prompt')!
  const resultsElement = overlay.querySelector<HTMLElement>('#tufast-smart-search-results')!
  const activeCourseId = extractCourseIdFromUrl(location.href)
  let results: OpalSearchResult[] = []
  let selectedIndex = 0
  let debounce: number | undefined
  let activePromptVisible = false
  let activeIndexProgress: OpalActiveIndexProgress | undefined
  const defaults = await getDefaultResults()
  const defaultResults = defaults.results

  const onActiveIndexProgress = (event: Event) => {
    activeIndexProgress = (event as CustomEvent<OpalActiveIndexProgress>).detail
    activePromptVisible = true
    render()
  }

  window.addEventListener(OPAL_SMART_SEARCH_ACTIVE_PROGRESS_EVENT, onActiveIndexProgress)

  const close = () => {
    window.removeEventListener(OPAL_SMART_SEARCH_ACTIVE_PROGRESS_EVENT, onActiveIndexProgress)
    overlay.remove()
  }

  const render = () => {
    renderActiveIndexPrompt(activePromptElement, activePromptVisible, activeIndexProgress)
    resultsElement.innerHTML = renderResults(results, selectedIndex)
  }

  const update = () => {
    // Small debounce while the user is typing
    window.clearTimeout(debounce)
    debounce = window.setTimeout(async () => {
      const query = input.value.trim()

      if (!query) {
        results = defaultResults
        selectedIndex = 0
        render()
        return
      }

      const actions = ACTIONS.filter((action) =>
        `${action.node.title} ${action.node.searchText}`.toLowerCase().includes(query.toLowerCase())
      )
      const searchResults = await searchIndexedOpalNodes(query, activeCourseId, 10)
      results = [...actions, ...searchResults].slice(0, 10)
      selectedIndex = 0
      render()
    }, 120)
  }

  const move = (delta: number) => {
    selectedIndex = Math.max(0, Math.min(results.length - 1, selectedIndex + delta))
    render()
    resultsElement.querySelectorAll<HTMLElement>('.tufast-smart-search__result')[selectedIndex]?.scrollIntoView({
      block: 'nearest'
    })
  }

  const openSelected = async () => {
    const selected = results[selectedIndex]
    if (!selected) return

    close()

    // Files are opened through their folder so OPAL can highlight them
    if (selected.node.type === 'file' && selected.node.parentId) {
      const parent = await getIndexedOpalSearchNode(selected.node.parentId)
      const parentUrl = parent ? normalizeAllowedOpalUrl(parent.url) : null
      const fileUrl = normalizeAllowedOpalUrl(selected.node.url)
      if (parentUrl && fileUrl) {
        await chrome.storage.local.set({
          [OPAL_SMART_SEARCH_HIGHLIGHT_KEY]: { title: selected.node.title, url: fileUrl }
        })
        location.href = parentUrl
        return
      }
    }

    const targetUrl = normalizeAllowedOpalUrl(selected.node.url)
    if (targetUrl) location.href = targetUrl
  }

  input.addEventListener('input', update)
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      move(1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      move(-1)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      openSelected()
    }
  })

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close()

    const promptAction = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-active-index-action]')
    if (promptAction) {
      event.preventDefault()
      handleActiveIndexPromptAction(promptAction.dataset.activeIndexAction || '', activePromptElement)
        .then((result) => {
          activePromptVisible = result.keepVisible
          activeIndexProgress = result.progress || activeIndexProgress
          render()
        })
        .catch((error) => console.warn('[TUfast Smart Search] Active indexing prompt failed:', error))
      return
    }

    const result = (event.target as HTMLElement).closest<HTMLElement>('.tufast-smart-search__result')
    if (!result) return

    event.preventDefault()
    selectedIndex = Number(result.dataset.index || 0)
    openSelected()
  })

  results = defaultResults
  activePromptVisible = defaults.showActiveIndexPrompt
  activeIndexProgress = defaults.activeIndexProgress
  render()
  requestAnimationFrame(() => input.focus())
}

async function getDefaultResults(): Promise<PaletteDefaults> {
  const data = await chrome.storage.local.get([
    'favoriten',
    OPAL_SMART_SEARCH_ACTIVE_PROMPT_DISMISSED_KEY,
    OPAL_SMART_SEARCH_ACTIVE_PROGRESS_KEY
  ])
  const settings = await loadSmartSearchSettings()
  const dismissed = Boolean(data[OPAL_SMART_SEARCH_ACTIVE_PROMPT_DISMISSED_KEY])
  const activeIndexProgress = readActiveIndexProgress(data[OPAL_SMART_SEARCH_ACTIVE_PROGRESS_KEY])
  const favoriten = data.favoriten
  const favorites = readStoredCourses(favoriten)
  const favoriteResults: OpalSearchResult[] = []
  const seen = new Set<string>()

  for (const course of favorites) {
    const title = course.title || course.name || ''
    const url = normalizeAllowedOpalUrl(course.href || course.link || '')
    const id = url ? urlToOpalSearchId(url) : ''
    if (!title || !url || !id || seen.has(id)) continue
    seen.add(id)

    favoriteResults.push({
      node: {
        id,
        title,
        url,
        type: 'course',
        courseId: extractCourseIdFromUrl(url),
        parentId: null,
        lastVisited: 0,
        visitCount: 0,
        source: 'user',
        searchText: 'favorit favorite kurs course'
      },
      score: 600
    })
  }

  const fallbackActions = favoriteResults.length === 0 ? [PRELOAD_FAVORITES_ACTION, ...ACTIONS] : ACTIONS
  return {
    results: [...favoriteResults, ...fallbackActions].slice(0, 10),
    showActiveIndexPrompt:
      favoriteResults.length > 0 &&
      ((!settings.activeIndexing && !dismissed) || activeIndexProgress?.status === 'running'),
    activeIndexProgress
  }
}

function renderActiveIndexPrompt(
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
      <strong>${escapeHtml(OPAL_SMART_SEARCH_STRINGS.activeIndexPromptTitle)}</strong>
      <span>${escapeHtml(OPAL_SMART_SEARCH_STRINGS.activeIndexPromptText)}</span>
    </div>
    <div class="tufast-smart-search__active-actions">
      <button type="button" data-active-index-action="start">${escapeHtml(
        OPAL_SMART_SEARCH_STRINGS.activeIndexPromptStart
      )}</button>
      <button type="button" data-active-index-action="later">${escapeHtml(
        OPAL_SMART_SEARCH_STRINGS.activeIndexPromptLater
      )}</button>
      <button type="button" data-active-index-action="dismiss">${escapeHtml(
        OPAL_SMART_SEARCH_STRINGS.activeIndexPromptDismiss
      )}</button>
    </div>
  `
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
      ? OPAL_SMART_SEARCH_STRINGS.activeIndexProgressDone
      : OPAL_SMART_SEARCH_STRINGS.activeIndexPromptRunning
  const currentCourse = progress.currentCourseTitle
    ? `<span>${escapeHtml(OPAL_SMART_SEARCH_STRINGS.activeIndexProgressCourse)}: ${escapeHtml(
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
      <span>${escapeHtml(OPAL_SMART_SEARCH_STRINGS.activeIndexProgressCourses)}: ${completedCourses}/${totalCourses} · ${escapeHtml(
        OPAL_SMART_SEARCH_STRINGS.activeIndexProgressIndexed
      )}: ${progress.indexedItems}</span>
    </div>
    <div class="tufast-smart-search__graph" style="--graph-progress: ${coursePercent}%" aria-hidden="true">${nodes}</div>
  `
}

interface ActiveIndexPromptResult {
  keepVisible: boolean
  progress?: OpalActiveIndexProgress
}

async function handleActiveIndexPromptAction(
  action: string,
  element: HTMLElement
): Promise<ActiveIndexPromptResult> {
  if (action === 'later') return { keepVisible: false }

  if (action === 'dismiss') {
    await chrome.storage.local.set({ [OPAL_SMART_SEARCH_ACTIVE_PROMPT_DISMISSED_KEY]: true })
    return { keepVisible: false }
  }

  if (action !== 'start') return { keepVisible: true }

  element.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
    button.disabled = true
  })
  const startButton = element.querySelector<HTMLButtonElement>('[data-active-index-action="start"]')
  if (startButton) startButton.textContent = OPAL_SMART_SEARCH_STRINGS.activeIndexPromptRunning

  const settings = await loadSmartSearchSettings()
  await saveSmartSearchSettings({ ...settings, activeIndexing: true })
  await bootstrapCoursesFromStorage()

  const progress: OpalActiveIndexProgress = {
    status: 'running',
    startedAt: Date.now(),
    updatedAt: Date.now(),
    totalCourses: 0,
    completedCourses: 0,
    indexedItems: 0
  }
  await chrome.storage.local.set({ [OPAL_SMART_SEARCH_ACTIVE_PROGRESS_KEY]: progress })

  maybeRunActiveIndexing().catch((error) => console.warn('[TUfast Smart Search] Active indexing failed:', error))
  return { keepVisible: true, progress }
}

function readActiveIndexProgress(value: unknown): OpalActiveIndexProgress | undefined {
  if (!value || typeof value !== 'object') return undefined
  const progress = value as Partial<OpalActiveIndexProgress>
  if (progress.status !== 'running' && progress.status !== 'done' && progress.status !== 'idle') return undefined

  return {
    status: progress.status,
    startedAt: Number(progress.startedAt || 0),
    updatedAt: Number(progress.updatedAt || 0),
    totalCourses: Number(progress.totalCourses || 0),
    completedCourses: Number(progress.completedCourses || 0),
    indexedItems: Number(progress.indexedItems || 0),
    currentCourseTitle: progress.currentCourseTitle
  }
}

function readStoredCourses(value: unknown): OpalStoredCourse[] {
  if (Array.isArray(value)) return value as OpalStoredCourse[]
  if (typeof value !== 'string') return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function renderResults(results: OpalSearchResult[], selectedIndex: number): string {
  if (results.length === 0) {
    return `<div class="tufast-smart-search__empty">${escapeHtml(OPAL_SMART_SEARCH_STRINGS.emptyResults)}</div>`
  }

  return results.map((result, index) => renderResult(result.node, index, index === selectedIndex)).join('')
}

function renderResult(node: OpalSearchNode, index: number, selected: boolean): string {
  const extension = node.fileExtension ? ` · .${escapeHtml(node.fileExtension.toUpperCase())}` : ''
  return `
    <a href="${escapeAttr(node.url)}" data-index="${index}"
      class="tufast-smart-search__result${selected ? ' is-selected' : ''}">
      <span class="tufast-smart-search__type tufast-smart-search__type--${node.type}">${typeLabel(node.type)}</span>
      <span class="tufast-smart-search__copy">
        <strong>${escapeHtml(node.title)}</strong>
        <small>${typeSubtitle(node.type)}${extension}</small>
      </span>
      <span class="tufast-smart-search__arrow" aria-hidden="true">›</span>
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
      return OPAL_SMART_SEARCH_STRINGS.typeCourse
    case 'folder':
      return OPAL_SMART_SEARCH_STRINGS.typeFolder
    case 'file':
      return OPAL_SMART_SEARCH_STRINGS.typeFile
    default:
      return OPAL_SMART_SEARCH_STRINGS.typeAction
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttr(value: string): string {
  return escapeHtml(value)
}
