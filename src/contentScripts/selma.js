chrome.storage.local.get(['isEnabled', 'loggedOutSelma'], (result) => {
  if (result.isEnabled && !result.loggedOutSelma) {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('field_user')) {
        chrome.runtime.sendMessage({ cmd: 'get_user_data' }, async (response) => {
          await response
          if (response.user && response.pass) {
            chrome.runtime.sendMessage({ cmd: 'show_ok_badge', timeout: 2000 })
            chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
            chrome.runtime.sendMessage({ cmd: 'perform_login' })
            document.getElementById('field_user').value = response.user
            document.getElementById('field_pass').value = response.pass
            document.getElementById('logIn_btn').click()
          } else {
            chrome.runtime.sendMessage({ cmd: 'no_login_data' })
          }
        })
      }
      // abmelden button
      if (document.getElementById('logOut_btn')) {
        document.getElementById('logOut_btn').addEventListener('click', () => {
          chrome.runtime.sendMessage({ cmd: 'logged_out', portal: 'loggedOutSelma' })
        })
      }
    })
    console.log('Auto Login to Selma.')
    // page is reloaded two times
  } else if (result.loggedOutSelma) {
    chrome.storage.local.set({ loggedOutSelma: undefined })
  } else if (result.loggedOutSelma === undefined) {
    chrome.storage.local.set({ loggedOutSelma: false })
  }
})
