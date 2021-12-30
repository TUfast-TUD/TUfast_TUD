function loginSlub (logoutDuration) {
  if (document.getElementsByClassName('login')[0]) {
    document.getElementsByClassName('login')[0].click()
    chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
  } else if (document.getElementById('username')) {
    chrome.runtime.sendMessage({ cmd: 'get_user_data', platform: 'slub' }, async (result) => {
      await result
      if (result.user && result.pass && document.getElementsByClassName('form-error').length === 0) {
        chrome.runtime.sendMessage({ cmd: 'show_ok_badge', timeout: 2000 })
        chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
        chrome.runtime.sendMessage({ cmd: 'perform_login' })
        document.getElementById('username').value = result.user
        document.getElementById('password').value = result.pass
        chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
        document.querySelector('input.slubbutton[type="submit"]').click()
      } else {
        chrome.runtime.sendMessage({ cmd: 'no_login_data' })
      }
    })
  }

  // abmelden button
  if (document.getElementsByClassName('logout')[0]) {
    document.getElementsByClassName('logout')[0].addEventListener('click', () => {
      const date = new Date()
      date.setMinutes(date.getMinutes() + logoutDuration)
      document.cookie = `slubLoggedOut; expires=${date.toUTCString()}; path=/; domain=.slub-dresden.de; secure`
    })
  }
  // abmelden button no 2
  if (document.querySelector('.user a')) {
    document.querySelector('.user a').addEventListener('click', () => {
      const date = new Date()
      date.setMinutes(date.getMinutes() + logoutDuration)
      document.cookie = `slubLoggedOut; expires=${date.toUTCString()}; path=/; domain=.slub-dresden.de; secure`
    })
  }

  console.log('Auto Login to slub.')
}

chrome.storage.local.get(['isEnabled', 'logoutDuration'], (result) => {
  if (result.isEnabled && !document.cookie.includes('slubLoggedOut')) {
    const logoutDuration = result.logoutDuration || 5
    chrome.runtime.sendMessage({ cmd: 'check_user_data', platform: 'slub' }, async (result) => {
      await result
      if (!result) return
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => loginSlub(logoutDuration))
      } else {
        loginSlub(logoutDuration)
      }
    })
  }
})
