chrome.storage.local.get(['isEnabled', 'loggedOutTumed'], function (result) {
  if (result.isEnabled && !result.loggedOutTumed) {
    document.addEventListener('DOMContentLoaded', function () {
      //that is the old e-portal. Leave it for now
      if (document.querySelectorAll('label[for=__ac_name]')[0] && document.querySelectorAll('label[for=__ac_password]')[0] && document.getElementById('__ac_name') && document.getElementById('__ac_password')) {
        chrome.runtime.sendMessage({ cmd: 'get_user_data' }, function (result) {
          if (!(result.asdf === undefined || result.fdsa === undefined)) {
            chrome.runtime.sendMessage({ cmd: 'show_ok_badge', timeout: 2000 })
            chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 2 })
            chrome.runtime.sendMessage({ cmd: 'perform_login' })
            document.getElementById('__ac_name').value = result.asdf
            document.getElementById('__ac_password').value = result.fdsa
            document.querySelectorAll('input[value=Anmelden]')[0].click()
          } else {
            chrome.runtime.sendMessage({ cmd: 'no_login_data' })
          }
        })
      }

      // abmelden button (SAME FOR OLD AND NEW EPORTAL!)
      if (document.getElementById('personaltools-logout')) {
        console.log("registered logout button")
        document.getElementById('personaltools-logout').addEventListener('click', function () {
          console.log("detected logout")
          chrome.runtime.sendMessage({ cmd: 'logged_out', portal: 'loggedOutTumed' })
        })
      }

      //this is the new eportal
      if (document.getElementById("personaltools-login")) {
        chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 2 })
        document.getElementById("personaltools-login").click()
      }


    })
    console.log('Auto Login to eportal med.')



  } else if (result.loggedOutTumed) {
    chrome.storage.local.set({ loggedOutTumed: false }, function () { })
  }
})
