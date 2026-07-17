import { getIndexedOpalSearchNode, getOpalSearchIndexStats, searchIndexedOpalNodes } from './messages'
import { canRunActiveIndexingOnCurrentPage, startActiveIndexing } from './indexer'
import { extractCourseIdFromUrl, urlToOpalSearchId } from './opalParser'
import { escapeAttr, escapeHtml, renderResults } from './paletteRender'
import { SmartSearchKey, smartSearchProgressEvent } from '../../../../modules/opalSmartSearch/settings'
import type { OpalActiveIndexProgress, OpalSearchResult } from '../../../../modules/opalSmartSearch/types'
import { normalizeAllowedOpalUrl } from '../../../../modules/opalSmartSearch/urlPolicy'
import {
  readStoredCourses,
  readStoredCourseTitle,
  readStoredCourseUrl,
  uniqueStoredCourses
} from '../../../../modules/opalSmartSearch/storedCourses'
import { shouldRecommendSmartSearchImprove } from '../../../../modules/opalSmartSearch/recommendation'

type SmartSearchStrings = typeof globalThis.TUFAST_STRINGS.opal.smartSearch

const DEFAULT_FAVORITE_RESULTS = 8

let registered = false

interface PaletteDefaults {
  results: OpalSearchResult[]
  activeIndexProgress?: OpalActiveIndexProgress
  indexEmpty: boolean
  lastIndexedAt: number
  improveRecommended: boolean
  theme: 'light' | 'dark'
}

