chrome.storage.local.get(['loggedOutTex'], function (result) {
  if (!result.loggedOutTex) {
    // there is only a button and no reason to not click
    document.addEventListener('DOMContentLoaded', function () {
      document.querySelectorAll("a[href='/saml/login/go']")[0].click()
      console.log('Auto Login to tex.')
    })
  } else if (result.loggedOutTex) {
    chrome.storage.local.set({ loggedOutTex: false }, function () { })
  }
})

document.addEventListener('DOMContentLoaded', function () {
  // add event listener for log-out button
  const buttons = document.querySelectorAll(
    'button.btn-link.text-left.dropdown-menu-button'
  )
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i].innerHTML.indexOf('Log Out') !== -1) {
      // listen for click
      buttons[i].addEventListener('click', function () {
        chrome.runtime.sendMessage({
          cmd: 'logged_out',
          portal: 'loggedOutTex'
        })
        console.log('Logged out Tex')
      })
    }
  }
})
