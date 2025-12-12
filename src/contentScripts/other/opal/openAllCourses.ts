;(function () {
  // Update button state based on current page
  function updateButtonState(button: HTMLSpanElement) {
    button.style.opacity = '1'
    button.style.cursor = 'pointer'
    button.style.pointerEvents = 'auto'
    button.textContent = 'Alle Kurse öffnen'
    button.title = 'Alle Kurse öffnen. Ein TUfast-Feature.'
  }

  // Get course links from the page
  function getCourseLinksFromPage(): string[] {
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
  async function injectOpenAllCoursesButton() {
    // Check if already exists
    if (document.getElementById('openAllCoursesButton')) return

    // Check if container exists
    const div = document.querySelector('.tufast-opal-header') as HTMLElement
    if (!div) return

    const openAllCoursesButton = document.createElement('span')
    openAllCoursesButton.id = 'openAllCoursesButton'
    openAllCoursesButton.textContent = 'Alle Kurse öffnen'

    // Set initial state
    updateButtonState(openAllCoursesButton)

    function openAllCourseTabs() {
      const courseLinks = getCourseLinksFromPage()

      if (!courseLinks || courseLinks.length === 0) {
        alert('Keine Kurs-Links gefunden!')
        return
      }

      chrome.runtime.sendMessage({
        cmd: 'openAllCoursesInOpal',
        courseLinks: courseLinks
      })

      // close current tab after delay
      setTimeout(() => {
        chrome.runtime.sendMessage({
          cmd: 'closeCurrentTab'
        })
      }, 500)
    }

    openAllCoursesButton.addEventListener('click', (e) => {
      e.preventDefault()
      openAllCourseTabs()
    })

    div.appendChild(openAllCoursesButton)
  }

  // Initialize and watch for changes
  ;(async () => {
    // Initial injection
    await injectOpenAllCoursesButton()

    // Track last URL to detect navigation
    let lastUrl = window.location.href

    // Watch for DOM changes (SPA navigation)
    const observer = new MutationObserver(async () => {
      const currentUrl = window.location.href

      // Check if button needs re-injection
      if (document.querySelector('.tufast-opal-header') && !document.getElementById('openAllCoursesButton')) {
        await injectOpenAllCoursesButton()
      }

      // Check if URL changed and update button state
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl
        const button = document.getElementById('openAllCoursesButton') as HTMLSpanElement
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