export function bindOpalSmartSearchPalette(strings: SmartSearchStrings): void {
  // Register only once per OPAL page
  if (registered) return
  registered = true

  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    // Background commands open the same dialog as the header trigger
    if (request.cmd === 'open_opal_smart_search') {
      openOpalSmartSearchPalette(strings, readOptionalString(request.rawQuery))
        .then(() => sendResponse(true))
        .catch((error) => {
          console.warn('[TUfast Smart Search] Could not open palette:', error)
          sendResponse(false)
        })
      return true
    }

    if (request.cmd === 'start_opal_smart_search_preload') {
      if (!canRunActiveIndexingOnCurrentPage()) {
        sendResponse(false)
        return false
      }
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

  injectHeaderTrigger(strings)

  // OPAL changes parts of the header without a full reload
  const observer = new MutationObserver(() => {
    injectHeaderTrigger(strings)
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}

function injectHeaderTrigger(strings: SmartSearchStrings): void {
  // Check if search trigger already exists
  if (document.getElementById('tufastSmartSearchTrigger')) return

  // Check if TUfast header exists
  const header = document.querySelector('.tufast-opal-header')
  if (!header) return

  // Create compact search trigger
  const trigger = document.createElement('button')
  trigger.id = 'tufastSmartSearchTrigger'
  trigger.type = 'button'
  trigger.title = strings.openTitle
  trigger.setAttribute('aria-label', strings.openTitle)
  trigger.innerHTML = `
    <span class="tufast-smart-search-trigger__lens" aria-hidden="true"></span>
    <span class="tufast-smart-search-trigger__label">${escapeHtml(strings.headerLabel)}</span>
    <kbd>${escapeHtml(strings.headerShortcut)}</kbd>
  `

  // Open the same dialog as the extension command
  const open = (event: Event) => {
    event.preventDefault()
    openOpalSmartSearchPalette(strings).catch((error) =>
      console.warn('[TUfast Smart Search] Could not open palette:', error)
    )
  }

  trigger.addEventListener('click', open)

  header.appendChild(trigger)
}

export async function openOpalSmartSearchPalette(strings: SmartSearchStrings, initialQuery?: string): Promise<void> {
  const query = typeof initialQuery === 'string' ? initialQuery.trim() : ''
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  const previousBodyOverflow = document.body.style.overflow

  // Check if palette is already open
  const existingInput = document.getElementById('tufast-smart-search-input') as HTMLInputElement | null
  if (existingInput) {
    if (query) {
      existingInput.value = query
      existingInput.dispatchEvent(new Event('input', { bubbles: true }))
    }
    existingInput.focus()
    return
  }

  // Create overlay
  const overlay = document.createElement('div')
  overlay.id = 'tufast-smart-search'
  overlay.innerHTML = `
    <div class="tufast-smart-search__panel" role="dialog" aria-modal="true" aria-label="${escapeAttr(
      strings.dialogLabel
    )}">
      <div class="tufast-smart-search__field">
        <span class="tufast-smart-search__lens" aria-hidden="true"></span>
        <input id="tufast-smart-search-input" type="text" role="combobox" aria-autocomplete="list"
          aria-expanded="true" aria-controls="tufast-smart-search-results" autocomplete="off" spellcheck="false"
          placeholder="${escapeAttr(strings.inputPlaceholder)}" />
        <kbd>Esc</kbd>
      </div>
      <div id="tufast-smart-search-results" class="tufast-smart-search__results" role="listbox"></div>
      <div id="tufast-smart-search-usage-warning" class="tufast-smart-search__usage-warning" hidden>
        ${escapeHtml(strings.preloadUsageWarning)}
      </div>
      <div class="tufast-smart-search__actionbar">
        <button id="tufast-smart-search-improve" class="tufast-smart-search__actionbar-button" type="button">
          <span class="tufast-smart-search__actionbar-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M20 7v5h-5M4 17v-5h5M6.1 8a7 7 0 0 1 11.4-2M17.9 16a7 7 0 0 1-11.4 2" /></svg>
          </span>
          <span class="tufast-smart-search__actionbar-copy" aria-live="polite">
            <span id="tufast-smart-search-improve-label">${escapeHtml(strings.actionImproveSmartSearch)}</span>
            <small id="tufast-smart-search-improve-meta"></small>
          </span>
          <span id="tufast-smart-search-improve-progress" class="tufast-smart-search__actionbar-progress" hidden>
            <span></span>
          </span>
        </button>
        <button id="tufast-smart-search-settings" class="tufast-smart-search__actionbar-button" type="button">
          <span class="tufast-smart-search__actionbar-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M4 7h16M7 4v6M4 17h16M17 14v6" /></svg>
          </span>
          <span>${escapeHtml(strings.actionOpenSmartSearchSettings)}</span>
        </button>
      </div>
      <div class="tufast-smart-search__footer">
        <span>${escapeHtml(strings.filterHint)}</span>
        <span>${escapeHtml(strings.keyboardHint)}</span>
      </div>
    </div>
  `

  document.body.appendChild(overlay)
  document.body.style.overflow = 'hidden'

  // Get palette elements
  const input = overlay.querySelector<HTMLInputElement>('#tufast-smart-search-input')!
  const resultsElement = overlay.querySelector<HTMLElement>('#tufast-smart-search-results')!
  const usageWarning = overlay.querySelector<HTMLElement>('#tufast-smart-search-usage-warning')!
  const improveButton = overlay.querySelector<HTMLButtonElement>('#tufast-smart-search-improve')!
  const improveLabel = overlay.querySelector<HTMLElement>('#tufast-smart-search-improve-label')!
  const improveMeta = overlay.querySelector<HTMLElement>('#tufast-smart-search-improve-meta')!
  const improveProgress = overlay.querySelector<HTMLElement>('#tufast-smart-search-improve-progress')!
  const improveProgressBar = improveProgress.querySelector<HTMLElement>('span')!
  const settingsButton = overlay.querySelector<HTMLButtonElement>('#tufast-smart-search-settings')!
  const activeCourseId = extractCourseIdFromUrl(location.href)
  let results: OpalSearchResult[] = []
  let selectedIndex = 0
  let debounce: number | undefined
  let requestId = 0
  let activeIndexProgress: OpalActiveIndexProgress | undefined
  let controlPending: 'start' | 'stop' | null = null
  let controlRequestId = 0
  let controlError: string | null = null
  let searchFailed = false
  let defaults: PaletteDefaults | undefined
  let defaultResults: OpalSearchResult[] = []
  let improveRecommended = false
  let defaultsRequestId = 0
  // Defaults load in the background so the palette is usable immediately; the stored theme corrects this guess.
  overlay.classList.toggle('is-light', readTheme(undefined) === 'light')

  const applyDefaults = (next: PaletteDefaults) => {
    defaults = next
    defaultResults = next.results
    improveRecommended = next.improveRecommended
    overlay.classList.toggle('is-light', next.theme === 'light')
    // Live progress events beat the fetched snapshot
    if (!activeIndexProgress) {
      activeIndexProgress = next.activeIndexProgress?.status === 'idle' ? undefined : next.activeIndexProgress
    }
    if (!input.value.trim()) {
      results = defaultResults
      selectedIndex = 0
    }
    render()
  }

  const refreshDefaults = async () => {
    const currentDefaultsRequest = ++defaultsRequestId
    try {
      const next = await getDefaultResults()
      if (currentDefaultsRequest !== defaultsRequestId || !overlay.isConnected) return
      applyDefaults(next)
    } catch (error) {
      console.warn('[TUfast Smart Search] Could not load palette defaults:', error)
    }
  }

  const onActiveIndexProgress = (event: Event) => {
    activeIndexProgress = (event as CustomEvent<OpalActiveIndexProgress>).detail
    if (activeIndexProgress.status === 'done') {
      improveRecommended = false
      refreshDefaults()
    }
    render()
  }

  const onStorageChanged = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
    if (areaName !== 'local' || !changes[SmartSearchKey.activeProgress]) return
    activeIndexProgress = readActiveIndexProgress(changes[SmartSearchKey.activeProgress].newValue)
    controlError = null
    if (activeIndexProgress?.status === 'done') {
      improveRecommended = false
      refreshDefaults()
    }
    render()
  }

  window.addEventListener(smartSearchProgressEvent, onActiveIndexProgress)
  chrome.storage.onChanged.addListener(onStorageChanged)

  const close = () => {
    requestId += 1
    controlRequestId += 1
    defaultsRequestId += 1
    window.clearTimeout(debounce)
    window.removeEventListener(smartSearchProgressEvent, onActiveIndexProgress)
    chrome.storage.onChanged.removeListener(onStorageChanged)
    overlay.remove()
    document.body.style.overflow = previousBodyOverflow
    if (previousFocus?.isConnected) previousFocus.focus()
  }

  const render = () => {
    const emptyMessage = input.value.trim()
      ? searchFailed
        ? strings.searchFailed
        : strings.emptyResults
      : defaults?.indexEmpty
        ? strings.emptyIndex
        : strings.emptyStart
    resultsElement.innerHTML = renderResults(results, selectedIndex, strings, emptyMessage)
    const activeResult = resultsElement.querySelector<HTMLElement>(`#tufast-smart-search-result-${selectedIndex}`)
    if (activeResult) input.setAttribute('aria-activedescendant', activeResult.id)
    else input.removeAttribute('aria-activedescendant')
    improveButton.classList.toggle('is-recommended', improveRecommended)
    renderImproveButton()
  }

  const renderImproveButton = () => {
    const progress = activeIndexProgress
    const starting = progress?.status === 'starting'
    const running = progress?.status === 'running'
    const done = progress?.status === 'done'
    const failed = progress?.status === 'failed'
    improveButton.classList.toggle('is-running', Boolean(starting || running))
    improveButton.classList.toggle('is-failed', Boolean(failed || controlError))
    improveButton.disabled = controlPending === 'stop'
    usageWarning.hidden = !starting && !running

    if (controlPending === 'stop') {
      improveLabel.textContent = strings.preloadStatusStopping
      improveMeta.textContent = ''
      improveProgress.hidden = true
      improveProgressBar.style.width = '0%'
      return
    }

    if (controlPending === 'start' || starting) {
      improveLabel.textContent = strings.preloadStopIndexing
      improveMeta.textContent = strings.preloadStatusStarting
      improveProgress.hidden = true
      improveProgressBar.style.width = '0%'
      return
    }

    if (running) {
      const totalCourses = Math.max(0, progress.totalCourses)
      const completedCourses = Math.max(0, Math.min(progress.completedCourses, totalCourses))
      const failedCourses = Math.max(0, Math.min(progress.failedCourses || 0, totalCourses - completedCourses))
      const processedCourses = completedCourses + failedCourses
      const coursePercent = totalCourses > 0 ? Math.round((processedCourses / totalCourses) * 100) : 0
      improveLabel.textContent = strings.preloadStopIndexing
      improveMeta.textContent =
        controlError ||
        (totalCourses
          ? `${processedCourses}/${totalCourses} ${strings.preloadCoursesLabel} · ${progress.indexedItems} ${
              strings.preloadIndexedItemsLabel
            }${progress.currentCourseTitle ? ` · ${progress.currentCourseTitle}` : ''}`
          : '')
      improveProgress.hidden = false
      improveProgressBar.style.width = `${coursePercent}%`
      return
    }

    if (failed) {
      const totalCourses = Math.max(0, progress.totalCourses)
      const processedCourses = Math.min(
        totalCourses,
        Math.max(0, progress.completedCourses) + Math.max(0, progress.failedCourses || 0)
      )
      const coursePercent = totalCourses > 0 ? Math.round((processedCourses / totalCourses) * 100) : 0
      improveLabel.textContent = strings.preloadStatusFailed
      improveMeta.textContent =
        controlError ||
        (totalCourses
          ? `${processedCourses}/${totalCourses} ${strings.preloadCoursesLabel} · ${progress.indexedItems} ${strings.preloadIndexedItemsLabel}`
          : `${progress.indexedItems} ${strings.preloadIndexedItemsLabel}`)
      improveProgress.hidden = totalCourses === 0
      improveProgressBar.style.width = `${coursePercent}%`
      return
    }

    if (done) {
      improveLabel.textContent = strings.preloadStatusDone
      improveMeta.textContent = `${progress.totalCourses} ${strings.preloadCoursesLabel} · ${progress.indexedItems} ${strings.preloadIndexedItemsLabel}`
      improveProgress.hidden = false
      improveProgressBar.style.width = '100%'
      return
    }

    improveLabel.textContent = strings.actionImproveSmartSearch
    improveMeta.textContent =
      controlError ||
      (defaults?.lastIndexedAt ? `${strings.lastImprovedLabel} ${formatRelativeTime(defaults.lastIndexedAt)}` : '')
    improveProgress.hidden = true
    improveProgressBar.style.width = '0%'
  }

  const update = () => {
    // Small debounce while the user is typing
    const currentRequest = ++requestId
    window.clearTimeout(debounce)
    debounce = window.setTimeout(async () => {
      const query = input.value.trim()

      if (!query) {
        searchFailed = false
        results = defaultResults
        selectedIndex = 0
        render()
        return
      }

      try {
        const searchResults = await searchIndexedOpalNodes(query, activeCourseId, 10)
        if (currentRequest !== requestId) return
        searchFailed = false
        results = searchResults
        selectedIndex = 0
        render()
      } catch {
        if (currentRequest !== requestId) return
        searchFailed = true
        results = []
        selectedIndex = 0
        render()
      }
    }, 120)
  }

  const move = (delta: number) => {
    selectedIndex = Math.max(0, Math.min(results.length - 1, selectedIndex + delta))
    render()
    resultsElement.querySelectorAll<HTMLElement>('.tufast-smart-search__result')[selectedIndex]?.scrollIntoView({
      block: 'nearest'
    })
  }

  const controlImprove = async () => {
    const stopping =
      controlPending === 'start' ||
      activeIndexProgress?.status === 'starting' ||
      activeIndexProgress?.status === 'running'
    const currentControlRequest = ++controlRequestId
    controlPending = stopping ? 'stop' : 'start'
    controlError = null
    render()

    try {
      const succeeded = await chrome.runtime.sendMessage({
        cmd: stopping ? 'cancel_opal_smart_search_preload' : 'start_opal_smart_search_preload'
      })
      if (currentControlRequest !== controlRequestId) return
      if (!succeeded) throw new Error('SmartSearch indexing control failed')
      const data = await chrome.storage.local.get([SmartSearchKey.activeProgress])
      activeIndexProgress = readActiveIndexProgress(data[SmartSearchKey.activeProgress])
    } catch (error) {
      if (currentControlRequest !== controlRequestId) return
      controlError = stopping ? strings.preloadStopFailed : strings.preloadStartFailed
      console.warn('[TUfast Smart Search] Could not change indexing:', error)
    } finally {
      if (currentControlRequest === controlRequestId) {
        controlPending = null
        render()
      }
    }
  }

  const openSelected = async (newTab = false) => {
    const selected = results[selectedIndex]
    if (!selected) return

    const navigate = (url: string) => {
      if (newTab) window.open(url, '_blank', 'noopener')
      else location.href = url
    }

    await chrome.runtime
      .sendMessage({ cmd: 'opal_smart_search_record_visit', nodeId: selected.node.id })
      .catch(() => false)
    close()

    // Files are opened through their folder so OPAL can highlight them
    if (selected.node.type === 'file' && selected.node.parentId) {
      const parent = await getIndexedOpalSearchNode(selected.node.parentId)
      const parentUrl = parent ? normalizeAllowedOpalUrl(parent.url) : null
      const fileUrl = normalizeAllowedOpalUrl(selected.node.url)
      if (parentUrl && fileUrl) {
        await chrome.storage.local.set({
          [SmartSearchKey.highlight]: { title: selected.node.title, url: fileUrl }
        })
        navigate(parentUrl)
        return
      }
    }

    const targetUrl = normalizeAllowedOpalUrl(selected.node.url)
    if (targetUrl) navigate(targetUrl)
  }

  input.addEventListener('input', update)
  improveButton.addEventListener('click', () => {
    controlImprove()
  })
  settingsButton.addEventListener('click', () => {
    chrome.runtime
      .sendMessage({ cmd: 'open_settings_page', params: 'OpalSmartSearch' })
      .catch((error) => console.warn('[TUfast Smart Search] Could not open settings:', error))
    close()
  })
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      move(1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      move(-1)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      openSelected(event.ctrlKey || event.metaKey)
    }
  })

  overlay.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }

    if (event.key !== 'Tab') return
    const focusable = Array.from(
      overlay.querySelectorAll<HTMLElement>('input, a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter((element) => !element.hidden)
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!first || !last) return

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  })

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close()

    const result = (event.target as HTMLElement).closest<HTMLElement>('.tufast-smart-search__result')
    if (!result) return

    event.preventDefault()
    selectedIndex = Number(result.dataset.index || 0)
    openSelected(event.ctrlKey || event.metaKey)
  })

  if (query) {
    input.value = query
    update()
  } else {
    render()
  }
  requestAnimationFrame(() => input.focus())
  refreshDefaults()
}

