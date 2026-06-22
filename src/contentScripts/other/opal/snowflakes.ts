const opalSnowflakeStrings = globalThis.TUFAST_STRINGS.opal
// Global state to persist across SPA navigations
const globalSnowflakeState: {
  container: HTMLDivElement | undefined
  currentState: boolean
  initialized: boolean
} = {
  container: undefined,
  currentState: true,
  initialized: false
}

// Main injection logic
async function injectSnowflakeControl() {
  // Check if already exists
  if (document.getElementById('flakeSwitch')) return

  // Check if container exists
  const div = document.querySelector('.tufast-opal-header') as HTMLElement
  if (!div) return

  // All december is christmas time
  if (new Date().getMonth() !== 11) return

  // Only load from storage once on first initialization
  if (!globalSnowflakeState.initialized) {
    const { flakeState } = await chrome.storage.local.get(['flakeState'])
    if (typeof flakeState === 'boolean') {
      globalSnowflakeState.currentState = flakeState
    }
    globalSnowflakeState.initialized = true
  }

  const SNOW_CHARS = ['❄', '❅']

  function createSnowflake() {
    const snowflake = document.createElement('div')
    snowflake.classList.add('snowflake')
    snowflake.textContent = SNOW_CHARS[Math.floor(Math.random() * SNOW_CHARS.length)]

    // Random horizontal position
    snowflake.style.left = Math.random() * 100 + '%'

    // Random animation duration (15-30 seconds - slower fall)
    const duration = 15 + Math.random() * 15
    snowflake.style.setProperty('--duration', duration + 's')

    // Random horizontal drift (-100px to 100px - more drift)
    const drift = -100 + Math.random() * 200
    snowflake.style.setProperty('--drift', drift + 'px')

    // Random sway amount (40-80px - more swaying)
    const sway = (40 + Math.random() * 40) * (Math.random() > 0.5 ? 1 : -1)
    snowflake.style.setProperty('--sway', sway + 'px')

    // Random delay - spread across the full duration range for better distribution
    const delay = -(Math.random() * 20) // Spread across 0-20 seconds
    snowflake.style.setProperty('--delay', delay + 's')

    // Noticeably random size (1.2em to 2.6em for big variation)
    const size = 1.2 + Math.random() * 1.4
    snowflake.style.setProperty('--size', size + 'em')

    return snowflake
  }

  function removeFlakes() {
    try {
      const container = document.getElementById('snowflakes-container')
      if (container) {
        document.body.removeChild(container)
      }
      globalSnowflakeState.container = undefined
    } catch (e) {}
  }

  function insertFlakes() {
    // Check if container already exists (from previous navigation)
    if (globalSnowflakeState.container && document.getElementById('snowflakes-container')) {
      return
    }

    // Remove any orphaned containers first
    removeFlakes()

    globalSnowflakeState.container = document.createElement('div')
    globalSnowflakeState.container.id = 'snowflakes-container'
    globalSnowflakeState.container.setAttribute('aria-hidden', 'true')
    globalSnowflakeState.container.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;z-index:9999'

    // Create 48 snowflakes
    for (let i = 0; i < 48; i++) {
      globalSnowflakeState.container.appendChild(createSnowflake())
    }

    document.body.prepend(globalSnowflakeState.container)
  }

  function updateButtonText(switchElement: HTMLSpanElement) {
    switchElement.textContent = globalSnowflakeState.currentState
      ? opalSnowflakeStrings.snowDisable
      : opalSnowflakeStrings.snowEnable
  }

  const flakeSwitch = document.createElement('span')
  flakeSwitch.id = 'flakeSwitch'
  flakeSwitch.title = opalSnowflakeStrings.snowTitle

  updateButtonText(flakeSwitch)

  flakeSwitch.addEventListener('click', async () => {
    globalSnowflakeState.currentState = !globalSnowflakeState.currentState
    await chrome.storage.local.set({ flakeState: globalSnowflakeState.currentState })

    if (globalSnowflakeState.currentState) {
      insertFlakes()
    } else {
      removeFlakes()
    }

    updateButtonText(flakeSwitch)
  })

  // Simply append - order is managed by insertLogo.ts
  div.appendChild(flakeSwitch)

  // Apply current state (but don't create new snowflakes if they already exist)
  if (globalSnowflakeState.currentState) {
    insertFlakes()
  } else {
    removeFlakes()
  }
}

// Initialize and watch for changes
;(async () => {
  // Wait a bit for the logo to be injected first
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Initial injection
  await injectSnowflakeControl()

  // Watch for DOM changes (SPA navigation)
  let injectionTimeout: number | undefined
  const observer = new MutationObserver(async () => {
    // Debounce to prevent multiple rapid injections
    if (injectionTimeout) clearTimeout(injectionTimeout)

    injectionTimeout = window.setTimeout(async () => {
      if (document.querySelector('.tufast-opal-header') && !document.getElementById('flakeSwitch')) {
        await injectSnowflakeControl()
      }
    }, 50)
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
})()
