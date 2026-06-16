;(async () => {
  if (!location.href.includes('/opal/')) return

  const settingsModule = await import(chrome.runtime.getURL('contentScripts/other/opal/smartSearch/settings.js'))
  const indexerModule = await import(chrome.runtime.getURL('contentScripts/other/opal/smartSearch/indexer.js'))
  const paletteModule = await import(chrome.runtime.getURL('contentScripts/other/opal/smartSearch/palette.js'))

  const settings = await settingsModule.loadSmartSearchSettings()
  if (!settings.enabled) return

  paletteModule.bindOpalSmartSearchPalette()
  await indexerModule.checkAndHighlightIndexedFile()

  if (settings.passiveIndexing) {
    await indexerModule.bootstrapCoursesFromStorage()
    await indexerModule.indexCurrentOpalPage()
  }

  if (settings.activeIndexing) {
    window.setTimeout(() => {
      indexerModule
        .maybeRunActiveIndexing()
        .catch((error) => console.warn('[TUfast Smart Search] Active indexing failed:', error))
    }, 3000)
  }
})().catch((error) => console.warn('[TUfast Smart Search] Startup failed:', error))