async function getDefaultResults(): Promise<PaletteDefaults> {
  // Three independent sources — fetch them in parallel so the palette fills quickly
  const dataPromise = chrome.storage.local.get([
    'favoriten',
    'meine_kurse',
    'theme',
    SmartSearchKey.activeProgress,
    SmartSearchKey.successfulRuns
  ])
  const [data, rawProgress, stats] = await Promise.all([
    dataPromise,
    chrome.runtime
      .sendMessage({ cmd: 'opal_smart_search_progress' })
      .catch(async () => (await dataPromise)[SmartSearchKey.activeProgress]),
    getOpalSearchIndexStats()
  ])
  const activeIndexProgress = readActiveIndexProgress(rawProgress)
  const favorites = uniqueStoredCourses(readStoredCourses(data.favoriten))
  const defaultCourses = favorites.length ? favorites : uniqueStoredCourses(readStoredCourses(data.meine_kurse))
  const successfulRuns = readSuccessfulRuns(data[SmartSearchKey.successfulRuns])
  const courseResults: OpalSearchResult[] = []
  const seen = new Set<string>()

  for (const course of defaultCourses) {
    const title = readStoredCourseTitle(course)
    const url = readStoredCourseUrl(course)
    if (!title || !url) continue
    const id = urlToOpalSearchId(url)
    if (!id || seen.has(id)) continue
    seen.add(id)

    courseResults.push({
      node: {
        id,
        title,
        url,
        type: 'course',
        courseId: extractCourseIdFromUrl(url),
        parentId: null,
        lastVisited: 0,
        visitCount: 0,
        source: 'user'
      },
      score: 600
    })
  }

  return {
    results: courseResults.slice(0, DEFAULT_FAVORITE_RESULTS),
    activeIndexProgress,
    indexEmpty: stats.count === 0,
    lastIndexedAt: stats.lastIndexedAt,
    improveRecommended: shouldRecommendSmartSearchImprove(
      favorites.map(readStoredCourseUrl).filter((url): url is string => Boolean(url)),
      successfulRuns
    ),
    theme: readTheme(data.theme)
  }
}

