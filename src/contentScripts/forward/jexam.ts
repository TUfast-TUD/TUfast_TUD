(async () => {
  const common = await import(chrome.runtime.getURL('contentScripts/forward/searchEngines/common.js'))
  common.forward('jexam')
})()
