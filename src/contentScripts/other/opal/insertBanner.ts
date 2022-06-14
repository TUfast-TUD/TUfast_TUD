
(async () => {
  const { bannersShown, savedClickCounter, enabledOWAFetch, mostLikelySubmittedReview } = await new Promise<any>((resolve) => chrome.storage.local.get(['bannersShown', 'savedClickCounter', 'enabledOWAFetch', 'mostLikelySubmittedReview'], resolve))

  const bannerArr = Array.isArray(bannersShown) ? bannersShown : []

  function insertBanner (bannerName: string, title: string, otherElements: Node[]) {
    const banner = document.createElement('div')
    banner.id = 'TUfastBanner'

    const img = document.createElement('img')
    img.src = chrome.runtime.getURL('/assets/images/tufast48.png')
    banner.appendChild(img)

    const titleE = document.createElement('b')
    titleE.innerText = ` ${title} `

    banner.append(...otherElements)

    const closeLink = document.createElement('span')
    closeLink.className = 'closeLink'
    closeLink.innerText = 'X'
    closeLink.addEventListener('click', async () => {
      document.body.removeChild(banner)
      bannerArr.push(bannerName)
      await new Promise<void>((resolve) => chrome.storage.local.set({ bannersShown: bannerArr }, resolve))
    })

    banner.appendChild(closeLink)

    document.body.prepend(banner)
  }

  switch (true) {
    /*case !bannerArr.includes('mailCount') && savedClickCounter > 50 && !enabledOWAFetch: {
      const text = document.createTextNode('Mit TUfast verpasst du keine Mails aus deinem TU Dresden Postfach! ')
      const interact = document.createElement('span')
      interact.className = 'interactLink'
      interact.textContent = 'Jetzt probieren!'
      interact.addEventListener('click', () => {
        chrome.runtime.sendMessage({ cmd: 'open_settings_page', params: 'mailFetchSettings' })
      })
      insertBanner('mailCount', 'Noch faster:', [text, interact])
      break
    }
    case !bannerArr.includes('keyboardShortcuts') && savedClickCounter > 100: {
      const text = document.createElement('span')
      text.innerHTML = 'Öffne z.B. das Dashboard mit <strong>Alt+Q</strong>. '
      const interact = document.createElement('span')
      interact.className = 'interactLink'
      interact.textContent = 'Alle Shortcuts ansehen!'
      interact.addEventListener('click', () => {
        chrome.runtime.sendMessage({ cmd: 'open_shortcut_settings' })
      })
      insertBanner('keyboardShortcuts', 'Supergeil: TUfast Shortcuts!', [text, interact])
      break
    }
    case !bannerArr.includes('customizeOpal') && savedClickCounter > 150: {
      const text = document.createElement('span')
      text.innerHTML = 'Mit TUfast kannst du OPAL personalisieren und verbessern! '
      const interact = document.createElement('span')
      interact.className = 'interactLink'
      interact.textContent = 'Gleich ausprobieren'
      interact.addEventListener('click', () => {
        chrome.runtime.sendMessage({ cmd: 'open_settings_page', params: 'opalCustomize' })
      })
      insertBanner('customizeOpal', 'Wie du willst:', [text, interact])
      break
    }*/
    case !bannerArr.includes('customizeRockets') && savedClickCounter > 250: {
      const text = document.createElement('span')
      text.innerHTML = 'TUfast empfehlen und neue Icons freischalten! '
      const interact = document.createElement('span')
      interact.className = 'interactLink'
      interact.textContent = 'Los gehts!'
      interact.addEventListener('click', () => {
        chrome.runtime.sendMessage({ cmd: 'open_settings_page', params: 'rocket_icons_settings' })
      })
      insertBanner('customizeRockets', 'Schnapp\' sie dir alle!', [text, interact])
      break
    }
    case !bannerArr.includes('submitReview') && !mostLikelySubmittedReview && savedClickCounter > 500: {
      const text = document.createElement('span')
      text.innerHTML = 'Dann hau\' mal ne gute Bewertung im Store raus! '
      const interact = document.createElement('span')
      interact.className = 'interactLink'
      interact.textContent = 'Hier geht\'s lang!'
      interact.addEventListener('click', async () => {
        const isFirefox = !!(typeof browser !== 'undefined' && browser.runtime && browser.runtime.getBrowserInfo)
        const webstoreLink = isFirefox ? 'https://addons.mozilla.org/de/firefox/addon/tufast/' : 'https://chrome.google.com/webstore/detail/tufast-tu-dresden/aheogihliekaafikeepfjngfegbnimbk'
        window.open(webstoreLink, '_blank')
        await new Promise<void>((resolve) => chrome.storage.local.set({ mostLikelySubmittedReview: true }, resolve))
      })
      insertBanner('submitReview', 'Gefällt\'s dir?', [text, interact])
      break
    }
  }
})()
