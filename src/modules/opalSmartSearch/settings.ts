import type { OpalSmartSearchSettings } from './types'

// Shared storage keys; verify-smart-search guards the classic-script mirror.
export const SmartSearchKey = {
  settings: 'opalSmartSearchSettings',
  highlight: 'opalSmartSearchHighlight',
  activeProgress: 'opalSmartSearchActiveProgress',
  activeRuns: 'opalSmartSearchActiveIndexRuns',
  successfulRuns: 'opalSmartSearchSuccessfulRuns',
  openAfterOpalLoad: 'opalSmartSearchOpenAfterOpalLoad',
  favoritesDetectedAt: 'opalSmartSearchFavoritesDetectedAt'
} as const

export const smartSearchProgressEvent = 'tufast-opal-smart-search-progress'
export const startStaleMs = 60 * 1000
export const jobStaleMs = 2 * 60 * 60 * 1000

export const defaultSmartSearchSettings: OpalSmartSearchSettings = {
  enabled: true
}

export async function loadSmartSearchSettings(): Promise<OpalSmartSearchSettings> {
  const data = await chrome.storage.local.get({
    [SmartSearchKey.settings]: defaultSmartSearchSettings
  })

  return { enabled: data[SmartSearchKey.settings]?.enabled ?? true }
}

export async function saveSmartSearchSettings(settings: OpalSmartSearchSettings): Promise<void> {
  await chrome.storage.local.set({ [SmartSearchKey.settings]: settings })
}
