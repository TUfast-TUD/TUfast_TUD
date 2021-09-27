chrome.storage.local.get(['isEnabled', 'loggedOutOpal'], function (result) {
  if (/* result.isEnabled && */ !(result.loggedOutOpal)) {
    document.addEventListener('DOMContentLoaded', function () {
      // select TU Dresden from selector
      if (document.getElementsByName('wayfselection')[0]) {
        chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
        const selectionList = document.getElementsByName('wayfselection')[0]
        for (const el of selectionList) {
          if (el.textContent === 'TU Dresden' || el.textContent === 'Technsiche Universität Dresden') {
            document.getElementsByName('wayfselection')[0].value = el.value
          }
        }
      }
      chrome.runtime.sendMessage({ cmd: 'show_ok_badge', timeout: 4000 })
      chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
      document.getElementsByClassName('btn-highlight')[0].click()
    })
    console.log('Auto Login to Opal.')
  } else if (result.loggedOutOpal) {
    chrome.storage.local.set({ loggedOutOpal: false }, function () { })
  }
})
