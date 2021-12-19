function loginVideoCampus () {
  if (document.querySelector('#login .loginOptions .form-control[name="entityID"]')) {
    // The login form manipulation has to be first else we will always click on "login"
    document.querySelector('#login .loginOptions .form-control[name="entityID"]').value = 'https://idp.tu-dresden.de/idp/shibboleth'
    chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 2 })
    document.querySelector('#login .loginOptions input[type="submit"]').click()
  } else if (document.querySelector('.nav-link[href="/login"]')) {
    chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
    document.querySelector('.nav-link[href="/login"]').click()
  } else if (document.querySelector('.dropdown-item[href="/logout"]')) {
    // abmelden button
    document.querySelector('.dropdown-item[href="/logout"]').addEventListener('click', () => {
      const date = new Date()
      date.setMinutes(date.getMinutes() + 2)
      document.cookie = `vcLoggedOut; expires=${date.toUTCString()}; path=/; domain=.videocampus.sachsen.de; secure`
    })
  }

  console.log('Auto Login to videocampus.')
}

chrome.storage.local.get(['isEnabled'], (result) => {
  if (result.isEnabled && !document.cookie.includes('vcLoggedOut')) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loginVideoCampus)
    } else {
      loginVideoCampus()
    }
  }
})
