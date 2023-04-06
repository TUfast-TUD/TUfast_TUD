
(async () => {
  const {
    bannersShown,
    savedClickCounter,
    /* enabledOWAFetch, */
    mostLikelySubmittedReview,
    pdfInInline
  } = await chrome.storage.local.get(['bannersShown', 'savedClickCounter', 'pdfInInline', 'mostLikelySubmittedReview'])

  const bannerArr = Array.isArray(bannersShown) ? bannersShown : []

  function insertBanner (bannerName: string, title: string, otherElements: Node[]) {
    const banner = document.createElement('div')
    banner.id = 'TUfastBanner'

    const img = document.createElement('img')
    img.src = chrome.runtime.getURL('/assets/images/tufast48.png')
    banner.appendChild(img)

    const titleE = document.createElement('b')
    titleE.innerText = ` ${title} `

    banner.append(titleE, ...otherElements)

    const closeLink = document.createElement('span')
    closeLink.className = 'closeLink'
    closeLink.innerText = 'X'
    closeLink.addEventListener('click', async () => {
      document.body.removeChild(banner)
      bannerArr.push(bannerName)
      await chrome.storage.local.set({ bannersShown: bannerArr })
    })

    banner.appendChild(closeLink)

    document.body.prepend(banner)
  }

  switch (true) {
    /* case !bannerArr.includes('mailCount') && savedClickCounter > 50 && !enabledOWAFetch: {
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
    } */
    case !bannerArr.includes('helpWanted') && savedClickCounter > 100: {
      const text = document.createElement('span')
      text.innerHTML = 'Du hast Bock TUfast weiterzuentwickeln? '
      const interact = document.createElement('span')
      interact.className = 'interactLink'
      interact.textContent = 'Wir suchen dich!'
      interact.addEventListener('click', () => window.open('https://tu-fast.de/jobs', '_blank'))
      insertBanner('helpWanted', 'Verstärkung gesucht:', [text, interact])
      break
    }
    case !bannerArr.includes('mv3UpdateNotice') && !pdfInInline: {
      const text = document.createElement('span')
      text.innerHTML = 'Die Opal-Personalisierung muss von dir leider erneut aktiviert werden(, wenn du magst). '
      const interact = document.createElement('span')
      interact.className = 'interactLink'
      interact.textContent = 'Hier aktivieren'
      interact.addEventListener('click', async () => {
        await chrome.runtime.sendMessage({ cmd: 'open_settings_page', params: 'opal_inline_settings' })
      })
      insertBanner('mv3UpdateNotice', 'Großes TUfast Update!', [text, interact])
      break
    }
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
        const isFirefox = navigator.userAgent.includes('Firefox/') // checking window.browser etc does not work here
        const webstoreLink = isFirefox ? 'https://addons.mozilla.org/de/firefox/addon/tufast/' : 'https://chrome.google.com/webstore/detail/tufast-tu-dresden/aheogihliekaafikeepfjngfegbnimbk'
        window.open(webstoreLink, '_blank')
        await chrome.storage.local.set({ mostLikelySubmittedReview: true })
      })
      insertBanner('submitReview', 'Gefällt\'s dir?', [text, interact])
      break
    }
  }
})()
