/*
   { selectedRocketIcon: '{"id": "RI_default", "link": "RocketIcons/default_128px"}' }
*/
// No async await on top level
chrome.storage.local.get(['isEnabled', 'fwdEnabled', 'PRObadge', 'flakeState', 'selectedRocketIcon', 'foundEasteregg'], (result) => {
  if (result.isEnabled || result.fwdEnabled) {
    // parse selectedRocketIcon
    const selectedRocketIcon = JSON.parse(result.selectedRocketIcon)

    // decide which overlay to show
    let christmasTime = false
    const d = new Date()
    const month = d.getMonth() + 1 // starts at 0
    const day = d.getDate()
    if (month === 12 && day > 15 && day < 27) christmasTime = true

    // switch flakeState to false in november
    if (month === 11) chrome.storage.local.set({ flakeState: false })

    if (christmasTime) {
      // on load
      document.addEventListener('DOMNodeInserted', () => {
        if (!document.getElementById('flake')) insertFlakeSwitch(result.flakeState)
      })
      // on document changes
      window.addEventListener('load', () => {
        if (!document.getElementById('flake')) insertFlakeSwitch(result.flakeState)
        if (!document.getElementById('snowflakes') && result.flakeState) insertFlakes()
      }, true)
      // standard rocket logo
    } else {
      // on load
      document.addEventListener('DOMNodeInserted', () => {
        if (!document.getElementById('TUFastLogo')) { insertRocket(selectedRocketIcon, result.PRObadge, result.foundEasteregg) }
      })
      // on document changes
      window.addEventListener('load', () => {
        if (!document.getElementById('TUFastLogo')) { insertRocket(selectedRocketIcon, result.PRObadge, result.foundEasteregg) }
      }, true)
    }
  }
})

// variables required for rocket logo easteregg
let globalCounter = 0 // count clicks on icon
let coutdownRemoveScreenOverlay // timer
let timeout = 1000 // timeout for timer
let blocker = false // block icon click
let timeUp = true // true, when time is up
let displayValue // number of text, which shows on screen
let typeOfMsg = '' // type of message which is displayed

async function updateRocketLogo (iconPath) {
  const timestamp = new Date().getTime()
  document.querySelectorAll('#TUFastLogo img')[0].src = chrome.runtime.getURL('' + iconPath) + '?t =' + timestamp
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.runtime.sendMessage({ cmd: 'update_rocket_logo_easteregg' }, resolve))
}

// function setProBadge() {
//   document.getElementById('TUFastLogo').parentNode.removeChild(document.getElementById('TUFastLogo'))
//   chrome.storage.local.set({ PRObadge: 'PRO' }, function () { })
//   insertRocket('colorful', 'PRO')
// }

function insertScreenOverlay () {
  try {
    if (!document.getElementById('counter')) {
      const body = document.getElementsByTagName('body')[0]
      const counter = document.createElement('div')
      const container = document.createElement('div')
      container.style.position = 'relative'
      counter.id = 'counter'
      counter.style.opacity = '1'
      counter.style.fontSize = '150px'
      counter.style.position = 'absolute'
      counter.style.color = '#000000'
      counter.style.top = '50%'
      counter.style.left = '50%'
      counter.style.marginRight = '-50%'
      counter.style.transform = 'translate(-50%, -50%)'
      counter.style.zIndex = '99'

      container.appendChild(counter)
      body.prepend(counter)
    }
  } catch (e) { console.log('cannot insert overlay:' + e) }
}

async function logoOnClickEasteregg () {
  // block counting up when text is promted
  if (blocker && !timeUp) return

  globalCounter++

  // show screen overlay
  if (!document.getElementById('counter')) {
    // insert overlay
    insertScreenOverlay()
  } else {
    // remove existing timeout
    clearTimeout(coutdownRemoveScreenOverlay)
  }

  let counter = document.getElementById('counter')
  counter.style.color = funnyColor(counter.style.color, 80)

  // trigger actions based on counter
  switch (globalCounter) {
    case 10: {
      // easteregg finished
      displayValue = '&#x1F680; &#x1F680; &#x1F680;'
      typeOfMsg = 'text'
      // enable rocketIcon, set selected rocketIcon (RI3)
      // live-update the logo
      updateRocketLogo('../assets/icons/RocketIcons/7_128px.png')
      // change the onclick function
      document.getElementById('TUFastLogo').onclick = logoOnClick
      // Promisified until usage of Manifest V3
      const availableRockets = await new Promise((resolve) => chrome.storage.local.get(['availableRockets'], resp => resolve(resp.availableRockets)))
      availableRockets.push('RI3')
      // Promisified until usage of Manifest V3
      await new Promise((resolve) => chrome.storage.local.set({
        foundEasteregg: true,
        selectedRocketIcon: '{"id": "RI3", "link": "../assets/icons/RocketIcons/7_128px.png"}',
        availableRockets
      }, resolve))
      break
    }
    default:
      typeOfMsg = 'number'
      displayValue = globalCounter
  }

  // decide how to show text
  switch (typeOfMsg) {
    case 'text':
      counter.style.fontSize = '100px'
      timeout = 3000
      blocker = true
      break
    default:
      timeout = 1000
      blocker = false
      counter.style.fontSize = '150px'
  }

  // populate screen overlay with value
  counter.innerHTML = displayValue

  timeUp = false

  coutdownRemoveScreenOverlay = setTimeout(() => {
    counter = document.getElementById('counter')
    counter.parentNode.removeChild(counter)
    timeUp = true
  }, timeout)
}

