// Whitelist of paths where the button should be enabled
const ENABLED_PATHS = [
  '/opal/auth/resource/favorites',
  '/opal/auth/resource/courses',
  '/opal/auth/resource/courses-active'
]

// Check if current page is in whitelist
function isPageEnabled(): boolean {
  const currentPath = window.location.pathname
  return ENABLED_PATHS.some((path) => currentPath === path)
}

// Update button state based on current page
function updateButtonState(button: HTMLSpanElement) {
  const enabled = isPageEnabled()
  const currentPath = window.location.pathname

  if (enabled) {
    button.style.opacity = '1'
    button.style.cursor = 'pointer'
    button.style.pointerEvents = 'auto'

    // Special text for favorites page
    if (currentPath === '/opal/auth/resource/favorites') {
      button.textContent = 'Alle Favoriten öffnen'
      button.title = 'Alle Favoriten öffnen. Ein TUfast-Feature.'
    } else {
      button.textContent = 'Alle Kurse öffnen'
      button.title = 'Alle Kurse öffnen. Ein TUfast-Feature.'
    }
  } else {
    button.style.opacity = '0.4'
    button.style.cursor = 'default'
    button.style.pointerEvents = 'none'
    button.textContent = 'Alle Kurse öffnen'
    button.title = 'Nur verfügbar auf Favoriten- und Kurs-Seiten'
  }
}

// Main injection logic
async function injectOpenAllButton() {
  // Check if already exists
  if (document.getElementById('openAllCourseTabsInOpalButton')) return

  // Check if container exists
  const div = document.querySelector('.tufast-opal-header') as HTMLElement
  if (!div) return

  const openAllCourseTabsInOpalButton = document.createElement('span')
  openAllCourseTabsInOpalButton.id = 'openAllCourseTabsInOpalButton'
  openAllCourseTabsInOpalButton.textContent = 'Alle Kurse öffnen'

  // Set initial state
  updateButtonState(openAllCourseTabsInOpalButton)

  function getFavoriteCourseLinks(): string[] {
    const links: string[] = []

    // Strategie 1: Aus TUfast Favoriten-Liste im DOM
    const tufastFavSelectors = [
      '.tufast-fav-list a',
      '.tufast-favorites a',
      '[data-tufast-favorite] a',
      '.tufast-course-link'
    ]

    for (const selector of tufastFavSelectors) {
      const elements = document.querySelectorAll(selector)
      if (elements.length > 0) {
        elements.forEach((el) => {
          const href = (el as HTMLAnchorElement).href
          if (href && href.includes('RepositoryEntry')) {
            links.push(href)
          }
        })
      }
    }

    // Strategie 2: Alle OPAL Kurs-Links auf der aktuellen Seite
    if (links.length === 0) {
      const allLinks = document.querySelectorAll('a[href*="RepositoryEntry"]')
      allLinks.forEach((el) => {
        const href = (el as HTMLAnchorElement).href
        if (href && !links.includes(href)) {
          links.push(href)
        }
      })
    }

    // Strategie 3: Aus Bookmark/Favoriten-Bereich in OPAL
    if (links.length === 0) {
      const opalBookmarkSelectors = ['.o_bookmark a', '.o_bookmark_list a', '#o_navbar_bookmarks a', '.o_favorites a']

      for (const selector of opalBookmarkSelectors) {
        const elements = document.querySelectorAll(selector)
        if (elements.length > 0) {
          elements.forEach((el) => {
            const href = (el as HTMLAnchorElement).href
            if (href && href.includes('RepositoryEntry')) {
              links.push(href)
            }
          })
        }
      }
    }

    // Strategie 4: LocalStorage (als Fallback)
    if (links.length === 0) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('kurs') || key.includes('course') || key.includes('fav'))) {
            const value = localStorage.getItem(key)
            if (value) {
              try {
                const parsed = JSON.parse(value)
                if (Array.isArray(parsed)) {
                  parsed.forEach((item) => {
                    if (item && item.link) links.push(item.link)
                  })
                }
              } catch (e) {
                // Kein gültiges JSON
              }
            }
          }
        }
      } catch (e) {
        // LocalStorage Fehler ignorieren
      }
    }

    // Duplikate entfernen
    return [...new Set(links)]
  }

  function openAllFavCourseTabs() {
    // Double-check if enabled (shouldn't be possible due to pointerEvents, but just in case)
    if (!isPageEnabled()) return

    const courseLinks = getFavoriteCourseLinks()

    if (!courseLinks || courseLinks.length === 0) {
      alert('Keine Kurs-Links gefunden!')
      return
    }

    chrome.runtime.sendMessage({
      action: 'openAllCourseTabsInOpal',
      courseLinks: courseLinks
    })
  }

  openAllCourseTabsInOpalButton.addEventListener('click', (e) => {
    e.preventDefault()
    openAllFavCourseTabs()
  })

  div.appendChild(openAllCourseTabsInOpalButton)
}

// Initialize and watch for changes
;(async () => {
  // Initial injection
  await injectOpenAllButton()

  // Track last URL to detect navigation
  let lastUrl = window.location.href

  // Watch for DOM changes (SPA navigation)
  const observer = new MutationObserver(async () => {
    const currentUrl = window.location.href

    // Check if button needs re-injection
    if (document.querySelector('.tufast-opal-header') && !document.getElementById('openAllCourseTabsInOpalButton')) {
      await injectOpenAllButton()
    }

    // Check if URL changed and update button state
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl
      const button = document.getElementById('openAllCourseTabsInOpalButton') as HTMLSpanElement
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