function readActiveIndexProgress(value: unknown): OpalActiveIndexProgress | undefined {
  if (!value || typeof value !== 'object') return undefined
  const progress = value as Partial<OpalActiveIndexProgress>
  if (
    progress.status !== 'starting' &&
    progress.status !== 'running' &&
    progress.status !== 'done' &&
    progress.status !== 'failed' &&
    progress.status !== 'idle'
  )
    return undefined

  return {
    status: progress.status,
    startedAt: readNumber(progress.startedAt),
    updatedAt: readNumber(progress.updatedAt),
    totalCourses: readNumber(progress.totalCourses),
    completedCourses: readNumber(progress.completedCourses),
    failedCourses: readNumber(progress.failedCourses),
    indexedItems: readNumber(progress.indexedItems),
    currentCourseTitle: progress.currentCourseTitle
  }
}

function readSuccessfulRuns(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, number] => typeof entry[1] === 'number')
  )
}

function formatRelativeTime(timestamp: number): string {
  const formatter = new Intl.RelativeTimeFormat(navigator.language, { numeric: 'auto' })
  const minutes = Math.round(Math.max(0, Date.now() - timestamp) / 60000)
  if (minutes < 60) return formatter.format(-minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (hours < 24) return formatter.format(-hours, 'hour')
  const days = Math.round(hours / 24)
  if (days < 7) return formatter.format(-days, 'day')
  if (days < 35) return formatter.format(-Math.round(days / 7), 'week')
  return formatter.format(-Math.round(days / 30), 'month')
}

function readTheme(value: unknown): 'light' | 'dark' {
  if (value === 'light' || value === 'dark') return value
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function readNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}
