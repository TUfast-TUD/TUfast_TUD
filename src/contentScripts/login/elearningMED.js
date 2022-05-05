function loginElearningMED () {
  if (document.getElementsByTagName('a')[0].textContent === 'Moodle' && location.href === 'https://elearning.med.tu-dresden.de/') {
    document.getElementsByTagName('a')[0].click()
    chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
  } else if (location.href === 'https://elearning.med.tu-dresden.de/moodle/academiLogin.html' && document.querySelectorAll('[href="https://elearning.med.tu-dresden.de/moodle/auth/shibboleth/index.php"]')[0]) {
    document.querySelectorAll('[href="https://elearning.med.tu-dresden.de/moodle/auth/shibboleth/index.php"]')[0].click()
    chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
  }

  // second login screen (or it was just changed?!)
  if (location.href.includes('elearning.med.tu-dresden.de/moodle/login')) {
    if (document.querySelectorAll("a[title='ZIH-Login']")[0].href === 'https://elearning.med.tu-dresden.de/moodle/auth/shibboleth/index.php') {
      document.querySelectorAll("a[title='ZIH-Login']")[0].click()
    }
  }

  // detecting logout
  if (document.getElementById('actionmenuaction-6')) {
    document.getElementById('actionmenuaction-6').addEventListener('click', () => {
      console.log('logout detected!')
      chrome.runtime.sendMessage({ cmd: 'logged_out', portal: 'loggedOutElearningMED' })
    })
  }

  console.log('Auto Login to elearning.med.')
}

chrome.storage.local.get(['isEnabled', 'loggedOutElearningMED'], (result) => {
  if (result.isEnabled && !result.loggedOutElearningMED) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        loginElearningMED()
      })
    } else {
      loginElearningMED()
    }
  }
})
