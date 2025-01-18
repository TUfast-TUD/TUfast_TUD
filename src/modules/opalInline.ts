// Opal Inline PDF for Manifest V3
// ---
// Because webRequest and webRequestBlocking are not supported in Manifest V3
// this module does actually more than just PDFs.
// Every file that can be opened in the browser will be opened in the browser.
// Firefox still need to use webRequestBlocking, so we need to check if we are in Firefox

import { isFirefox, getBrowserNetRequestPermissions as getBrowserPermissions } from './firefoxCheck'

// The rules that make the magic happen
const rules = [
  {
    id: 69,
    action: {
      type: 'modifyHeaders',
      responseHeaders: [
        {
          header: 'content-disposition',
          value: 'inline',
          operation: 'set'
        }
      ]
    },
    condition: {
      urlFilter: 'downloadering',
      requestDomains: ['bildungsportal.sachsen.de'],
      resourceTypes: ['main_frame']
    }
  },
  {
    id: 420,
    action: {
      type: 'modifyHeaders',
      responseHeaders: [
        {
          header: 'content-disposition',
          value: 'inline',
          operation: 'set'
        }
      ]
    },
    condition: {
      urlFilter: '.pdf|',
      requestDomains: ['bildungsportal.sachsen.de'],
      resourceTypes: ['main_frame']
    }
  }
]

export async function permissionsGrantedWebRequest(): Promise<boolean> {
  return await (chrome.permissions as any).contains({ permissions: getBrowserPermissions() })
}

// Enable the module
export async function enableOpalInline(): Promise<boolean> {
  // Chrome typings are deprecated, we cast so no error is shown
  // As declarativeNetRequest is not supported as optional permission in Manifest V3, we don't need to ask for it
  const granted = await (chrome.permissions as any).request({ permissions: getBrowserPermissions() })
  if (!granted) {
    alert(
      "TUfast braucht diese Berechtigung, um Dateien ohne Download zu \u00f6ffnen. Bitte dr\u00fccke auf 'Erlauben'."
    )
    disableOpalInline()
    return false
  }

  // When we got here, we have the permission
  await chrome.storage.local.set({ pdfInInline: true })
  enableOpalHeaderListener()
  return true
}

// Disable the module
export async function disableOpalInline() {
  await chrome.storage.local.set({ pdfInInline: false, pdfInNewTab: false })
  if (chrome.webRequest) chrome.webRequest.onHeadersReceived.removeListener(headerListenerFunc)
  if (chrome.declarativeNetRequest)
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: rules.map((r) => r.id) })

  await (chrome.permissions as any).remove({ permissions: getBrowserPermissions() }).catch(() => {
    /* ignore */
  })
}

// Enable the header listener
// Runs when the module is enabled and on startup of the extension if the module was enabled before
export async function enableOpalHeaderListener() {
  const granted = await (chrome.permissions as any).contains({ permissions: getBrowserPermissions() })
  if (!granted) return

  if (isFirefox()) {
    chrome.webRequest.onHeadersReceived.addListener(
      headerListenerFunc,
      {
        urls: ['https://bildungsportal.sachsen.de/opal/downloadering*', 'https://bildungsportal.sachsen.de/opal/*.pdf']
      },
      ['blocking', 'responseHeaders']
    )
  } else {
    // Remove the old rule if it exists
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: rules.map((r) => r.id) })
    // Register the new rule
    await chrome.declarativeNetRequest.updateDynamicRules({ addRules: rules as chrome.declarativeNetRequest.Rule[] })
  }
}

// Disable the header listener
// Runs when the module gets disabled
export async function disableOpalHeaderListener() {
  if (isFirefox()) {
    if (chrome.webRequest) chrome.webRequest.onHeadersReceived.removeListener(headerListenerFunc)
  } else {
    if (chrome.declarativeNetRequest)
      await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: rules.map((r) => r.id) })
  }
}

export async function enableOpalFileNewTab(): Promise<boolean> {
  await chrome.storage.local.set({ pdfInNewTab: true })
  return true
}

export async function disableOpalFileNewTab() {
  await chrome.storage.local.set({ pdfInNewTab: false })
}

export async function checkOpalFileStatus(): Promise<{ inline: boolean; newtab: boolean }> {
  const { pdfInInline, pdfInNewTab } = await chrome.storage.local.get(['pdfInNewTab', 'pdfInInline'])
  return { inline: !!pdfInInline, newtab: !!pdfInNewTab }
}

// Function for firefox
function headerListenerFunc(details: chrome.webRequest.WebResponseHeadersDetails) {
  if (!details.responseHeaders) return
  const header = details.responseHeaders.find((e) => e.name.toLowerCase() === 'content-disposition')
  // if (!header?.value?.includes('.pdf')) return // Not only for PDFs anymore
  if (!header) return
  header.value = 'inline'
  return { responseHeaders: details.responseHeaders }
}
