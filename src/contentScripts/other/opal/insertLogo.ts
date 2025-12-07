// Step through the color wheel
function colorStep(noOfSteps: number = 10) {
  // Get color variable
  const color = document.documentElement.style.getPropertyValue('--counter-color')

  // When no color is set on the element we set the first one: red
  if (!color) {
    document.documentElement.style.setProperty('--counter-color', 'hsl(0, 100%, 50%)')
    return
  }

  // Else we will step through the color wheel
  const hsl = color
    .trim()
    .match(/^hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)$/)
    ?.slice(1)
    .map((n) => parseInt(n, 10))
  if (hsl?.length !== 3) return
  hsl[0] += Math.round(360 / noOfSteps) % 360 // 10 would be red again but 10 are the rockets so no +1 here
  document.documentElement.style.setProperty('--counter-color', `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`)
}

function resetColor() {
  document.documentElement.style.removeProperty('--counter-color')
}

// Main injection logic
async function injectLogo() {
  // Check if logo already exists
  if (document.getElementById('TUfastIcon')) return

  // Check if page-header exists
  const pageHeader = document.getElementsByClassName('page-header')[0]
  if (!pageHeader) return

  // Get initial values
  const { selectedRocketIcon, isEnabled, fwdEnabled, foundEasteregg } = await chrome.storage.local.get([
    'selectedRocketIcon',
    'isEnabled',
    'fwdEnabled',
    'foundEasteregg'
  ])
  if (!isEnabled && !fwdEnabled) return

  // Looks weird but I like this more than having everything in a try/catch block
  const iconPath = (() => {
    try {
      const parsed = JSON.parse(selectedRocketIcon)
      return parsed && parsed.iconPathUnlocked ? parsed.iconPathUnlocked : '/assets/icons/RocketIcons/default_128px.png'
    } catch (e) {
      return '/assets/icons/RocketIcons/default_128px.png'
    }
  })()

  const iconURL = chrome.runtime.getURL(iconPath)

  // Using an object because the values are mutable and we don't need 10 global mutable values
  const onClickSettings: {
    counter: number
    screenOverlayTimeout: any // NodeJS.Timeout and number do not work, so idc
    blocker: boolean
    timeUp: boolean
    overlay: HTMLDivElement | undefined
  } = {
    counter: 0,
    screenOverlayTimeout: undefined,
    blocker: false,
    timeUp: true,
    overlay: undefined
  }

  // Create image node
  const logo = document.createElement('img')
  logo.src = iconURL
  logo.id = 'TUfastIcon'
  logo.title = 'Powered by TUfast. Enjoy :)'
  // Create container div and insert logo
  const div = document.createElement('div')
  div.className = 'tufast-opal-header'
  div.style.cssText =
    'display: flex; flex-direction: row; gap: 16px; align-items: center; height: 100%; padding-top: 9px;'
  pageHeader.appendChild(div)
  div.appendChild(logo)

  // Helper function to maintain button order in header
  // Order: Logo - Schnee - Öffnen - Schließen
  const maintainButtonOrder = () => {
    const header = document.querySelector('.tufast-opal-header')
    if (!header) return

    const logo = header.querySelector('#TUfastIcon')
    const schnee = header.querySelector('#flakeSwitch')
    const oeffnen = header.querySelector('#openAllCourseTabsInOpalButton')
    const schliessen = header.querySelector('#closeAllCourseTabsButton')

    const desiredOrder = [logo, schnee, oeffnen, schliessen].filter(Boolean)

    // Check if reordering is actually needed
    const currentOrder = Array.from(header.children)
    const needsReorder = desiredOrder.some((el, idx) => {
      const currentIdx = currentOrder.indexOf(el!)
      return currentIdx !== idx
    })

    if (!needsReorder) return

    // Temporarily disconnect observer to avoid infinite loop
    orderObserver.disconnect()

    desiredOrder.forEach((element) => {
      if (element) header.appendChild(element)
    })

    // Reconnect observer
    orderObserver.observe(div, {
      childList: true
    })
  }

  // Observe changes to maintain order when other scripts inject their buttons
  const orderObserver = new MutationObserver(() => {
    maintainButtonOrder()
  })

  orderObserver.observe(div, {
    childList: true
  })

  maintainButtonOrder()

  // What to do onclick
  const onClickWhenFound = () => {
    if (onClickSettings.timeUp)
      chrome.runtime.sendMessage({ cmd: 'open_settings_page', params: 'rocket_icons_settings' })
  }

  if (foundEasteregg) {
    logo.addEventListener('click', onClickWhenFound)
    return
  }

  logo.addEventListener('click', () => {
    if (onClickSettings.blocker && !onClickSettings.timeUp) return
    onClickSettings.counter++

    // show screen overlay
    if (!onClickSettings.overlay) {
      // insert overlay
      onClickSettings.overlay = document.createElement('div')
      onClickSettings.overlay.id = 'counter'

      document.body.prepend(onClickSettings.overlay)
    } else {
      // remove existing timeout
      if (onClickSettings.screenOverlayTimeout) clearTimeout(onClickSettings.screenOverlayTimeout)
    }

    colorStep()

    let timeout: number

    // trigger actions based on counter
    if (onClickSettings.counter === 10) {
      // live-update the logo
      logo.src = chrome.runtime.getURL('assets/icons/RocketIcons/7_128px.png')
      // change the onclick function
      logo.onclick = onClickWhenFound
      // Unlock easteregg
      chrome.runtime.sendMessage({ cmd: 'easteregg_found' })

      onClickSettings.overlay.style.fontSize = '100px'
      timeout = 3000
      onClickSettings.blocker = true
      onClickSettings.overlay.innerHTML = '&#x1F680; &#x1F680; &#x1F680;'
    } else {
      onClickSettings.overlay.style.fontSize = '150px'
      timeout = 1000
      onClickSettings.blocker = false
      onClickSettings.overlay.style.fontWeight = 'bold'
      onClickSettings.overlay.innerHTML = onClickSettings.counter.toString()
    }

    onClickSettings.timeUp = false

    onClickSettings.screenOverlayTimeout = setTimeout(() => {
      if (onClickSettings.overlay) document.body.removeChild(onClickSettings.overlay)
      onClickSettings.overlay = undefined
      onClickSettings.counter = 0
      onClickSettings.timeUp = true
      resetColor()
    }, timeout)
  })
}

// Initialize and watch for changes
;(async () => {
  // Initial injection
  await injectLogo()

  // Watch for DOM changes (SPA navigation)
  const observer = new MutationObserver(async (mutations) => {
    // Check if page-header exists and logo doesn't
    if (document.getElementsByClassName('page-header')[0] && !document.getElementById('TUfastIcon')) {
      await injectLogo()
    }
  })

  // Start observing the document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  // Also listen for URL changes (some SPAs use history API)
  let lastUrl = location.href
  new MutationObserver(() => {
    const url = location.href
    if (url !== lastUrl) {
      lastUrl = url
      setTimeout(() => injectLogo(), 100) // Small delay to let DOM update
    }
  }).observe(document, { subtree: true, childList: true })
})()
