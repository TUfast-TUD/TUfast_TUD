import type { SENamespace } from './common'

// See if we have a query param - if so we don't want to do anything here
function shouldAct (): boolean {
  const params = new URLSearchParams(window.location.search)
  const hasQuery = params.has('q') || params.has('query')
  return !hasQuery
}

(async () => {
  const common: SENamespace = await import(chrome.runtime.getURL('contentScripts/forward/searchEngines/common.js'))

  // If we have GET query or no fwdEnabled, do nothing
  if (!shouldAct() || !(await common.fwdEnabled())) return

  // Check the searchbox first, if there's something in there
  const sb = document.querySelector('input[name="q"][type="search"]') as HTMLInputElement
  // If there's no searchbox thats weird, but we can't do anything about it
  if (!sb) return

  // Check the content of the box
  if (await common.forward(sb.value)) return

  // If we get here, the searchquery was useless but that could change so we register a listener
  // First get the search form
  const sf = document.querySelector('form[data-testid="mainSearchBar"]') as HTMLFormElement

  // Create a listener function
  const onSubmit = (e: Event) => {
    e.preventDefault() // We want to do our own stuff
    // Call the forward function
    common.forward(sb.value).then((forwarded:boolean) => {
      if (!forwarded) {
        // When we didn't forward, the user still wants to search
        e.target?.removeEventListener('submit', onSubmit);
        (e.target as HTMLFormElement).submit()
      }
    })
  }

  // Register the listener
  sf.addEventListener('submit', onSubmit)
})()
