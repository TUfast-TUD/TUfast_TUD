function loginTumed () {
  // that is the old e-portal. Leave it for now
  if (document.querySelectorAll('label[for=__ac_name]')[0] && document.querySelectorAll('label[for=__ac_password]')[0] && document.getElementById('__ac_name') && document.getElementById('__ac_password')) {
    chrome.runtime.sendMessage({ cmd: 'get_user_data' }, async (result) => {
      await result
      if (result.user && result.pass) {
        chrome.runtime.sendMessage({ cmd: 'show_ok_badge', timeout: 2000 })
        chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 2 })
        chrome.runtime.sendMessage({ cmd: 'perform_login' })
        document.getElementById('__ac_name').value = result.user
        document.getElementById('__ac_password').value = result.pass
        document.querySelectorAll('input[value=Anmelden]')[0].click()
      } else {
        chrome.runtime.sendMessage({ cmd: 'no_login_data' })
      }
    })
  }

  // abmelden button (SAME FOR OLD AND NEW EPORTAL!)
  if (document.getElementById('personaltools-logout')) {
    console.log('registered logout button')
    document.getElementById('personaltools-logout').addEventListener('click', () => {
      console.log('detected logout')
      chrome.runtime.sendMessage({ cmd: 'logged_out', portal: 'loggedOutTumed' })
    })
  }

  // this is the new eportal
  if (document.getElementById('personaltools-login')) {
    chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 2 })
    document.getElementById('personaltools-login').click()
  }

  console.log('Auto Login to eportal med.')
}

chrome.storage.local.get(['isEnabled', 'loggedOutTumed'], (result) => {
  if (result.isEnabled && !result.loggedOutTumed) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loginTumed)
    } else {
      loginTumed()
    }
  } else if (result.loggedOutTumed) {
    chrome.storage.local.set({ loggedOutTumed: false })
  }
})
