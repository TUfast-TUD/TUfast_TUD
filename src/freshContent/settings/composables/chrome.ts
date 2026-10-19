import { t } from '../../../i18n'
export const useChrome = () => ({
  setChromeLocalStorage,
  getChromeLocalStorage,
  removeChromeLocalStorage,
  sendChromeRuntimeMessage
})

const setChromeLocalStorage = async (items: { [key: string]: any }) => await chrome.storage.local.set(items)

const getChromeLocalStorage = async (keys: string | string[]) => {
  if (typeof keys === 'string') {
    const { [keys]: response } = await chrome.storage.local.get(keys)
    return response
  } else {
    return await chrome.storage.local.get(keys)
  }
}

const removeChromeLocalStorage = async (keys: string | string[]) => await chrome.storage.local.remove(keys)

const sendChromeRuntimeMessage = async (cmd: any) => {
  const response = await chrome.runtime.sendMessage(cmd)
  if (response?.error === 'credential_unavailable') {
    alert(t('safari.credentialError'))
    throw new Error('Credential request failed')
  }
  return response
}
