const STORAGE_KEY = 'closeAllTabsOnLoad'

// adds button
async function injectCloseAllButton() {
  if (document.getElementById('closeAllCourseTabsButton')) return

  const div = document.querySelector('.tufast-opal-header') as HTMLElement
  if (!div) return

  const closeAllCourseTabsButton = document.createElement('span')
  closeAllCourseTabsButton.id = 'closeAllCourseTabsButton'
  closeAllCourseTabsButton.title = 'Alle Tabs schließen. Ein TUfast-Feature.'
  closeAllCourseTabsButton.textContent = 'Alle Tabs schließen'

  closeAllCourseTabsButton.addEventListener('click', (e) => {
    e.preventDefault()

    // set marker in localStorage to indicate tabs should be closed after reload
    localStorage.setItem(STORAGE_KEY, 'true')

    // reload the page (fixes an issue with code getting confused about what tabs are open)
    location.reload()
  })

  div.appendChild(closeAllCourseTabsButton)
}

// runs only if marker is set in localStorage
function closeAllTabsAfterReload() {
  if (localStorage.getItem(STORAGE_KEY) !== 'true') return

  let closedCount = 0

  function clickNextCloseButton() {
    const closeButtons = document.querySelectorAll('.btn-close.icon.only')

    if (closeButtons.length > 0) {
      ;(closeButtons[0] as HTMLElement).click()
      closedCount++
      setTimeout(clickNextCloseButton, 1000)
    } else {
      if (closedCount > 0) {
        chrome.runtime.sendMessage({
          cmd: 'closeAllCourseTabsInOpal',
          closedCount: closedCount
        })
      }
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  setTimeout(clickNextCloseButton, 500)
}

;(async () => {
  await injectCloseAllButton()

  const shouldCloseTabs = localStorage.getItem(STORAGE_KEY)
  if (shouldCloseTabs === 'true') {
    closeAllTabsAfterReload()
  }

  const observer = new MutationObserver(async () => {
    if (document.querySelector('.tufast-opal-header') && !document.getElementById('closeAllCourseTabsButton')) {
      await injectCloseAllButton()
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
})()
