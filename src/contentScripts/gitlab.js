chrome.storage.local.get(['isEnabled', 'loggedOutGitlab'], function (result) {
  if (result.isEnabled && !result.loggedOutGitlab) {
    document.addEventListener('DOMContentLoaded', function () {
      if (document.getElementById('username') && document.getElementById('password')) {
        chrome.runtime.sendMessage({ cmd: 'get_user_data' }, function (result) {
          if (!(result.asdf === undefined || result.fdsa === undefined)) {
            chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
            chrome.runtime.sendMessage({ cmd: 'perform_login' })
            document.getElementById('username').value = (result.asdf)
            document.getElementById('password').value = (result.fdsa)
            document.getElementsByTagName('input')[4].click()
          } else {
            chrome.runtime.sendMessage({ cmd: 'no_login_data' })
          }
        })
      }
      if (document.querySelectorAll('.sign-out-link')[0]) {
        document.querySelectorAll('.sign-out-link')[0].addEventListener('click', function () {
          chrome.runtime.sendMessage({ cmd: 'logged_out', portal: 'loggedOutGitlab' })
        })
      }
    })
    console.log('Auto Login to gitlab.')
  } else if (result.loggedOutGitlab) {
    chrome.storage.local.set({ loggedOutGitlab: false }, function () { })
  }
})
