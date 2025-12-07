;(async () => {
  const waitForContainer = () => {
    return new Promise<HTMLElement>((resolve) => {
      const check = () => {
        const div = document.querySelector('.tufast-opal-header')
        if (div) {
          resolve(div as HTMLElement)
        } else {
          setTimeout(check, 100)
        }
      }
      check()
    })
  }

  const div = await waitForContainer()

  const openAllCourseTabsInOpalButton = document.createElement('span')
  openAllCourseTabsInOpalButton.id = 'openAllCourseTabsInOpalButton'
  openAllCourseTabsInOpalButton.title = 'Alle Kurse öffnen. Ein TUfast-Feature.'
  openAllCourseTabsInOpalButton.textContent = 'Alle Kurse öffnen'

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
})()
