import type { SENamespace } from './common'

function getQuery(): string | false {
  const params = new URLSearchParams(window.location.search)
  if (!params.has('q')) return false
  else return params.get('q') || false
}

// OK. This should not be as hard as it is.
// The better way would be to use webNavigation-API,
// but this would disable the extension on update, or we have to ask every time...

// Also the "window" property seems to be shared but only parts of it.
// For example we can not register a proxy for history.pushState().

// There are three options:
// 1. A mutation observer that listens for every change in DOM and then checks the URL
// 2. Injecting a script-Tag into the page that listens for changes in the URL
// 3. setInterval and look for changes in the URL

// 2. seems to be hard as we want to do not any stuff but use functions from the extension
// 3. is not really nice, but it works
// This means we should probably go with 1?

;(async () => {
  const common: SENamespace = await import(chrome.runtime.getURL('contentScripts/forward/searchEngines/common.js'))

  // If we dont have fwdEnabled, do nothing
  if (!(await common.fwdEnabled())) return

  // Else we will register a MutationObserver that will listen to any change
  // If any change happens we see if we can forward to a location
  new MutationObserver(async (_mutations) => {
    const query = getQuery()
    if (query) await common.forward(query)
  }).observe(document, { subtree: true, childList: true })
})()
