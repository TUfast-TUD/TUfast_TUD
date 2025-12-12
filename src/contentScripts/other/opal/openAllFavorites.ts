;(function () {
  // Update button state based on current page
  function updateButtonState(button: HTMLSpanElement) {
    button.style.opacity = '1'
    button.style.cursor = 'pointer'
    button.style.pointerEvents = 'auto'
    button.textContent = 'Alle Favoriten öffnen'
    button.title = 'Alle Favoriten öffnen. Ein TUfast-Feature.'
  }

  // Get favorite links from storage
  async function getFavoriteLinksFromStorage(): Promise<string[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['favoriten'], (result) => {
        try {
          const favorites = JSON.parse(result.favoriten || '[]')
          const links = favorites.map((fav: any) => fav.link).filter(Boolean)
          resolve(links)
        } catch (e) {
          console.error('Error parsing favoriten:', e)
          resolve([])
        }
      })
    })
  }

  // Main injection logic
  async function injectOpenAllFavoritesButton() {
    // Check if already exists
    if (document.getElementById('openAllFavoritesButton')) return

    // Check if container exists
    const div = document.querySelector('.tufast-opal-header') as HTMLElement
    if (!div) return

    const openAllFavoritesButton = document.createElement('span')
    openAllFavoritesButton.id = 'openAllFavoritesButton'
    openAllFavoritesButton.textContent = 'Alle Favoriten öffnen'

    // Set initial state
    updateButtonState(openAllFavoritesButton)

    async function openAllFavoriteTabs() {
      const favoriteLinks = await getFavoriteLinksFromStorage()

      if (!favoriteLinks || favoriteLinks.length === 0) {
        chrome.storage.local.set({ retry_open_all_favorites: true }, () => {
          window.location.href = 'https://bildungsportal.sachsen.de/opal/auth/resource/courses'
        })
        return
      }

      if (favoriteLinks.length > 25) {
        alert('Du hast mehr als 25 Favoriten. Bitte öffne sie über das Extension-Popup.')
        return
      }

      chrome.runtime.sendMessage({
        cmd: 'openAllFavoritesInOpal',
        courseLinks: favoriteLinks
      })

      // close current tab after delay
      setTimeout(() => {
        chrome.runtime.sendMessage({
          cmd: 'closeCurrentTab'
        })
      }, 1000)
    }

    openAllFavoritesButton.addEventListener('click', (e) => {
      e.preventDefault()
      openAllFavoriteTabs()
    })

    div.appendChild(openAllFavoritesButton)
  }

  // Initialize and watch for changes
  ;(async () => {
    // Initial injection
    await injectOpenAllFavoritesButton()

    // if flag exists: automatic retry after redirect
    chrome.storage.local.get(['retry_open_all_favorites'], async (result) => {
      if (result.retry_open_all_favorites) {
        // delete flag
        chrome.storage.local.remove(['retry_open_all_favorites'])

        // wait for opal dom
        setTimeout(() => {
          const button = document.getElementById('openAllFavoritesButton')
          if (button) {
            button.click() // cliks button again
          }
        }, 800)
      }
    })

    // Track last URL to detect navigation
    let lastUrl = window.location.href

    // Watch for DOM changes (SPA navigation)
    const observer = new MutationObserver(async () => {
      const currentUrl = window.location.href

      // Check if button needs re-injection
      if (document.querySelector('.tufast-opal-header') && !document.getElementById('openAllFavoritesButton')) {
        await injectOpenAllFavoritesButton()
      }

      // Check if URL changed and update button state
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl
        const button = document.getElementById('openAllFavoritesButton') as HTMLSpanElement
        if (button) {
          updateButtonState(button)
        }
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  })()
})()