async function logoOnClick () {
  // console.log('here')
  if (timeUp) {
  // Promisified until usage of Manifest V3
    await new Promise((resolve) => chrome.runtime.sendMessage({ cmd: 'open_settings_page', params: 'rocket_icons_settings' }, resolve))
  }
}

function funnyColor (color, step) {
  const rgb = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
  rgb[1] = parseInt(rgb[1])
  rgb[2] = parseInt(rgb[2])
  rgb[3] = parseInt(rgb[3])
  if (rgb[1] < 255 - step && rgb[2] < 255 - step && rgb[3] < 150 - step) rgb[1] += step
  else if (rgb[2] < 255 - step && rgb[3] < 150 - step) rgb[2] += step
  else if (rgb[3] < 150 - step) rgb[3] += step
  else if (rgb[1] > 0 + step) rgb[1] -= step
  else if (rgb[2] > 0 + step) rgb[2] -= step
  else if (rgb[3] > 0 + step) rgb[3] -= step
  color = 'rgb(' + rgb[1] + ',' + rgb[2] + ',' + rgb[3] + ')'
  return color
}

function insertRocket (selectedRocketIcon, PRObadge = false, foundEasteregg) {
  let imgUrl, header, logoNode, logoLink, logoImg, badge
  try {
    if (document.getElementsByClassName('page-header')[0] !== undefined) {
      header = document.getElementsByClassName('page-header')[0]
      logoNode = document.createElement('h1')
      logoLink = document.createElement('a')
      logoImg = document.createElement('img')
      logoLink.href = 'javascript:void(0)'
      logoNode.id = 'TUFastLogo'
      logoLink.title = 'powered by TUFast. Enjoy :)'

      // onclick function depends on whether easteregg was already found!
      if (foundEasteregg) {
        logoNode.onclick = logoOnClick
      } else {
        logoNode.onclick = logoOnClickEasteregg
      }

      // create rocket icon
      imgUrl = chrome.runtime.getURL('../' + selectedRocketIcon.link)
      logoImg.style.display = 'inline-block'
      logoImg.style.width = '37px'
      logoImg.src = imgUrl
      logoLink.appendChild(logoImg)

      // add badge
      switch (PRObadge) {
        case 'PRO':
          logoLink.style.position = 'relative'
          badge = document.createElement('span')
          badge.classList.add('badge')
          badge.innerHTML = 'PRO'
          badge.style.fontSize = '0.3em'
          badge.style.position = 'absolute'
          badge.style.bottom = '0px'
          badge.style.left = '20px'
          logoLink.appendChild(badge)
          break
        default:
          break
      }

      // append to header
      logoNode.appendChild(logoLink)
      header.append(logoNode)
    }
  } catch (e) {
    console.log('Error inserting logo: ' + e)
  }
}

// toggle flake state
async function flakesSwitchOnClick () {
  // Promisified until usage of Manifest V3
  const flakeState = await new Promise((resolve) => chrome.storage.local.get(['flakeState'], resp => resolve(resp.flakeState)))

  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({ flakeState: !flakeState }, resolve))
  // careful: this has to be negated, as its toggled
  if (!flakeState) {
    document.getElementById('flakeLink').style.color = 'black'
    insertFlakes()
  } else {
    document.getElementById('flakeLink').style.color = 'grey'
    removeFlakes()
  }
}

function removeFlakes () {
  try {
    document.getElementById('snowflakes').parentNode.removeChild(document.getElementById('snowflakes'))
  } catch (e) { console.log('No snowflakes!: ' + e) }
}

