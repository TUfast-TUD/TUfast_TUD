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

    // get all opal course links from current page
    if (links.length === 0) {
      const allLinks = document.querySelectorAll('a[href*="RepositoryEntry"]')
      allLinks.forEach((el) => {
        const href = (el as HTMLAnchorElement).href
        if (href && !links.includes(href)) {
          links.push(href)
        }
      })
    }

    // removes duplicates
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
      cmd: 'openAllCourseTabsInOpal',
      courseLinks: courseLinks
    })

    // close current tab after delay
    // delay makes sure, that the course tabs are opened before closing this tab
    setTimeout(() => {
      chrome.runtime.sendMessage({
        cmd: 'closeCurrentTab'
      })
    }, 500)
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
