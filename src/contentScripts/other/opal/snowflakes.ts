;(async () => {
  // All december is christmas time
  if (new Date().getMonth() !== 11) return
  const { flakeState } = await chrome.storage.local.get(['flakeState'])

  const snowflakeSettings: {
    container: HTMLDivElement | undefined
    switch: HTMLSpanElement | undefined
    currentState: boolean
  } = {
    container: undefined,
    switch: undefined,
    currentState: flakeState
  }

  if (typeof snowflakeSettings.currentState !== 'boolean') snowflakeSettings.currentState = true

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
    if (!snowflakeSettings.container) return
    try {
      const container = document.getElementById('snowflakes-container')
      if (container) document.body.removeChild(container)
      snowflakeSettings.container = undefined
    } catch (e) {}
  }

  function insertFlakes() {
    if (snowflakeSettings.container) return

    snowflakeSettings.container = document.createElement('div')
    snowflakeSettings.container.id = 'snowflakes-container'
    snowflakeSettings.container.setAttribute('aria-hidden', 'true')
    snowflakeSettings.container.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;z-index:9999'

    // Create 48 snowflakes
    for (let i = 0; i < 48; i++) {
      snowflakeSettings.container.appendChild(createSnowflake())
    }

    document.body.prepend(snowflakeSettings.container)
  }

  async function flakesSwitchOnClick(e: MouseEvent) {
    snowflakeSettings.currentState = !snowflakeSettings.currentState
    await chrome.storage.local.set({ flakeState: snowflakeSettings.currentState })

    const target = e.target as HTMLSpanElement
    if (snowflakeSettings.currentState) {
      target.style.color = 'black'
      insertFlakes()
    } else {
      target.style.color = 'grey'
      removeFlakes()
    }
  }

  const flakeSwitch = document.createElement('span')
  flakeSwitch.id = 'flakeSwitch'
  flakeSwitch.title = 'Click me. Winter powered by TUfast.'
  flakeSwitch.style.cssText = 'cursor:pointer; font-size: 20px'
  flakeSwitch.style.color = snowflakeSettings.currentState ? 'black' : 'grey'
  flakeSwitch.textContent = '❅'
  flakeSwitch.addEventListener('click', flakesSwitchOnClick)

  const div = document.querySelector('.tufast-opal-header')
  div?.appendChild(flakeSwitch)

  snowflakeSettings.currentState ? insertFlakes() : removeFlakes()
})()
