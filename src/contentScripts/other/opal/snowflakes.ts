;(async () => {
  // All december is christmas time
  if (new Date().getMonth() !== 11) return
  const { flakeState } = await chrome.storage.local.get(['flakeState'])

  const snowflakeSettings: {
    container: HTMLDivElement | undefined
    switch: HTMLHeadingElement | undefined
    currentState: boolean
  } = {
    container: undefined,
    switch: undefined,
    currentState: flakeState
  }

  // If there is undefined or something wrong in there we set it to true
  if (typeof snowflakeSettings.currentState !== 'boolean') snowflakeSettings.currentState = true

  function removeFlakes() {
    if (!snowflakeSettings.container) return
    try {
      const sf = document.getElementById('snowflakes')
      if (sf) document.body.removeChild(sf)
      snowflakeSettings.container = undefined
    } catch (e) {}
  }

  function insertFlakes() {
    if (snowflakeSettings.container) return

    snowflakeSettings.container = document.createElement('div')
    snowflakeSettings.container.classList.add('snowflakes')
    snowflakeSettings.container.id = 'snowflakes'
    snowflakeSettings.container.setAttribute('aria-hidden', 'true')
    for (let i = 0; i < 12; i++) {
      const flake = document.createElement('div')
      flake.className = 'snowflake'
      flake.innerText = '❅'
      snowflakeSettings.container.appendChild(flake)
    }
    // snowflakeNodes.container.innerHTML = '<div class="snowflake">❅</div><div class="snowflake">❆</div><div class="snowflake">❅</div><div class="snowflake">❆</div><div class="snowflake">❅</div><div class="snowflake">❆</div><div class="snowflake">❅</div><div class="snowflake">❆</div><div class="snowflake">❅</div><div class="snowflake">❆</div><div class="snowflake">❅</div><div class="snowflake">❆</div>'

    // add snowflake div to website body
    document.body.prepend(snowflakeSettings.container)
  }

  // toggle flake state
  async function flakesSwitchOnClick(e: MouseEvent) {
    snowflakeSettings.currentState = !snowflakeSettings.currentState

    await chrome.storage.local.set({ flakeState: snowflakeSettings.currentState })

    if (snowflakeSettings.currentState) {
      ;(e.target as HTMLHeadingElement).style.color = 'black'
      insertFlakes()
    } else {
      ;(e.target as HTMLSpanElement).style.color = 'grey'
      removeFlakes()
    }
  }

  const flakeSwitch = document.createElement('h1')
  flakeSwitch.id = 'flakeSwitch'
  flakeSwitch.title = 'Click me. Winter powered by TUfast.'
  flakeSwitch.style.color = snowflakeSettings.currentState ? 'black' : 'grey'
  flakeSwitch.textContent = '❅'
  flakeSwitch.addEventListener('click', flakesSwitchOnClick)

  document.getElementsByClassName('page-header')[0]?.appendChild(flakeSwitch)

  snowflakeSettings.currentState ? insertFlakes() : removeFlakes()
})()
