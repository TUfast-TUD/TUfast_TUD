console.log('injected login script successfully ...')
chrome.storage.local.get(['isEnabled'], (result) => {
  if (!result.isEnabled) return
  if (document.readyState !== 'loading') {
    logInQis(result.isEnabled)
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      logInQis(result.isEnabled)
    })
    console.log('Auto Login to TU Dresden Auth.')
  }
})

function logInQis () {
  if (document.getElementById('username')) {
    chrome.runtime.sendMessage({ cmd: 'get_user_data' }, async (result) => {
      await result
      if (result.fdsa && result.asdf) {
        chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
        document.getElementById('username').value = result.asdf
        document.getElementById('password').value = result.fdsa
        document.getElementsByName('_eventId_proceed')[0].click()
      } else {
        chrome.runtime.sendMessage({ cmd: 'no_login_data' })
      }
    })
  } else if (document.getElementsByName('_eventId_proceed')[0]) {
    document.getElementsByName('_eventId_proceed')[0].click()
    chrome.runtime.sendMessage({ cmd: 'perform_login' })
    chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
  } else if (document.querySelectorAll('body > div:nth-child(2) > div:nth-child(1) > b')[0]) {
    if (document.querySelectorAll('body > div:nth-child(2) > div:nth-child(1) > b')[0].innerHTML === 'TUD - TU Dresden - Single Sign On - Veraltete Anfrage' ||
      document.querySelectorAll('body > div:nth-child(2) > div:nth-child(1) > b')[0].innerHTML === 'TUD - TU Dresden - Single Sign On - Stale Request') {
      window.location.replace('https://bildungsportal.sachsen.de/opal/login')
    }
  }
}
