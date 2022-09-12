
export const useChrome = () => ({
  setChromeLocalStorage,
  sendChromeRuntimeMessage,
  getChromeLocalStorage,
})

const setChromeLocalStorage = async (items: Record<string | number | symbol, unknown>) =>
await new Promise((resolve) => chrome.storage.local.set(items, resolve as () => {}))

const sendChromeRuntimeMessage = async (items: Record<string | number | symbol, unknown>) => 
await new Promise((resolve) => chrome.runtime.sendMessage(items, resolve))

const getChromeLocalStorage = async (items: string | string[]) => {
  if (typeof items === 'string')
    return await new Promise((resolve) => chrome.storage.local.get(items, (res) => resolve(res[items])))
  else
    return await new Promise((resolve) => chrome.storage.local.get(items, resolve))
}
