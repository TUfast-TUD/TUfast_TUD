import { useChrome } from "../composables/chrome"
import type {
  Verbs,
  OptionsOpalPdf,
  ResponseOpalPdf,
  OptionsOWA,
  ResponseOWA,
} from '../types/SettingHandler'

const { sendChromeRuntimeMessage } = useChrome()

export const useSettingHandler = () => ({
  opalPdf,
  owa,
})

const opalPdf = async (verb: Verbs, option?: OptionsOpalPdf): Promise<ResponseOpalPdf | boolean> => {
  console.log(`${verb}_opalpdf_${option}`)
  if (verb === "check")
    return await sendChromeRuntimeMessage({ cmd: `${verb}_opalpdf_status` }) as ResponseOpalPdf
  else
    return await sendChromeRuntimeMessage({ cmd: `${verb}_opalpdf_${option}` }) as boolean
}

const owa = async (verb: Verbs, option?: OptionsOWA): Promise<ResponseOWA | boolean> => {
  console.log(`${verb}_owa_${option}`)
  if (verb === "check")
    return await sendChromeRuntimeMessage({ cmd: `${verb}_owa_status` }) as ResponseOWA
  else
    return await sendChromeRuntimeMessage({ cmd: `${verb}_owa_${option}` }) as boolean
}

