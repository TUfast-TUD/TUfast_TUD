// Main injection logic
async function injectCloseAllButton() {
  // Check if already exists
  if (document.getElementById('closeAllCourseTabsButton')) return

  // Check if container exists
  const div = document.querySelector('.tufast-opal-header') as HTMLElement
  if (!div) return

  const closeAllCourseTabsButton = document.createElement('span')
  closeAllCourseTabsButton.id = 'closeAllCourseTabsButton'
  closeAllCourseTabsButton.title = 'Alle Tabs schließen. Ein TUfast-Feature.'
  closeAllCourseTabsButton.textContent = 'Alle Tabs schließen'

  function closeAllTabs() {
    function clickNextCloseButton() {
      const closeButtons = document.querySelectorAll('.btn-close.icon.only')
      if (closeButtons.length > 0) {
        ;(closeButtons[0] as HTMLElement).click()
        setTimeout(clickNextCloseButton, 1000)
      }
    }
    clickNextCloseButton()
  }

  closeAllCourseTabsButton.addEventListener('click', (e) => {
    e.preventDefault()
    closeAllTabs()
  })

  div.appendChild(closeAllCourseTabsButton)
}

// Initialize and watch for changes
;(async () => {
  // Initial injection
  await injectCloseAllButton()

  // Watch for DOM changes (SPA navigation)
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
