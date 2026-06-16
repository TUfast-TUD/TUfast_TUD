;(async () => {
  // Only run on OPAL pages
  if (!location.href.includes('/opal/')) return

  // Load feature modules dynamically, so OPAL gets only what it needs
  const settingsModule = await import(chrome.runtime.getURL('modules/opalSmartSearch/settings.js'))
  const indexerModule = await import(chrome.runtime.getURL('contentScripts/other/opal/smartSearch/indexer.js'))
  const paletteModule = await import(chrome.runtime.getURL('contentScripts/other/opal/smartSearch/palette.js'))

  const settings = await settingsModule.loadSmartSearchSettings()
  if (!settings.enabled) return

  // Setup UI and file highlighting
  paletteModule.bindOpalSmartSearchPalette()
  await indexerModule.checkAndHighlightIndexedFile()

  // Index what the user already sees
  if (settings.passiveIndexing) {
    await indexerModule.bootstrapCoursesFromStorage()
    await indexerModule.indexCurrentOpalPage()
  }

  // Carefully crawl a few courses in the background if the user enabled it
  if (settings.activeIndexing) {
    window.setTimeout(() => {
      indexerModule
        .maybeRunActiveIndexing()
        .catch((error) => console.warn('[TUfast Smart Search] Active indexing failed:', error))
    }, 3000)
  }
})().catch((error) => console.warn('[TUfast Smart Search] Startup failed:', error))
