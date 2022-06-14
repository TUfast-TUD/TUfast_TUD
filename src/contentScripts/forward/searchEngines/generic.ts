// This fetches the q-query from the URL
// Basically every SE just uses this parameter when using GET
// Startpage sometimes uses 'query' instead of 'q' but we can handle this here too
const params = new URLSearchParams(window.location.search)
const keyword = decodeURI(params.get('q') || '') || decodeURI(params.get('query') || '');

(async () => {
  const common = await import(chrome.runtime.getURL('contentScripts/forward/searchEngines/common.js'))
  common.forward(keyword)
})()