function insertFlakes () {
  try {
    if (!document.getElementById('snowflakes')) {
      // create snowflake css
      const snowflakeCss = '.snowflake {color: #fff;font-size: 1em;font-family: Arial, sans-serif;text-shadow: 0 0 5px #000;}@-webkit-keyframes snowflakes-fall{0%{top:-10%}100%{top:100%}}@-webkit-keyframes snowflakes-shake{0%,100%{-webkit-transform:translateX(0);transform:translateX(0)}50%{-webkit-transform:translateX(80px);transform:translateX(80px)}}@keyframes snowflakes-fall{0%{top:-10%}100%{top:100%}}@keyframes snowflakes-shake{0%,100%{transform:translateX(0)}50%{transform:translateX(80px)}}.snowflake{position:fixed;top:-10%;z-index:9999;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:default;-webkit-animation-name:snowflakes-fall,snowflakes-shake;-webkit-animation-duration:10s,3s;-webkit-animation-timing-function:linear,ease-in-out;-webkit-animation-iteration-count:infinite,infinite;-webkit-animation-play-state:running,running;animation-name:snowflakes-fall,snowflakes-shake;animation-duration:10s,3s;animation-timing-function:linear,ease-in-out;animation-iteration-count:infinite,infinite;animation-play-state:running,running}.snowflake:nth-of-type(0){left:1%;-webkit-animation-delay:0s,0s;animation-delay:0s,0s}.snowflake:nth-of-type(1){left:10%;-webkit-animation-delay:1s,1s;animation-delay:1s,1s}.snowflake:nth-of-type(2){left:20%;-webkit-animation-delay:6s,.5s;animation-delay:6s,.5s}.snowflake:nth-of-type(3){left:30%;-webkit-animation-delay:4s,2s;animation-delay:4s,2s}.snowflake:nth-of-type(4){left:40%;-webkit-animation-delay:2s,2s;animation-delay:2s,2s}.snowflake:nth-of-type(5){left:50%;-webkit-animation-delay:8s,3s;animation-delay:8s,3s}.snowflake:nth-of-type(6){left:60%;-webkit-animation-delay:6s,2s;animation-delay:6s,2s}.snowflake:nth-of-type(7){left:70%;-webkit-animation-delay:2.5s,1s;animation-delay:2.5s,1s}.snowflake:nth-of-type(8){left:80%;-webkit-animation-delay:1s,0s;animation-delay:1s,0s}.snowflake:nth-of-type(9){left:90%;-webkit-animation-delay:3s,1.5s;animation-delay:3s,1.5s}.snowflake:nth-of-type(10){left:25%;-webkit-animation-delay:2s,0s;animation-delay:2s,0s}.snowflake:nth-of-type(11){left:65%;-webkit-animation-delay:4s,2.5s;animation-delay:4s,2.5s}'
      const snowflakeStyle = document.createElement('style')

      // add css to snowflage tag
      if (snowflakeStyle.styleSheet) {
        snowflakeStyle.styleSheet.cssText = snowflakeCss
      } else {
        snowflakeStyle.appendChild(document.createTextNode(snowflakeCss))
      }

      // add snowflage style tag to website head
      document.getElementsByTagName('head')[0].appendChild(snowflakeStyle)

      // create snowflake div
      const snowflakes = document.createElement('div')
      snowflakes.classList.add('snowflakes')
      snowflakes.id = 'snowflakes'
      snowflakes.setAttribute('aria-hidden', 'true')
      snowflakes.innerHTML = '<div class="snowflake">❅</div><div class="snowflake">❆</div><div class="snowflake">❅</div><div class="snowflake">❆</div><div class="snowflake">❅</div><div class="snowflake">❆</div><div class="snowflake">❅</div><div class="snowflake">❆</div><div class="snowflake">❅</div><div class="snowflake">❆</div><div class="snowflake">❅</div><div class="snowflake">❆</div>'

      // add snowflake div to website body
      document.getElementsByTagName('body')[0].prepend(snowflakes)
    }
  } catch (e) { console.log('cannot insert snowFlakes: ' + e) }
}

function insertFlakeSwitch (currentlyActivated) {
  if (currentlyActivated === undefined) currentlyActivated = true
  try {
    if (document.getElementsByClassName('page-header')[0] !== undefined) {
      const header = document.getElementsByClassName('page-header')[0]
      const flake = document.createElement('h1')
      const flakeLink = document.createElement('a')
      flakeLink.id = 'flakeLink'
      flakeLink.style.textDecoration = 'none'
      flakeLink.href = 'javascript:void(0)'
      flake.id = 'flake'
      flakeLink.title = 'Click me. Winter powered by TUfast.'
      flake.onclick = flakesSwitchOnClick
      flake.style.paddingTop = '2px'
      flake.style.paddingLeft = '3px'

      if (currentlyActivated) flakeLink.style.color = 'black'
      if (!currentlyActivated) flakeLink.style.color = 'Grey'

      flakeLink.innerHTML = '❅'
      flakeLink.fontSize = '30px'

      // append to header
      flake.appendChild(flakeLink)
      header.append(flake)
    }
  } catch (e) {
    console.log('Error inserting flakeSwitch: ' + e)
  }
}
