import type { SENamespace } from './searchEngines/common'
;(async () => {
  const common: SENamespace = await import(chrome.runtime.getURL('contentScripts/forward/searchEngines/common.js'))
  common.forward('jexam')
})()
