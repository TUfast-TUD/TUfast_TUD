
export const useChrome = () => ({
  setChromeLocalStorage,
  getChromeLocalStorage,
  removeChromeLocalStorage,
  sendChromeRuntimeMessage
})

const setChromeLocalStorage = async (keys: Record<string, unknown>) =>
  await new Promise((resolve) => chrome.storage.local.set(keys, resolve as () => {}))

const getChromeLocalStorage = async (keys: string | string[]) => {
  if (typeof keys === 'string') { return await new Promise((resolve) => chrome.storage.local.get(keys, (res) => resolve(res[keys]))) } else { return await new Promise((resolve) => chrome.storage.local.get(keys, resolve)) }
}

const removeChromeLocalStorage = async (keys: string | string[]) =>
  await new Promise((resolve) => chrome.storage.local.remove(keys, resolve as () => {}))

const sendChromeRuntimeMessage = async (keys: Record<string | number | symbol, unknown>) =>
  await new Promise((resolve) => chrome.runtime.sendMessage(keys, resolve))
