// enable the header listener
// modify http header from opal, to view pdf in browser without the need to download it
export async function enableOpalPdfInline (): Promise<boolean> {
  const granted = await new Promise((resolve) => chrome.permissions.request({ permissions: ['webRequest', 'webRequestBlocking'], origins: ['https://bildungsportal.sachsen.de/opal/*'] }, resolve))
  if (!granted) {
    alert("TUfast braucht diese Berechtigung, um PDFs ohne Download zu \u00f6ffnen. Bitte dr\u00fccke auf 'Erlauben'.")
    disableOpalPdfInline()
    return false
  }

  // Promisified until usage of Manifest V3
  await new Promise<void>((resolve) => chrome.storage.local.set({ pdfInInline: true }, resolve))

  enableOpalPdfHeaderListener()
  return true
}

export function enableOpalPdfHeaderListener () {
  chrome.permissions.contains({ permissions: ['webRequest', 'webRequestBlocking'] }, (granted) => {
    if (!granted) return
    chrome.webRequest.onHeadersReceived.addListener(
      headerListenerFunc,
      {
        urls: [
          'https://bildungsportal.sachsen.de/opal/downloadering*',
          'https://bildungsportal.sachsen.de/opal/*.pdf'
        ]
      },
      ['blocking', 'responseHeaders']
    )
  })
}

// disable the header listener
export async function disableOpalPdfInline () {
  // Promisified until usage of Manifest V3
  await new Promise<void>((resolve) => chrome.storage.local.set({ pdfInInline: false, pdfInNewTab: false }, resolve))
  chrome.webRequest.onHeadersReceived.removeListener(headerListenerFunc)
  await new Promise((resolve) => chrome.permissions.remove({ permissions: ['webRequest', 'webRequestBlocking'], origins: ['https://bildungsportal.sachsen.de/opal/*'] }, resolve)).catch(() => { /* ignore */ })
}

// function that is called when pdf in opal is opened
function headerListenerFunc (details: chrome.webRequest.WebResponseHeadersDetails) {
  if (!details.responseHeaders) return
  const header = details.responseHeaders.find(
    e => e.name.toLowerCase() === 'content-disposition'
  )
  if (!header?.value?.includes('.pdf')) return // only for pdf
  header.value = 'inline'
  return { responseHeaders: details.responseHeaders }
}

export async function enableOpalPdfNewTab (): Promise<boolean> {
  // Promisified until usage of Manifest V3
  await new Promise<void>((resolve) => chrome.storage.local.set({ pdfInNewTab: true }, resolve))
  return true
}

export async function disableOpalPdfNewTab () {
  // Promisified until usage of Manifest V3
  await new Promise<void>((resolve) => chrome.storage.local.set({ pdfInNewTab: false }, resolve))
}

export async function checkOpalPdfStatus (): Promise<{inline: boolean, newtab: boolean}> {
  // Promisified until usage of Manifest V3
  const { pdfInInline, pdfInNewTab } = await new Promise<any>((resolve) => chrome.storage.local.get(['pdfInNewTab', 'pdfInInline'], resolve))
  return { inline: !!pdfInInline, newtab: !!pdfInNewTab }
}
