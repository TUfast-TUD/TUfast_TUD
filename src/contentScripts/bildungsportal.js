chrome.storage.local.get(['isEnabled', 'loggedOutOpal'], (result) => {
  if (result.isEnabled && !(result.loggedOutOpal)) {
    // when pop-up shows
    document.addEventListener('DOMNodeInserted', () => {
      // select TU Dresden from selector
      if (document.getElementsByName('content:container:login:shibAuthForm:wayfselection') && document.getElementsByName('content:container:login:shibAuthForm:wayfselection')[0]) {
        chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
        const selectionList = document.getElementsByName('content:container:login:shibAuthForm:wayfselection')[0]
        const element = selectionList.find((el) => el.textContent === 'TU Dresden' || el.textContent === 'Technsiche Universität Dresden')
        document.getElementsByName('content:container:login:shibAuthForm:wayfselection')[0].value = element.value
      }
      // submit selected
      if (document.getElementsByName('content:container:login:shibAuthForm:shibLogin')[0]) {
        chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
        chrome.runtime.sendMessage({ cmd: 'show_ok_badge', timeout: 4000 })
        document.getElementsByName('content:container:login:shibAuthForm:shibLogin')[0].click()
      }
    }, false)

    // start login process
    window.addEventListener('load', () => {
      if (document.getElementsByClassName('btn btn-sm')[1].innerText.includes('Login')) {
        chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
        chrome.runtime.sendMessage({ cmd: 'show_ok_badge', timeout: 4000 })
        document.getElementsByClassName('btn btn-sm')[1].click()
      }
    }, true)
    console.log('Auto Login to Opal.')
  } else if (result.loggedOutOpal) {
    chrome.storage.local.set({ loggedOutOpal: false })
  }
})
