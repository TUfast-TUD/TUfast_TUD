
export const useChrome = () => ({
  setChromeLocalStorage,
  getChromeLocalStorage,
  removeChromeLocalStorage,
  sendChromeRuntimeMessage
})

const setChromeLocalStorage = chrome.storage.local.set

const getChromeLocalStorage = async (keys: string | string[]) => {
  if (typeof keys === 'string') {
    const { [keys]: response } = await chrome.storage.local.get(keys)
    return response
  } else {
    return await chrome.storage.local.get(keys)
  }
}

const removeChromeLocalStorage = chrome.storage.local.remove

const sendChromeRuntimeMessage = chrome.runtime.sendMessage
