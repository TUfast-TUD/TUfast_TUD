const OPAL_SMART_SEARCH_ACTIVE_PROGRESS_KEY = 'opalSmartSearchActiveProgress'
const OPAL_SMART_SEARCH_OPEN_AFTER_OPAL_LOAD_KEY = 'opalSmartSearchOpenAfterOpalLoad'

;(async () => {
  // Only run on OPAL pages
  if (!location.href.includes('/opal/')) return

  // Load feature modules dynamically, so OPAL gets only what it needs
  const settingsModule = await import(chrome.runtime.getURL('modules/opalSmartSearch/settings.js'))
  const indexerModule = await import(chrome.runtime.getURL('contentScripts/other/opal/smartSearch/indexer.js'))
  const highlightModule = await import(chrome.runtime.getURL('contentScripts/other/opal/smartSearch/highlight.js'))
  const paletteModule = await import(chrome.runtime.getURL('contentScripts/other/opal/smartSearch/palette.js'))

  const settings = await settingsModule.loadSmartSearchSettings()
  if (!settings.enabled) return

  // Setup UI and file highlighting
  paletteModule.bindOpalSmartSearchPalette()
  await highlightModule.checkAndHighlightIndexedFile()
  await openPaletteFromPendingHotkey(paletteModule)

  // Index what the user already sees
  if (settings.passiveIndexing) {
    await indexerModule.bootstrapCoursesFromStorage()
    await indexerModule.indexCurrentOpalPage()
  }

  // Resume only an explicitly started preload job
  const data = await chrome.storage.local.get([OPAL_SMART_SEARCH_ACTIVE_PROGRESS_KEY])
  const activeProgress = data[OPAL_SMART_SEARCH_ACTIVE_PROGRESS_KEY]
  if (settings.activeIndexing && activeProgress?.status === 'running') {
    window.setTimeout(() => {
      indexerModule
        .maybeRunActiveIndexing()
        .catch((error) => console.warn('[TUfast Smart Search] Active indexing failed:', error))
    }, 3000)
  }
})().catch((error) => console.warn('[TUfast Smart Search] Startup failed:', error))

async function openPaletteFromPendingHotkey(paletteModule: typeof import('./palette')): Promise<void> {
  const data = await chrome.storage.local.get([OPAL_SMART_SEARCH_OPEN_AFTER_OPAL_LOAD_KEY])
  const expiresAt = Number(data[OPAL_SMART_SEARCH_OPEN_AFTER_OPAL_LOAD_KEY] || 0)
  if (!expiresAt) return

  await chrome.storage.local.remove([OPAL_SMART_SEARCH_OPEN_AFTER_OPAL_LOAD_KEY])
  if (Date.now() > expiresAt) return

  window.setTimeout(() => {
    paletteModule
      .openOpalSmartSearchPalette()
      .catch((error) => console.warn('[TUfast Smart Search] Could not open pending palette:', error))
  }, 250)
}
