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

  // Index what the user already sees
  if (settings.passiveIndexing) {
    await indexerModule.bootstrapCoursesFromStorage()
    await indexerModule.indexCurrentOpalPage()
  }

  // Resume only an explicitly started preload job
  const data = await chrome.storage.local.get([settingsModule.OPAL_SMART_SEARCH_ACTIVE_PROGRESS_KEY])
  const activeProgress = data[settingsModule.OPAL_SMART_SEARCH_ACTIVE_PROGRESS_KEY]
  if (settings.activeIndexing && activeProgress?.status === 'running') {
    window.setTimeout(() => {
      indexerModule
        .maybeRunActiveIndexing()
        .catch((error) => console.warn('[TUfast Smart Search] Active indexing failed:', error))
    }, 3000)
  }
})().catch((error) => console.warn('[TUfast Smart Search] Startup failed:', error))
