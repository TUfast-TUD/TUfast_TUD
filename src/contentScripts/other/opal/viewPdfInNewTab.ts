function reloadInNewTab () {
  // When opening a pdf we get to ".../downloadering?fibercode=xxx"
  // We could save the fibrecode to not reopen the same document over and over
  // or we could go the simpler way and see if there even is a history for this tab.
  // When opening something in a new tab it doesn't have a history.
  if (!window.location.pathname.includes('downloadering') || window.history.length < 2) return

  window.open(window.location.href, '_blank')
  window.history.back()
}

(async () => {
  const { pdfInNewTab } = await new Promise<any>((resolve) => chrome.storage.local.get(['pdfInNewTab'], resolve))
  if (!pdfInNewTab) return

  // If we get loaded on a pdf we open it in a new tab
  reloadInNewTab()

  // The following code is for changing all the links to open in a new tab.
  // In combination that won't work, as a new tab is opened but the pdf is loaded in the same tab and then in the new one.
  // So in the end there are two new tabs, one is wrong.

  // When only using the method above it works fine for pdf files hosted on Opal.

  // This method modifies any anchor nodes it gets to open in a new tab.
  /* const modifyLinks = (nodeList: NodeList|HTMLCollectionOf<HTMLAnchorElement>) => {
    for (const node of nodeList) {
      if (node.nodeName.toLowerCase() === 'a' && (node as HTMLAnchorElement).href.includes('.pdf')) {
        node.addEventListener('click', (e: Event) => {
          e.stopImmediatePropagation()
          window.open((node as HTMLAnchorElement).href, '_blank')
          return false
        })
      }
    }
  }

  // The mutation observer is used to modify links when they are added to the DOM
  new MutationObserver((mutations, _observer) => {
    for (const mutation of mutations) {
      modifyLinks(mutation.addedNodes)
    }
  }).observe(document.body, { childList: true, subtree: true })

  // Because the Mutation observer is only running when the DOM is changed, we need to run it manually once
  modifyLinks(document.getElementsByTagName('a')) */
})()
