// Step through the color wheel
function colorStep (noOfSteps: number = 10) {
  // Get color variable
  const color = document.documentElement.style.getPropertyValue('--counter-color')

  // When no color is set on the element we set the first one: red
  if (!color) {
    document.documentElement.style.setProperty('--counter-color', 'hsl(0, 100%, 50%)')
    return
  }

  // Else we will step through the color wheel
  const hsl = color.trim().match(/^hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)$/)?.slice(1).map((n) => parseInt(n, 10))
  hsl[0] += Math.round(360 / noOfSteps) % 360 // 10 would be red again but 10 are the rockets so no +1 here
  document.documentElement.style.setProperty('--counter-color', `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`)
}

function resetColor () {
  document.documentElement.style.removeProperty('--counter-color')
}

// Main function
(async () => {
  // Get initial values
  // Promisified until usage of Manifest V3
  const { selectedRocketIcon, isEnabled, fwdEnabled, foundEasteregg } = await new Promise<any>((resolve) => chrome.storage.local.get(['selectedRocketIcon', 'isEnabled', 'fwdEnabled', 'foundEasteregg'], resolve))
  if (!isEnabled && !fwdEnabled) return

  // Looks weird but I like this more than having everything in a try/catch block
  const iconPath = (() => {
    try {
      const parsed = JSON.parse(selectedRocketIcon)
      return parsed && parsed.link ? parsed.link : 'RocketIcons/default_128px'
    } catch (e) {
      return 'RocketIcons/default_128px'
    }
  })()

  const iconURL = chrome.runtime.getURL(iconPath)

  // Using an object because the values are mutable and we don't need 10 global mutable values
  const onClickSettings = {
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
  logo.title = 'Powered by TUFast. Enjoy :)'
  document.getElementsByClassName('page-header')[0]?.appendChild(document.createElement('h1')).appendChild(logo)

  // What to do onclick
  const onClickWhenFound = () => {
    if (onClickSettings.timeUp) chrome.runtime.sendMessage({ cmd: 'open_settings_page', params: 'rocket_icons_settings' })
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
      clearTimeout(onClickSettings.screenOverlayTimeout)
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
      onClickSettings.overlay.innerHTML = onClickSettings.counter
    }

    onClickSettings.timeUp = false

    onClickSettings.screenOverlayTimeout = setTimeout(() => {
      document.body.removeChild(onClickSettings.overlay)
      onClickSettings.overlay = undefined
      onClickSettings.counter = 0
      onClickSettings.timeUp = true
      resetColor()
    }, timeout)
  })
})()
