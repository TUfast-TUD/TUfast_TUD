import { getIndexedOpalSearchNode, searchIndexedOpalNodes } from './messages'
import { startActiveIndexing } from './indexer'
import { extractCourseIdFromUrl, urlToOpalSearchId } from './opalParser'
import { escapeAttr, escapeHtml, renderActiveIndexPrompt, renderResults } from './paletteRender'
import {
  loadSmartSearchSettings,
  OPAL_SMART_SEARCH_ACTIVE_PROMPT_DISMISSED_KEY,
  OPAL_SMART_SEARCH_ACTIVE_PROGRESS_EVENT,
  OPAL_SMART_SEARCH_ACTIVE_PROGRESS_KEY,
  OPAL_SMART_SEARCH_HIGHLIGHT_KEY
} from '../../../../modules/opalSmartSearch/settings'
import { OPAL_SMART_SEARCH_STRINGS } from '../../../../modules/opalSmartSearch/strings'
import type {
  OpalActiveIndexProgress,
  OpalSearchResult,
  OpalStoredCourse
} from '../../../../modules/opalSmartSearch/types'
import { normalizeAllowedOpalUrl } from '../../../../modules/opalSmartSearch/urlPolicy'

const ACTIONS: OpalSearchResult[] = [
  {
    node: {
      id: '__action-open-opal-home',
      title: OPAL_SMART_SEARCH_STRINGS.paletteActionOpenOpalHome,
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
      title: OPAL_SMART_SEARCH_STRINGS.paletteActionOpenOpalCourses,
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
    title: OPAL_SMART_SEARCH_STRINGS.paletteActionPreloadOpalFavorites,
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

  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    // Background commands open the same dialog as the header trigger
    if (request.cmd === 'open_opal_smart_search') {
      openOpalSmartSearchPalette()
        .then(() => sendResponse(true))
        .catch((error) => {
          console.warn('[TUfast Smart Search] Could not open palette:', error)
          sendResponse(false)
        })
      return true
    }

    if (request.cmd === 'start_opal_smart_search_preload') {
      startActiveIndexing()
        .then(() => sendResponse(true))
        .catch((error) => {
          console.warn('[TUfast Smart Search] Could not start active indexing:', error)
          sendResponse(false)
        })
      return true
    }

    return false
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
  trigger.placeholder = OPAL_SMART_SEARCH_STRINGS.paletteHeaderPlaceholder
  trigger.title = OPAL_SMART_SEARCH_STRINGS.paletteOpenTitle
  trigger.setAttribute('aria-label', OPAL_SMART_SEARCH_STRINGS.paletteOpenTitle)

  // Open the same dialog as the extension command
  const open = (event: Event) => {
    event.preventDefault()
    trigger.blur()
    openOpalSmartSearchPalette().catch((error) => console.warn('[TUfast Smart Search] Could not open palette:', error))
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
      OPAL_SMART_SEARCH_STRINGS.paletteDialogLabel
    )}">
      <div class="tufast-smart-search__field">
        <span class="tufast-smart-search__lens" aria-hidden="true"></span>
        <input id="tufast-smart-search-input" type="text" autocomplete="off" spellcheck="false"
          placeholder="${escapeAttr(OPAL_SMART_SEARCH_STRINGS.paletteInputPlaceholder)}" />
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

interface ActiveIndexPromptResult {
  keepVisible: boolean
  progress?: OpalActiveIndexProgress
}

async function handleActiveIndexPromptAction(action: string, element: HTMLElement): Promise<ActiveIndexPromptResult> {
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
  if (startButton) startButton.textContent = OPAL_SMART_SEARCH_STRINGS.palettePreloadStatusRunning

  const progress = await startActiveIndexing()
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
