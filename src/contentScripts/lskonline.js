function loginLsk () {
  // abmelden button
  document.querySelectorAll('a[href="103.0"]').forEach((logoutBtn) => {
    if (logoutBtn.innerHTML !== 'Logout') return
    logoutBtn.addEventListener('click', () => {
      const date = new Date()
      date.setMinutes(date.getMinutes() + 2)
      document.cookie = `lskLoggedOut; expires=${date.toUTCString()}; path=/; domain=.lskonline.tu-dresden.de; secure`
    })
  })

  if (document.querySelector('form[name="loginForm"]')) {
    // The login form manipulation has to be first else we will always click on "login"
    chrome.runtime.sendMessage({ cmd: 'get_user_data', platform: 'zih' }, async (result) => {
      await result
      chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
      chrome.runtime.sendMessage({ cmd: 'show_ok_badge', timeout: 2000 })
      chrome.runtime.sendMessage({ cmd: 'perform_login' })
      document.querySelector('input[name="j_username"]').value = result.user
      document.querySelector('input[name="j_password"]').value = result.pass
      document.querySelector('input[type="submit"]').click()
    })
  } else if (document.querySelector('a[href="102.0.1"]')) {
    const loginLink = document.querySelector('a[href="102.0.1"]')
    if (loginLink.innerHTML !== 'Login') return
    chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
    document.querySelector('a[href="102.0.1"]').click()
  }

  console.log('Auto Login to lsk.')
}

chrome.storage.local.get(['isEnabled'], (result) => {
  if (result.isEnabled && !document.cookie.includes('lskLoggedOut')) {
    chrome.runtime.sendMessage({ cmd: 'check_user_data', platform: 'zih' }, async (result) => {
      await result
      if (!result) return
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loginLsk)
      } else {
        loginLsk()
      }
    })
  }
})
