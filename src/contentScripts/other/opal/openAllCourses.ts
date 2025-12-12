;(function () {
  // Update button state based on current page
  function updateButtonState(button: HTMLSpanElement) {
    button.style.opacity = '1'
    button.style.cursor = 'pointer'
    button.style.pointerEvents = 'auto'
    button.textContent = 'Alle Kurse öffnen'
    button.title = 'Alle Kurse öffnen. Ein TUfast-Feature.'
  }

  // Get course links from extension storage
  async function getCourseLinksFromStorage(): Promise<string[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['meine_kurse'], (result) => {
        try {
          const courses = JSON.parse(result.meine_kurse || '[]')
          const links = courses.map((course: any) => course.link).filter(Boolean)
          resolve(links)
        } catch (e) {
          console.error('Error parsing meine_kurse:', e)
          resolve([])
        }
      })
    })
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

    async function openAllCourseTabs() {
      const courseLinks = await getCourseLinksFromStorage()

      if (!courseLinks || courseLinks.length === 0) {
        alert('Keine Kurs-Links gefunden! Bitte importiere erst deine Kurse in der Extension.')
        return
      }

      if (courseLinks.length > 25) {
        alert('Du hast mehr als 25 Kurse. Um deinen Browser nicht zu überlasten, öffne sie bitte manuell.')
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
