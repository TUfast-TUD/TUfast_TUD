chrome.storage.local.get(['loggedOutTex'], (result) => {
  if (!result.loggedOutTex) {
    // there is only a button and no reason to not click
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll("a[href='/saml/login/go']")[0].click()
      console.log('Auto Login to tex.')
    })
  } else if (result.loggedOutTex) {
    chrome.storage.local.set({ loggedOutTex: false })
  }
})

document.addEventListener('DOMContentLoaded', () => {
  // add event listener for log-out button
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
})
