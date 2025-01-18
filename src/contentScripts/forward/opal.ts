import type { SENamespace } from './searchEngines/common'
;(async () => {
  if (location.href.includes('exam')) return // No exam.opal domains
  const common: SENamespace = await import(chrome.runtime.getURL('contentScripts/forward/searchEngines/common.js'))
  common.forward('opal')
})()
