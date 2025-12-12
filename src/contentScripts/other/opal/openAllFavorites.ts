// Update button state based on current page
function updateButtonState(button: HTMLSpanElement) {
  button.style.opacity = '1'
  button.style.cursor = 'pointer'
  button.style.pointerEvents = 'auto'
  button.textContent = 'Alle Favoriten öffnen'
  button.title = 'Alle Favoriten öffnen. Ein TUfast-Feature.'
}

// Get course links from the page
function getFavoriteLinksFromPage(): string[] {
  const links: string[] = []
  const allLinks = document.querySelectorAll('a[href*="RepositoryEntry"]')

  allLinks.forEach((el) => {
    const href = (el as HTMLAnchorElement).href
    if (href && !links.includes(href)) {
      links.push(href)
    }
  })

  return [...new Set(links)]
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

  function openAllFavoriteTabs() {
    const courseLinks = getFavoriteLinksFromPage()

    if (!courseLinks || courseLinks.length === 0) {
      alert('Keine Favoriten-Links gefunden!')
      return
    }

    chrome.runtime.sendMessage({
      cmd: 'openAllFavoritesInOpal',
      courseLinks: courseLinks
    })

    // close current tab after delay
    setTimeout(() => {
      chrome.runtime.sendMessage({
        cmd: 'closeCurrentTab'
      })
    }, 500)
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
