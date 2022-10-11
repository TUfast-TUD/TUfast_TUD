import { useChrome } from '../composables/chrome'
import type {
  Verbs,
  OptionsOpalPdf,
  ResponseOpalPdf,
  OptionsOWA,
  ResponseOWA,
  OptionsSE,
  ResponseSE
} from '../types/SettingHandler'

const { sendChromeRuntimeMessage } = useChrome()

export const useSettingHandler = () => ({
  opalPdf,
  owa,
  se
})

const opalPdf = async (verb: Verbs, option?: OptionsOpalPdf): Promise<ResponseOpalPdf | boolean> => {
  if (verb === 'check') return await sendChromeRuntimeMessage({ cmd: `${verb}_opalpdf_status` }) as ResponseOpalPdf
  else return await sendChromeRuntimeMessage({ cmd: `${verb}_opalpdf_${option}` }) as boolean
}

const owa = async (verb: Verbs, option?: OptionsOWA): Promise<ResponseOWA | boolean> => {
  if (verb === 'check') return await sendChromeRuntimeMessage({ cmd: `${verb}_owa_status` }) as ResponseOWA
  else return await sendChromeRuntimeMessage({ cmd: `${verb}_owa_${option}` }) as boolean
}

const se = async (verb: Verbs, option?: OptionsSE): Promise<ResponseSE | boolean> => {
  if (verb === 'check') return await sendChromeRuntimeMessage({ cmd: `${verb}_se_status` }) as ResponseSE
  else return await sendChromeRuntimeMessage({ cmd: `${verb}_se_${option}` }) as boolean
}
