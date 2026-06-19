import { getIndexedOpalSearchNode, searchIndexedOpalNodes } from './messages'
import { extractCourseIdFromUrl } from './opalParser'
import { OPAL_SMART_SEARCH_HIGHLIGHT_KEY } from '../../../../modules/opalSmartSearch/settings'
import { OPAL_SMART_SEARCH_STRINGS } from '../../../../modules/opalSmartSearch/strings'
import type { OpalSearchNode, OpalSearchResult } from '../../../../modules/opalSmartSearch/types'
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

let registered = false

export function bindOpalSmartSearchPalette(): void {
  // Register only once per OPAL page
  if (registered) return
  registered = true

  chrome.runtime.onMessage.addListener((request) => {
    // Background commands open the same dialog as the header trigger
    if (request.cmd === 'open_opal_smart_search') {
      openOpalSmartSearchPalette()
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
    openOpalSmartSearchPalette()
  }

  trigger.addEventListener('click', open)
  trigger.addEventListener('focus', open)
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') open(event)
  })

  header.appendChild(trigger)
}

export function openOpalSmartSearchPalette(): void {
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
  const resultsElement = overlay.querySelector<HTMLElement>('#tufast-smart-search-results')!
  const activeCourseId = extractCourseIdFromUrl(location.href)
  let results: OpalSearchResult[] = []
  let selectedIndex = 0
  let debounce: number | undefined

  const close = () => overlay.remove()

  const render = () => {
    resultsElement.innerHTML = renderResults(results, selectedIndex)
  }

  const update = () => {
    // Small debounce while the user is typing
    window.clearTimeout(debounce)
    debounce = window.setTimeout(async () => {
      const query = input.value.trim()

      if (!query) {
        results = ACTIONS
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

    const result = (event.target as HTMLElement).closest<HTMLElement>('.tufast-smart-search__result')
    if (!result) return

    event.preventDefault()
    selectedIndex = Number(result.dataset.index || 0)
    openSelected()
  })

  results = ACTIONS
  render()
  requestAnimationFrame(() => input.focus())
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
