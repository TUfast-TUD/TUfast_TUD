function loginTex () {
  document.querySelectorAll("a[href='/saml/login/go']")[0].click()
  console.log('Auto Login to tex.')
}

chrome.storage.local.get(['loggedOutTex'], (result) => {
  if (!result.loggedOutTex) {
    // there is only a button and no reason to not click
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loginTex)
    } else {
      loginTex()
    }
  } else {
    chrome.storage.local.set({ loggedOutTex: false })
  }
})

function addLogoutButtonListener () {
  const buttons = document.querySelectorAll(
    'button.btn-link.text-left.dropdown-menu-button'
  )
  for (const button of buttons) {
    if (button.innerHTML.indexOf('Log Out') !== -1) {
      // listen for click
      button.addEventListener('click', () => {
        chrome.runtime.sendMessage({
          cmd: 'logged_out',
          portal: 'loggedOutTex'
        })
        console.log('Logged out Tex')
      })
    }
  }
}

// add event listener for log-out button
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addLogoutButtonListener)
} else {
  addLogoutButtonListener()
}
