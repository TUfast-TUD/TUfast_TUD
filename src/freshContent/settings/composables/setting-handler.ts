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
  ResponseOpalSmartSearchProgress,
  ResponseOpalSmartSearchStats
} from '../types/SettingHandler'

import * as owaModule from '../../../modules/owaFetch'
import * as opalModule from '../../../modules/opalInline'

const { sendChromeRuntimeMessage } = useChrome()

export const useSettingHandler = () => ({
  opalPdf,
  owa,
  se,
  opalSmartSearch,
  opalSmartSearchStats,
  opalSmartSearchProgress,
  startOpalSmartSearchPreload,
  cancelOpalSmartSearchPreload,
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
  option: OptionsOpalSmartSearch = 'enabled'
): Promise<ResponseOpalSmartSearch | boolean> => {
  if (verb === 'check')
    return (await sendChromeRuntimeMessage({ cmd: 'check_opal_smart_search_status' })) as ResponseOpalSmartSearch

  return (await sendChromeRuntimeMessage({
    cmd: `${verb}_opal_smart_search`,
    option
  })) as boolean
}

const opalSmartSearchStats = async (): Promise<ResponseOpalSmartSearchStats> => {
  return (await sendChromeRuntimeMessage({ cmd: 'opal_smart_search_stats' })) as ResponseOpalSmartSearchStats
}

const opalSmartSearchProgress = async (): Promise<ResponseOpalSmartSearchProgress> => {
  return (await sendChromeRuntimeMessage({ cmd: 'opal_smart_search_progress' })) as ResponseOpalSmartSearchProgress
}

const startOpalSmartSearchPreload = async (): Promise<boolean> => {
  return (await sendChromeRuntimeMessage({ cmd: 'start_opal_smart_search_preload' })) as boolean
}

const cancelOpalSmartSearchPreload = async (): Promise<boolean> => {
  return (await sendChromeRuntimeMessage({ cmd: 'cancel_opal_smart_search_preload' })) as boolean
}

const clearOpalSmartSearchIndex = async (): Promise<boolean> => {
  return (await sendChromeRuntimeMessage({ cmd: 'clear_opal_smart_search_index' })) as boolean
}
