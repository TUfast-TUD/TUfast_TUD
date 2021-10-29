chrome.storage.local.get(['pdfInNewTab'], (result) => {
  if (result.pdfInNewTab) {
    // on load
    document.addEventListener('DOMNodeInserted', () => {
      modifyPdfLinks()
    })
    // on document loaded
    window.addEventListener(
      'load',
      () => {
        modifyPdfLinks()
        pdfButtonExternalReload()
      },
      true
    )
  }
})

function modifyPdfLinks () {
  // Modify js so that link is opened in new tab
  const links = document.getElementsByTagName('a')
  links.forEach((link) => {
    if (link.href.includes('.pdf')) {
      link.onclick = function (event) {
        event.stopImmediatePropagation() // prevents OPAL to load in the same tab
        window.open(this.href, '_blank')
        return false
      }
    }
  })
}

function pdfButtonExternalReload () {
  // Only run logic if URL path includes 'downloadering'.
  // This is the page Opal requests on click on - let's call it - a 'document button'.
  if (document.documentURI.includes('downloadering')) {
    // The fiber code gets auto genereted, it seems kind of random.
    // It doesn't identify a document, I saw two codes for the same PDF.

    const fibercodeQuery = 'fibercode='
    const fibercodePos = document.documentURI.lastIndexOf(fibercodeQuery)

    const fibercode = document.documentURI.slice(fibercodePos + fibercodeQuery.length)

    // check if fibercode is already present to not reload the same page forever
    chrome.storage.local.get(['fibercode'], (result) => {
      if (result.fibercode === fibercode) {
        // remove fibercode again after page opened in new tab (runs in new tab)
        chrome.storage.local.set({ fibercode: '' })
      } else {
        // set the fibercode if it doesn't exist in db (runs on button click)
        chrome.storage.local.set({ fibercode: fibercode }, () => {
          open(document.documentURI, '_blank')
          history.back()
        })
      }
    })
  }
}
