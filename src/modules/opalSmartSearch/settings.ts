import type { OpalSmartSearchSettings } from './types'

export const OPAL_SMART_SEARCH_SETTINGS_KEY = 'opalSmartSearchSettings'
export const OPAL_SMART_SEARCH_HIGHLIGHT_KEY = 'opalSmartSearchHighlight'
export const OPAL_SMART_SEARCH_ACTIVE_PROMPT_DISMISSED_KEY = 'opalSmartSearchActivePromptDismissed'
export const OPAL_SMART_SEARCH_ACTIVE_PROGRESS_KEY = 'opalSmartSearchActiveProgress'
export const OPAL_SMART_SEARCH_ACTIVE_PROGRESS_EVENT = 'tufast-opal-smart-search-progress'
export const OPAL_SMART_SEARCH_OPEN_AFTER_OPAL_LOAD_KEY = 'opalSmartSearchOpenAfterOpalLoad'

export const DEFAULT_SMART_SEARCH_SETTINGS: OpalSmartSearchSettings = {
  enabled: true,
  passiveIndexing: true,
  activeIndexing: false
}

export async function loadSmartSearchSettings(): Promise<OpalSmartSearchSettings> {
  const data = await chrome.storage.local.get({
    [OPAL_SMART_SEARCH_SETTINGS_KEY]: DEFAULT_SMART_SEARCH_SETTINGS
  })

  return {
    ...DEFAULT_SMART_SEARCH_SETTINGS,
    ...(data[OPAL_SMART_SEARCH_SETTINGS_KEY] || {})
  }
}

export async function saveSmartSearchSettings(settings: OpalSmartSearchSettings): Promise<void> {
  await chrome.storage.local.set({ [OPAL_SMART_SEARCH_SETTINGS_KEY]: settings })
}
