chrome.storage.local.get(['isEnabled', 'loggedOutOwa'], (result) => {
  if (result.isEnabled && !result.loggedOutOwa) {
    if (document.readyState !== 'loading') {
      loginOWA()
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        loginOWA()
      })
    }
    console.log('Auto Login to OWA.')
  }
  // sometimes it reloades the page, sometimes it doesnt...
  // else if(result.loggedOutOwa) {
  //    chrome.storage.local.set({loggedOutOwa: undefined}, function() {})
  //   setTimeout(() => {  chrome.storage.local.set({loggedOutOwa: false}, function() {}) }, 2000);
  // } else if(result.loggedOutOwa === undefined) {
  //    chrome.storage.local.set({loggedOutOwa: false}, function() {})
  // }
})

// detecting logout
document.addEventListener('DOMNodeInserted', () => {
  // old owa version
  if (document.querySelectorAll('[aria-label="Abmelden"]')[0]) {
    document.querySelectorAll('[aria-label="Abmelden"]')[0].addEventListener('click', () => {
      chrome.runtime.sendMessage({ cmd: 'logged_out', portal: 'loggedOutOwa' })
    })
  }
  // new owa version
  if (document.querySelectorAll("[autoid='_ho2_2']")[1] && document.querySelectorAll("[autoid='_ho2_2']")[1].innerHTML === 'Abmelden') {
    document.querySelectorAll('[aria-label="Abmelden"]')[1].addEventListener('click', () => {
      chrome.runtime.sendMessage({ cmd: 'logged_out', portal: 'loggedOutOwa' })
    })
  }
}, false)

function loginOWA () {
  if (document.getElementById('username') && document.getElementById('password')) {
    chrome.runtime.sendMessage({ cmd: 'get_user_data' }, async (result) => {
      await result
      if (result.user && result.pass) {
        chrome.runtime.sendMessage({ cmd: 'show_ok_badge', timeout: 2000 })
        chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
        chrome.runtime.sendMessage({ cmd: 'perform_login' })
        document.getElementById('username').value = result.user + '@msx.tu-dresden.de'
        document.getElementById('password').value = result.pass
        document.getElementsByClassName('signinbutton')[0].click()
        chrome.runtime.sendMessage({ cmd: 'logged_out', portal: 'loggedOutOwa' })
      } else {
        chrome.runtime.sendMessage({ cmd: 'no_login_data' })
      }
    })
  }
  // detecting logout
  if (document.querySelectorAll('[aria-label="Abmelden"]')[0]) {
    document.querySelectorAll('[aria-label="Abmelden"]')[0].addEventListener('click', () => {
      chrome.runtime.sendMessage({ cmd: 'logged_out', portal: 'loggedOutOwa' })
    })
  }
}

window.onload = () => {
  chrome.storage.local.get(['enabledOWAFetch'], (resp) => {
    if (resp.enabledOWAFetch) {
      // check if all mails are loaded | also check for new owa version
      const checkForNode = setInterval(() => {
        this.console.log('checking')
        if ((document.querySelectorAll("[autoid='_n_x1']")[1] && document.querySelectorAll("[autoid='_n_x1']")[1].textContent !== '') ||
                    (document.querySelectorAll("[autoid='_n_41']")[1] && document.querySelectorAll("[autoid='_n_41']")[1].textContent !== '')) {
          readMailObserver()
          clearInterval(checkForNode)
        }
      }, 100)
    }
  })
}

function readMailObserver () {
  // use mutation observer to detect page changes
  const config = { attributes: true, childList: true, subtree: true, characterData: true }
  let nrUnreadMails
  const callback = (_mutationsList, _observer) => {
    const chrome = this.chrome
    // check again, if enabled
    chrome.storage.local.get(['enabledOWAFetch'], (resp) => {
      if (resp.enabledOWAFetch) {
        // get number of unread messages | also check for new owa version

        try {
          nrUnreadMails = parseInt(document.querySelectorAll("[autoid='_n_x1']")[1].textContent)
        } catch {
          nrUnreadMails = parseInt(document.querySelectorAll("[autoid='_n_41']")[1].textContent)
        }

        if (isNaN(nrUnreadMails)) nrUnreadMails = 0

        console.log('Number of unread mails: ' + nrUnreadMails)

        chrome.runtime.sendMessage({ cmd: 'read_mail_owa', NrUnreadMails: nrUnreadMails })
      }
    })
  }

  // node containing unreadCount | also check new owa version
  let unreadCountNode = document.querySelectorAll("[autoid='_n_41']")[1]
  if (!unreadCountNode) unreadCountNode = document.querySelectorAll("[autoid='_n_c']")[0]

  const observer = new MutationObserver(callback)
  observer.observe(unreadCountNode, config)
}
