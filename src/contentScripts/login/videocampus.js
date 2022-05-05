function loginVideoCampus (logoutDuration) {
  if (document.querySelector('#login .loginOptions .form-control[name="entityID"]')) {
    // The login form manipulation has to be first else we will always click on "login"
    chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 3 })
    chrome.runtime.sendMessage({ cmd: 'show_ok_badge', timeout: 2000 })
    chrome.runtime.sendMessage({ cmd: 'perform_login' })
    document.querySelector('#login .loginOptions .form-control[name="entityID"]').value = 'https://idp.tu-dresden.de/idp/shibboleth'
    document.querySelector('#login .loginOptions input[type="submit"]').click()
  } else if (document.querySelector('.nav-link[href="/login"]')) {
    chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
    document.querySelector('.nav-link[href="/login"]').click()
  } else if (document.querySelector('.dropdown-item[href="/logout"]')) {
    // abmelden button
    document.querySelector('.dropdown-item[href="/logout"]').addEventListener('click', () => {
      const date = new Date()
      date.setMinutes(date.getMinutes() + logoutDuration)
      document.cookie = `vcLoggedOut; expires=${date.toUTCString()}; path=/; domain=.videocampus.sachsen.de; secure`
    })
  }

  console.log('Auto Login to videocampus.')
}

chrome.storage.local.get(['isEnabled', 'logoutDuration'], (result) => {
  if (result.isEnabled && !document.cookie.includes('vcLoggedOut')) {
    const logoutDuration = result.logoutDuration || 5
    chrome.runtime.sendMessage({ cmd: 'check_user_data', platform: 'zih' }, async (result) => {
      await result
      if (!result) return
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => loginVideoCampus(logoutDuration))
      } else {
        loginVideoCampus(logoutDuration)
      }
    })
  }
})
