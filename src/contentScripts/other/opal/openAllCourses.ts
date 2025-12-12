;(function () {
  // Main injection logic
  async function injectOpenAllCoursesButton() {
    // Check if button already exists
    if (document.getElementById('openAllCoursesButton')) return

    // Check if container exists
    const div = document.querySelector('.tufast-opal-header') as HTMLElement
    if (!div) return

    const openAllCoursesButton = document.createElement('span')
    openAllCoursesButton.id = 'openAllCoursesButton'
    openAllCoursesButton.textContent = 'Alle Kurse öffnen'
    openAllCoursesButton.title = 'Alle Kurse öffnen. Ein TUfast-Feature.'
    openAllCoursesButton.style.opacity = '1'
    openAllCoursesButton.style.cursor = 'pointer'
    openAllCoursesButton.style.pointerEvents = 'auto'

    // Simple click handler - background.ts handles all validation
    openAllCoursesButton.addEventListener('click', (e) => {
      e.preventDefault()
      chrome.runtime.sendMessage({
        cmd: 'open_all',
        links: 'meine_kurse',
        behavior: 'immediate_active'
      })
    })

    div.appendChild(openAllCoursesButton)
  }

  // Initialize and watch for changes
  ;(async () => {
    // Initial injection
    await injectOpenAllCoursesButton()

    // If course list was empty and retry flag was set:
    // Automatic retry after redirect
    chrome.storage.local.get(['retry_open_all_courses'], async (result) => {
      if (result.retry_open_all_courses) {
        // delete flag
        chrome.storage.local.remove(['retry_open_all_courses'])

        // wait for opal dom
        setTimeout(() => {
          const button = document.getElementById('openAllCoursesButton')
          if (button) {
            button.click() // clicks button again
          }
        }, 800)
      }
    })

    // Make sure button is always displayed
    // Watch for DOM changes (SPA navigation) to re-inject button if needed
    // needed for tab "Lehren & Lernen" in opal
    const observer = new MutationObserver(async () => {
      // Check if button needs re-injection
      if (document.querySelector('.tufast-opal-header') && !document.getElementById('openAllCoursesButton')) {
        await injectOpenAllCoursesButton()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  })()
})()
