
chrome.storage.local.get(['isEnabled', 'loggedOutCloudstore'], (result) => {
  if (result.isEnabled && !result.loggedOutCloudstore) {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('user') && document.getElementById('password')) {
        chrome.runtime.sendMessage({ cmd: 'get_user_data' }, async (result) => {
          await result
          if (result.user && result.pass) {
            chrome.runtime.sendMessage({ cmd: 'show_ok_badge', timeout: 2000 })
            chrome.runtime.sendMessage({ cmd: 'perform_login' })
            chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
            document.getElementById('user').value = result.user
            document.getElementById('password').value = result.pass
            document.getElementById('submit-form').click()
          } else {
            chrome.runtime.sendMessage({ cmd: 'no_login_data' })
          }
        })
      }
      if (document.querySelectorAll('[data-id="logout"] > a')[0]) {
        document.querySelectorAll('[data-id="logout"] > a')[0].addEventListener('click', () => {
          chrome.runtime.sendMessage({ cmd: 'logged_out', portal: 'loggedOutCloudstore' })
        })
      }
    })
    console.log('Auto Login to Cloudstore.')
  } else if (result.loggedOutCloudstore) {
    chrome.storage.local.set({ loggedOutCloudstore: false }, () => { })
  }
})
