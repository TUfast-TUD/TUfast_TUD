const debugDumpEvent = 'tufast-smart-search-debug-dump'
const debugDumpReadyEvent = 'tufast-smart-search-debug-dump-ready'
const debugDumpId = 'tufast-smart-search-debug-dump-json'

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
  const strings = (await globalThis.TUFAST_STRINGS_READY).opal.smartSearch

  if (indexerModule.canRunActiveIndexingOnCurrentPage()) {
    indexerModule.maybeRunActiveIndexing().catch(indexerModule.handleActiveIndexFailure)
  }

  // Setup UI and file highlighting
  paletteModule.bindOpalSmartSearchPalette(strings)
  bindDebugDumpBridge()
  await highlightModule.checkAndHighlightIndexedFile()
  await openPaletteFromPendingHotkey(paletteModule, strings, settingsModule.SmartSearchKey.openAfterOpalLoad)

  // Index what the user already sees
  await indexerModule.bootstrapCoursesFromStorage()
  await indexerModule.indexCurrentOpalPage()
})().catch((error) => console.warn('[TUfast Smart Search] Startup failed:', error))

function bindDebugDumpBridge(): void {
  const marker = '__tufastSmartSearchDebugDumpBound'
  if ((window as any)[marker]) return
  ;(window as any)[marker] = true

  // Temporary beta debug bridge; remove before the merge-ready release build (see AGENTS_DOCS.md).
  window.addEventListener(debugDumpEvent, () => {
    chrome.runtime
      .sendMessage({ cmd: 'opal_smart_search_dump_nodes' })
      .then((dump) => {
        writeDebugDump(JSON.stringify(dump, null, 2))
      })
      .catch((error) => {
        writeDebugDump(JSON.stringify({ error: String(error) }, null, 2))
      })
  })
}

function writeDebugDump(json: string): void {
  let target = document.getElementById(debugDumpId) as HTMLTextAreaElement | null
  if (!target) {
    target = document.createElement('textarea')
    target.id = debugDumpId
    target.hidden = true
    document.documentElement.appendChild(target)
  }

  target.value = json
  target.textContent = json
  window.dispatchEvent(new CustomEvent(debugDumpReadyEvent))
}

async function openPaletteFromPendingHotkey(
  paletteModule: typeof import('./palette'),
  strings: typeof globalThis.TUFAST_STRINGS.opal.smartSearch,
  storageKey: string
): Promise<void> {
  const data = await chrome.storage.local.get([storageKey])
  const pending = readPendingPaletteOpen(data[storageKey])
  const expiresAt = pending.expiresAt
  if (!expiresAt) return

  await chrome.storage.local.remove([storageKey])
  if (Date.now() > expiresAt) return

  window.setTimeout(() => {
    paletteModule
      .openOpalSmartSearchPalette(strings, pending.rawQuery)
      .catch((error) => console.warn('[TUfast Smart Search] Could not open pending palette:', error))
  }, 250)
}

function readPendingPaletteOpen(value: unknown): { expiresAt: number; rawQuery?: string } {
  if (typeof value === 'number') return { expiresAt: value }
  if (value && typeof value === 'object') {
    const pending = value as { expiresAt?: unknown; rawQuery?: unknown }
    return {
      expiresAt: typeof pending.expiresAt === 'number' && Number.isFinite(pending.expiresAt) ? pending.expiresAt : 0,
      ...(typeof pending.rawQuery === 'string' ? { rawQuery: pending.rawQuery } : {})
    }
  }

  return { expiresAt: 0 }
}
