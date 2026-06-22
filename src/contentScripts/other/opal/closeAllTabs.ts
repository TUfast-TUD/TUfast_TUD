const opalCloseAllTabsStrings = (globalThis as any).TUFAST_STRINGS.opal
const STORAGE_KEY = 'closeAllTabsOnLoad'

// adds button
async function injectCloseAllButton() {
  // create button
  if (document.getElementById('closeAllTabsButton')) return

  const div = document.querySelector('.tufast-opal-header') as HTMLElement
  if (!div) return

  const closeAllTabsButton = document.createElement('span')
  closeAllTabsButton.id = 'closeAllTabsButton'
  closeAllTabsButton.title = opalCloseAllTabsStrings.closeAllTabsTitle
  closeAllTabsButton.textContent = opalCloseAllTabsStrings.closeAllTabs

  // if there are no tabs open, disable the button
  function updateButtonState() {
    const closeButtons = document.querySelectorAll('.btn-close.icon.only')
    const hasTabs = closeButtons.length > 0

    if (hasTabs) {
      closeAllTabsButton.style.opacity = '1'
      closeAllTabsButton.style.cursor = 'pointer'
      closeAllTabsButton.style.pointerEvents = 'auto'
    } else {
      closeAllTabsButton.style.opacity = '0.5'
      closeAllTabsButton.style.cursor = 'not-allowed'
      closeAllTabsButton.style.pointerEvents = 'none'
    }
  }

  closeAllTabsButton.addEventListener('click', (e) => {
    e.preventDefault()

    // Check if there are tabs to close
    const closeButtons = document.querySelectorAll('.btn-close.icon.only')
    if (closeButtons.length === 0) return

    // set marker in localStorage to indicate tabs should be closed after reload
    localStorage.setItem(STORAGE_KEY, 'true')

    // reload the page (fixes an issue with code getting confused about what tabs are open)
    location.reload()
  })

  div.appendChild(closeAllTabsButton)

  // Initial state update
  updateButtonState()

  // Watch for changes in tabs
  const tabObserver = new MutationObserver(updateButtonState)
  tabObserver.observe(document.body, {
    childList: true,
    subtree: true
  })
}

// close all tabs, runs only if marker is set in localStorage
function closeAllTabsAfterReload() {
  if (localStorage.getItem(STORAGE_KEY) !== 'true') return

  let closedCount = 0

  function clickNextCloseButton() {
    const closeButtons = document.querySelectorAll('.btn-close.icon.only')

    if (closeButtons.length > 0) {
      ;(closeButtons[0] as HTMLElement).click()
      closedCount++
      setTimeout(clickNextCloseButton, 500)
    } else {
      if (closedCount > 0) {
        chrome.runtime.sendMessage({
          cmd: 'close_all_tabs',
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
    if (document.querySelector('.tufast-opal-header') && !document.getElementById('closeAllTabsButton')) {
      await injectCloseAllButton()
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
})()
