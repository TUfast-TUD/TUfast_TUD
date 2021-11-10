function loginQis (isEnabled) {
  if (document.getElementsByTagName('a')[4].innerText === 'Ich habe die Nutzungsbedingungen gelesen, verstanden und akzeptiert. >>>') {
    document.getElementsByTagName('a')[4].click()
    chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
  } else if (document.getElementById('asdf') && isEnabled) {
    chrome.runtime.sendMessage({ cmd: 'get_user_data' }, async (result) => {
      await result
      if (result.user && result.pass) {
        chrome.runtime.sendMessage({ cmd: 'show_ok_badge', timeout: 2000 })
        chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
        chrome.runtime.sendMessage({ cmd: 'perform_login' })
        document.getElementById('asdf').value = result.user
        document.getElementById('fdsa').value = result.pass
        document.getElementsByName('submit')[0].click()
      } else {
        chrome.runtime.sendMessage({ cmd: 'no_login_data' })
      }
    })
  }
  // abmelden button
  if (document.querySelectorAll('#visual-footer-wrapper :nth-child(5)')[0]) {
    document.querySelectorAll('#visual-footer-wrapper :nth-child(5)')[0].addEventListener('click', () => {
      chrome.runtime.sendMessage({ cmd: 'logged_out', portal: 'loggedOutQis' })
    })
  }

  console.log('Auto Login to hisqis.')
}

chrome.storage.local.get(['isEnabled', 'loggedOutQis'], (result) => {
  if (!result.loggedOutQis) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        loginQis(result.isEnabled)
      })
    } else {
      loginQis(result.isEnabled)
    }
  } else if (result.loggedOutQis) {
    chrome.storage.local.set({ loggedOutQis: false })
  }
})
