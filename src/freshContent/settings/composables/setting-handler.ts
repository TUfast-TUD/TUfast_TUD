import { useChrome } from '../composables/chrome'
import type {
  Verbs,
  OptionsOpalPdf,
  ResponseOpalPdf,
  OptionsOWA,
  ResponseOWA,
  OptionsSE,
  ResponseSE,
  OptionsOpalSmartSearch,
  ResponseOpalSmartSearch,
  ResponseOpalSmartSearchStats,
  ResponseOpalSmartSearchProgress,
  ResponseOpalSmartSearchPrompt
} from '../types/SettingHandler'

import * as owaModule from '../../../modules/owaFetch'
import * as opalModule from '../../../modules/opalInline'
import * as opalSmartSearchModule from '../../../modules/opalSmartSearch/settings'

const { sendChromeRuntimeMessage } = useChrome()

export const useSettingHandler = () => ({
  opalPdf,
  owa,
  se,
  opalSmartSearch,
  opalSmartSearchStats,
  opalSmartSearchProgress,
  opalSmartSearchPrompt,
  startOpalSmartSearchPreload,
  resetOpalSmartSearchPreloadPrompts,
  clearOpalSmartSearchIndex
})

const opalPdf = async (verb: Verbs, option?: OptionsOpalPdf): Promise<ResponseOpalPdf | boolean> => {
  switch (verb) {
    case 'check':
      return (await opalModule.checkOpalFileStatus()) as ResponseOpalPdf
    case 'enable':
      return await (option === 'inline' ? opalModule.enableOpalInline() : opalModule.enableOpalFileNewTab())
    case 'disable':
      await (option === 'inline' ? opalModule.disableOpalInline() : opalModule.disableOpalFileNewTab())
      return true
  }

  return false
}

const owa = async (verb: Verbs, option?: OptionsOWA): Promise<ResponseOWA | boolean> => {
  switch (verb) {
    case 'check':
      return (await owaModule.checkOWAStatus()) as ResponseOWA
    case 'enable':
      return await (option === 'fetch' ? owaModule.enableOWAFetch() : owaModule.enableOWANotifications())
    case 'disable':
      await (option === 'fetch' ? owaModule.disableOWAFetch() : owaModule.disableOWANotifications())
      return true
  }

  return false
}

const se = async (verb: Verbs, option?: OptionsSE): Promise<ResponseSE | boolean> => {
  if (verb === 'check') return (await sendChromeRuntimeMessage({ cmd: `${verb}_se_status` })) as ResponseSE
  else return (await sendChromeRuntimeMessage({ cmd: `${verb}_se_${option}` })) as boolean
}

const opalSmartSearch = async (
  verb: Verbs,
  option?: OptionsOpalSmartSearch
): Promise<ResponseOpalSmartSearch | boolean> => {
  const settings = await opalSmartSearchModule.loadSmartSearchSettings()

  switch (verb) {
    case 'check':
      return settings
    case 'enable':
    case 'disable':
      if (!option) return false
      await opalSmartSearchModule.saveSmartSearchSettings({
        ...settings,
        [option]: verb === 'enable'
      })
      return true
  }

  return false
}

const opalSmartSearchStats = async (): Promise<ResponseOpalSmartSearchStats> => {
  const response = (await sendChromeRuntimeMessage({ cmd: 'opal_smart_search_stats' })) as ResponseOpalSmartSearchStats
  return response || { count: 0, lastIndexedAt: 0 }
}

const opalSmartSearchProgress = async (): Promise<ResponseOpalSmartSearchProgress> => {
  const data = await chrome.storage.local.get([opalSmartSearchModule.OPAL_SMART_SEARCH_ACTIVE_PROGRESS_KEY])
  const progress = data[opalSmartSearchModule.OPAL_SMART_SEARCH_ACTIVE_PROGRESS_KEY] as
    | ResponseOpalSmartSearchProgress
    | undefined
  return (
    progress || { status: 'idle', startedAt: 0, updatedAt: 0, totalCourses: 0, completedCourses: 0, indexedItems: 0 }
  )
}

const opalSmartSearchPrompt = async (verb: Verbs): Promise<ResponseOpalSmartSearchPrompt | boolean> => {
  switch (verb) {
    case 'check': {
      const data = await chrome.storage.local.get([opalSmartSearchModule.OPAL_SMART_SEARCH_ACTIVE_PROMPT_DISMISSED_KEY])
      const dismissed = Boolean(data[opalSmartSearchModule.OPAL_SMART_SEARCH_ACTIVE_PROMPT_DISMISSED_KEY])
      return { showPreloadPrompts: !dismissed, dismissed }
    }
    case 'enable':
      await chrome.storage.local.remove([opalSmartSearchModule.OPAL_SMART_SEARCH_ACTIVE_PROMPT_DISMISSED_KEY])
      return true
    case 'disable':
      await chrome.storage.local.set({ [opalSmartSearchModule.OPAL_SMART_SEARCH_ACTIVE_PROMPT_DISMISSED_KEY]: true })
      return true
  }

  return false
}

const startOpalSmartSearchPreload = async (): Promise<boolean> => {
  return (await sendChromeRuntimeMessage({ cmd: 'opal_smart_search_preload_now' })) as boolean
}

const resetOpalSmartSearchPreloadPrompts = async (): Promise<boolean> => {
  await chrome.storage.local.remove([opalSmartSearchModule.OPAL_SMART_SEARCH_ACTIVE_PROMPT_DISMISSED_KEY])
  return true
}

const clearOpalSmartSearchIndex = async (): Promise<boolean> => {
  return (await sendChromeRuntimeMessage({ cmd: 'opal_smart_search_clear' })) as boolean
}
