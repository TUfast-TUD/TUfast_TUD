;(function () {
  // Main injection logic
  async function injectOpenAllFavoritesButton() {
    // Check if button already exists
    if (document.getElementById('openAllFavoritesButton')) return

    // Check if container exists
    const div = document.querySelector('.tufast-opal-header') as HTMLElement
    if (!div) return

    const openAllFavoritesButton = document.createElement('span')
    openAllFavoritesButton.id = 'openAllFavoritesButton'
    openAllFavoritesButton.textContent = 'Alle Favoriten öffnen'
    openAllFavoritesButton.title = 'Alle Favoriten öffnen. Ein TUfast-Feature.'
    openAllFavoritesButton.style.opacity = '1'
    openAllFavoritesButton.style.cursor = 'pointer'
    openAllFavoritesButton.style.pointerEvents = 'auto'

    // Simple click handler - background.ts handles all validation
    openAllFavoritesButton.addEventListener('click', (e) => {
      e.preventDefault()
      chrome.runtime.sendMessage({
        cmd: 'open_all',
        links: 'favoriten',
        behavior: 'immediate_active'
      })
    })

    div.appendChild(openAllFavoritesButton)
  }

  // Initialize and watch for changes
  ;(async () => {
    // Initial injection
    await injectOpenAllFavoritesButton()

    // If favorite list was empty and retry flag was set:
    // Automatic retry after redirect
    chrome.storage.local.get(['retry_open_all_favorites'], async (result) => {
      if (result.retry_open_all_favorites) {
        // delete flag
        chrome.storage.local.remove(['retry_open_all_favorites'])

        // wait for opal dom
        setTimeout(() => {
          const button = document.getElementById('openAllFavoritesButton')
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
      if (document.querySelector('.tufast-opal-header') && !document.getElementById('openAllFavoritesButton')) {
        await injectOpenAllFavoritesButton()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  })()
})()
