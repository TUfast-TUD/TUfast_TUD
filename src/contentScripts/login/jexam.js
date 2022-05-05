function loginJexam () {
  if (document.getElementById('username') && document.getElementById('password')) {
    chrome.runtime.sendMessage({ cmd: 'get_user_data' }, async (result) => {
      await result
      if (result.user && result.pass) {
        chrome.runtime.sendMessage({ cmd: 'show_ok_badge', timeout: 2000 })
        chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
        chrome.runtime.sendMessage({ cmd: 'perform_login' })
        document.getElementById('username').value = result.user
        document.getElementById('password').value = result.pass
        document.getElementsByTagName('input')[2].click()
      } else {
        chrome.runtime.sendMessage({ cmd: 'no_login_data' })
      }
    })
  }
  if (document.getElementsByClassName('logout nav-entry animate-fade-in')[0]) {
    document.getElementsByClassName('logout nav-entry animate-fade-in')[0].addEventListener('click', () => {
      chrome.runtime.sendMessage({ cmd: 'logged_out', portal: 'loggedOutJexam' })
    })
  }

  console.log('Auto Login to jexam.')
}

chrome.storage.local.get(['isEnabled', 'loggedOutJexam'], (result) => {
  if (result.isEnabled && !result.loggedOutJexam) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loginJexam)
    } else {
      loginJexam()
    }
  } else if (result.loggedOutJexam) {
    chrome.storage.local.set({ loggedOutJexam: false })
  }
})
