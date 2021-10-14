'use strict'

// eslint-disable-next-line no-unused-vars
const isChrome = navigator.userAgent.includes('Chrome/') // attention: no failsave browser detection | also for new edge!
const isFirefox = navigator.userAgent.includes('Firefox/') // attention: no failsave browser detection

// start fetchOWA if activated and user data exists
chrome.storage.local.get(['enabledOWAFetch', 'NumberOfUnreadMails'], async (resp) => {
  if (await userDataExists() && resp.enabledOWAFetch) {
    await enableOWAFetch() // start owa fetch
    setBadgeUnreadMails(resp.NumberOfUnreadMails) // read number of unread mails from storage and display badge
    console.log('Activated OWA fetch.')
  } else { console.log('No OWAfetch registered') }
})

// disable star rating
chrome.storage.local.set({ ratingEnabledFlag: false })

//  reset banner for gOPAL
const d = new Date()
const month = d.getMonth() + 1 // starts at 0
const day = d.getDate()
if (month === 10 && day > 20) {
  chrome.storage.local.set({ closedMsg1: false })
}

// DOESNT WORK IN RELEASE VERSION
chrome.storage.local.get(['openSettingsOnReload'], (resp) => {
  if (resp.openSettingsOnReload) openSettingsPage()
  chrome.storage.local.set({ openSettingsOnReload: false })
})

// set browserIcon
chrome.storage.local.get(['selectedRocketIcon'], (resp) => {
  try {
    const r = JSON.parse(resp.selectedRocketIcon)
    chrome.browserAction.setIcon({
      path: r.link
    })
  } catch (e) { console.log('Cannot set rocket icon: ' + e) }
})

console.log('Loaded TUfast')
chrome.storage.local.set({ loggedOutSelma: false })
chrome.storage.local.set({ loggedOutElearningMED: false })
chrome.storage.local.set({ loggedOutTumed: false })
chrome.storage.local.set({ loggedOutQis: false })
chrome.storage.local.set({ loggedOutOpal: false })
chrome.storage.local.set({ loggedOutOwa: false })
chrome.storage.local.set({ loggedOutMagma: false })
chrome.storage.local.set({ loggedOutJexam: false })
chrome.storage.local.set({ loggedOutCloudstore: false })
chrome.storage.local.set({ loggedOutTex: false })
chrome.storage.local.set({ loggedOutTumed: false })
chrome.storage.local.set({ loggedOutGitlab: false })
chrome.storage.local.get(['pdfInNewTab'], (result) => {
  if (result.pdfInNewTab) {
    enableHeaderListener(true)
  }
})

chrome.runtime.onInstalled.addListener((details) => {
  const reason = details.reason
  switch (reason) {
    case 'install':
      console.log('TUfast installed.')
      openSettingsPage('first_visit') // open settings page
      chrome.storage.local.set({ installed: true })
      chrome.storage.local.set({ showed_50_clicks: false })
      chrome.storage.local.set({ showed_100_clicks: false })
      chrome.storage.local.set({ isEnabled: false })
      chrome.storage.local.set({ fwdEnabled: true })
      chrome.storage.local.set({ mostLiklySubmittedReview: false })
      chrome.storage.local.set({ removedReviewBanner: false })
      chrome.storage.local.set({ neverShowedReviewBanner: true })
      chrome.storage.local.set({ encryption_level: 2 })
      chrome.storage.local.set({ meine_kurse: false })
      chrome.storage.local.set({ favoriten: false })
      // chrome.storage.local.set({openSettingsPageParam: false})
      chrome.storage.local.set({ seenInOpalAfterDashbaordUpdate: 0 })
      chrome.storage.local.set({ dashboardDisplay: 'favoriten' })
      chrome.storage.local.set({ additionalNotificationOnNewMail: false })
      chrome.storage.local.set({ NumberOfUnreadMails: 'undefined' })
      chrome.storage.local.set({ removedOpalBanner: false })
      chrome.storage.local.set({ nameIsTUfast: true })
      chrome.storage.local.set({ enabledOWAFetch: false })
      chrome.storage.local.set({ colorfulRocket: 'black' })
      chrome.storage.local.set({ PRObadge: false })
      chrome.storage.local.set({ flakeState: false })
      chrome.storage.local.set({ availableRockets: ['RI_default'] })
      chrome.storage.local.set({ foundEasteregg: false })
      chrome.storage.local.set({ hisqisPimpedTable: true })
      chrome.storage.local.set({ openSettingsOnReload: false })
      chrome.storage.local.set({ selectedRocketIcon: '{"id": "RI_default", "link": "assets/icons/RocketIcons/default_128px.png"}' })
      chrome.storage.local.set({ pdfInInline: false })
      chrome.storage.local.set({ pdfInNewTab: false })
      chrome.storage.local.set({ studiengang: 'general' })
      chrome.storage.local.set({ updateCustomizeStudiengang: false })
      chrome.storage.local.set({ TUfastCampInvite1: false })
      chrome.storage.local.set({ theme: 'system' })
      break
    case 'update':
      // check if encryption is already on level 2. This should be the case for every install now. But I'll leave this here anyway
      chrome.storage.local.get(['encryption_level'], (resp) => {
        if (!(resp.encryption_level === 2)) {
          console.log('Upgrading encryption standard to level 2...')
          chrome.storage.local.get(['asdf', 'fdsa'], (result) => {
            setUserData({ asdf: atob(result.asdf), fdsa: atob(result.fdsa) })
            chrome.storage.local.set({ encryption_level: 2 })
          })
        }
      })
      // check if the type of courses is selected which should be display in the dasbhaord. If not, set to default
      chrome.storage.local.get(['dashboardDisplay'], (resp) => {
        if (resp.dashboardDisplay === null || resp.dashboardDisplay === undefined || resp.dashboardDisplay === '') {
          chrome.storage.local.set({ dashboardDisplay: 'favoriten' })
        }
      })
      // check if mostLiklySubmittedReview
      chrome.storage.local.get(['mostLiklySubmittedReview'], (resp) => {
        if (resp.mostLiklySubmittedReview === null || resp.mostLiklySubmittedReview === undefined || resp.mostLiklySubmittedReview === '') {
          chrome.storage.local.set({ mostLiklySubmittedReview: false })
        }
      })
      // check if removedReviewBanner
      chrome.storage.local.get(['removedReviewBanner'], (resp) => {
        if (resp.removedReviewBanner === null || resp.removedReviewBanner === undefined || resp.removedReviewBanner === '') {
          chrome.storage.local.set({ removedReviewBanner: false })
        }
      })
      // check if neverShowedReviewBanner
      chrome.storage.local.get(['neverShowedReviewBanner'], (resp) => {
        if (resp.neverShowedReviewBanner === null || resp.neverShowedReviewBanner === undefined || resp.neverShowedReviewBanner === '') {
          chrome.storage.local.set({ neverShowedReviewBanner: true })
        }
      })
      // check if seenInOpalAfterDashbaordUpdate exists
      chrome.storage.local.get(['seenInOpalAfterDashbaordUpdate'], (resp) => {
        if (resp.seenInOpalAfterDashbaordUpdate === null || resp.seenInOpalAfterDashbaordUpdate === undefined || resp.seenInOpalAfterDashbaordUpdate === '') {
          chrome.storage.local.set({ seenInOpalAfterDashbaordUpdate: 0 })
        }
      })
      // check if enabledOWAFetch exists
      chrome.storage.local.get(['enabledOWAFetch'], (resp) => {
        if (resp.enabledOWAFetch === null || resp.enabledOWAFetch === undefined || resp.enabledOWAFetch === '') {
          chrome.storage.local.set({ enabledOWAFetch: false })
          chrome.storage.local.set({ NumberOfUnreadMails: 'undefined' })
          chrome.storage.local.set({ additionalNotificationOnNewMail: false })
        }
      })
      // check, whether flake state exists. If not, initialize with false.
      chrome.storage.local.get(['flakeState'], (result) => {
        if (result.flakeState === undefined || result.flakeState === null) { // set to true, so that state will be false!
          chrome.storage.local.set({ flakeState: false })
        }
      })
      // check if ShowedFirefoxBanner
      chrome.storage.local.get(['showedFirefoxBanner'], (result) => {
        if (result.showedFirefoxBanner === undefined || result.showedFirefoxBanner === null) {
          chrome.storage.local.set({ showedFirefoxBanner: false })
        }
      })
      // check if showedUnreadMailCounterBanner
      chrome.storage.local.get(['showedUnreadMailCounterBanner'], (result) => {
        if (result.showedUnreadMailCounterBanner === undefined || result.showedUnreadMailCounterBanner === null) {
          chrome.storage.local.set({ showedUnreadMailCounterBanner: false })
        }
      })
      // check if openSettingsOnReload
      chrome.storage.local.get(['openSettingsOnReload'], (result) => {
        if (result.openSettingsOnReload === undefined || result.openSettingsOnReload === null) {
          chrome.storage.local.set({ openSettingsOnReload: false })
        }
      })
      // check if availableRockets
      chrome.storage.local.get(['availableRockets'], (result) => {
        if (result.availableRockets === undefined || result.availableRockets === null) {
          chrome.storage.local.set({ availableRockets: ['RI_default'] })
        }
      })
      // check if selectedRocketIcon
      chrome.storage.local.get(['selectedRocketIcon'], (result) => {
        if (result.selectedRocketIcon === undefined || result.selectedRocketIcon === null) {
          chrome.storage.local.set({ selectedRocketIcon: '{"id": "RI_default", "link": "assets/icons/RocketIcons/default_128px.png"}' })
        }
      })
      // check if hisqisPimpedTable
      chrome.storage.local.get(['hisqisPimpedTable'], (result) => {
        if (result.hisqisPimpedTable === undefined || result.hisqisPimpedTable === null) {
          chrome.storage.local.set({ hisqisPimpedTable: true })
        }
      })
      // if easteregg was discovered in an earlier version: enable and select specific rocket!
      chrome.storage.local.get(['Rocket', 'foundEasteregg', 'saved_click_counter', 'availableRockets'], (result) => {
        const avRockets = result.availableRockets
        if (result.saved_click_counter > 250 && !avRockets.includes('RI4')) avRockets.push('RI4')
        if (result.saved_click_counter > 2500 && !avRockets.includes('RI5')) avRockets.push('RI5')
        if (result.Rocket === 'colorful' && result.foundEasteregg === undefined) {
          chrome.storage.local.set({ foundEasteregg: true })
          chrome.storage.local.set({ selectedRocketIcon: '{"id": "RI3", "link": "assets/icons/RocketIcons/3_120px.png"}' })
          avRockets.push('RI3')
          chrome.browserAction.setIcon({
            path: 'assets/icons/RocketIcons/3_120px.png'
          })
        }
        chrome.storage.local.set({ availableRockets: avRockets })
      })
      // seen customized studiengang
      chrome.storage.local.get(['updateCustomizeStudiengang'], (result) => {
        if (result.updateCustomizeStudiengang === undefined || result.updateCustomizeStudiengang === null) {
          chrome.storage.local.set({ updateCustomizeStudiengang: false })
        }
      })
      // selected studiengang
      chrome.storage.local.get(['studiengang'], (result) => {
        if (result.studiengang === undefined || result.studiengang === null) {
          chrome.storage.local.set({ studiengang: 'general' })
        }
      })
      // selected theme
      chrome.storage.local.get(['theme'], (res) => {
        if (res.theme === undefined || res.theme === null) {
          chrome.storage.local.set({ theme: 'system' })
        }
      })
      // if not yet invite shown: show, and set shown to true
      // chrome.storage.local.get(['TUfastCampInvite1'], (res) => {
      //   const today = new Date()
      //   const max_invite_date = new Date(2021, 8, 30) // 27.09.2021; month is zero based
      //   if (!res.TUfastCampInvite1 === true && today < max_invite_date) {
      //     chrome.storage.local.set({ TUfastCampInvite1: true })
      //     chrome.tabs.create(({ url: 'TUfastCamp.html' }))
      //   }
      // })

      break
    default:
      console.log('Other install events within the browser for TUfast.')
      break
  }
})

// checks, if user currently uses owa in browser
async function owaIsOpened () {
  const uri = 'msx.tu-dresden.de'
  const tabs = await getAllChromeTabs()
  // Find element with msx in uri, -1 if none found
  if (tabs.findIndex((element) => element.url.includes(uri)) >= 0) {
    console.log('currentyl opened owa')
    return true
  } else return false
}

function getAllChromeTabs () {
  // Promisified until usage of Manifest V3
  return new Promise((resolve) => chrome.tabs.query({}, (tabs) => resolve(tabs)))
}

// check if user stored login data
// eslint-disable-next-line no-unused-vars
async function loginDataExists () {
  const { asdf, fdsa } = await getUserData()
  return asdf !== undefined && fdsa !== undefined
}

// start OWA fetch funtion based on interval
async function enableOWAFetch () {
  // first, clear all alarms
  console.log('starting to fetch from owa...')
  await owaFetch()
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.alarms.clear('fetchOWAAlarm', resolve))
  chrome.alarms.create('fetchOWAAlarm', { delayInMinutes: 1, periodInMinutes: 5 })
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm === 'fetchOWAAlarm') await owaFetch()
  })
}

async function owaFetch () {
  // dont logout if user is currently using owa in browser
  const logout = !(await owaIsOpened())
  console.log('executing fetch ...')

  // get user data
  const { asdf, fdsa } = await getUserData()
  // call fetch
  const mailInfoJson = await fetchOWA(asdf, fdsa, logout)
  // check # of unread mails
  const numberUnreadMails = countUnreadMsg(mailInfoJson)
  console.log('Unread mails in OWA: ' + numberUnreadMails)

  // alert on new Mail
  // Promisified until usage of Manifest V3
  const result = await new Promise((resolve) => chrome.storage.local.get(['NumberOfUnreadMails', 'additionalNotificationOnNewMail'], (result) => resolve(result)))
  if (!(result.NumberOfUnreadMails === undefined || result.NumberOfUnreadMails === 'undefined') && result.additionalNotificationOnNewMail) {
    if (result.NumberOfUnreadMails < numberUnreadMails) {
      if (confirm("Neue Mail in deinem TU Dresden Postfach!\nDruecke 'Ok' um OWA zu oeffnen.")) {
        const url = 'https://msx.tu-dresden.de/owa/auth/logon.aspx?url=https%3a%2f%2fmsx.tu-dresden.de%2fowa&reason=0'
        chrome.tabs.create({ url })
      }
    }
  }

  // set badge and local storage
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({ NumberOfUnreadMails: numberUnreadMails }, resolve))
  await setBadgeUnreadMails(numberUnreadMails)
}

async function disableOwaFetch () {
  console.log('stopped owa connection')
  await setBadgeUnreadMails(0)
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({ NumberOfUnreadMails: 'undefined' }, resolve))
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.alarms.clear('fetchOWAAlarm', resolve))
}

async function readMailOWA (NrUnreadMails) {
  // set badge and local storage
  chrome.storage.local.set({ NumberOfUnreadMails: NrUnreadMails })
  await setBadgeUnreadMails(NrUnreadMails)
}

async function setBadgeUnreadMails (numberUnreadMails) {
  // set badge
  if (numberUnreadMails === 0) {
    await showBadge('', '#4cb749')
  } else if (numberUnreadMails > 99) {
    await showBadge('99+', '#4cb749')
  } else {
    await showBadge(numberUnreadMails.toString(), '#4cb749')
  }
}

// show badge when extension is triggered
chrome.runtime.onMessage.addListener(async (request, _sender, sendResponse) => {
  switch (request.cmd) {
    case 'show_ok_badge':
      // show_badge('Login', '#4cb749', request.timeout)
      break
    case 'no_login_data':
      // alert("Bitte gib deinen Nutzernamen und Passwort in der TUfast Erweiterung an! Klicke dafür auf das Erweiterungssymbol oben rechts.")
      // show_badge("Error", '#ff0000', 10000)
      break
    case 'perform_login':
      break
    case 'clear_badge':
      // show_badge("", "#ffffff", 0)
      break
    case 'save_clicks':
      await saveClicks(request.click_count)
      break
    case 'get_user_data':
      sendResponse(await getUserData())
      break
    case 'set_user_data':
      await setUserData(request.userData)
      break
    case 'read_mail_owa':
      await readMailOWA(request.NrUnreadMails)
      break
    case 'logged_out':
      await loggedOut(request.portal)
      break
    case 'enable_owa_fetch':
      await enableOWAFetch()
      break
    case 'disable_owa_fetch':
      await disableOwaFetch()
      break
    case 'reload_extension':
      chrome.runtime.reload()
      break
    case 'save_courses':
      await saveCourses(request.course_list)
      break
    case 'open_settings_page':
      await openSettingsPage(request.params)
      break
    case 'open_share_page':
      openSharePage()
      break
    case 'open_shortcut_settings':
      if (isFirefox) { chrome.tabs.create({ url: 'https://support.mozilla.org/de/kb/tastenkombinationen-fur-erweiterungen-verwalten' }) } else { chrome.tabs.create({ url: 'chrome://extensions/shortcuts' }) } // for chrome and everything else
      break
    case 'toggle_pdf_inline_setting':
      enableHeaderListener(request.enabled)
      break
    case 'update_rocket_logo_easteregg':
      chrome.browserAction.setIcon({
        path: 'assets/icons/RocketIcons/3_120px.png'
      })
      break
    default:
      console.log('Cmd not found!')
      break
  }
  return true // required for async sendResponse
})

// register hotkeys
chrome.commands.onCommand.addListener(async (command) => {
  console.log('Detected command: ' + command)
  switch (command) {
    case 'open_opal_hotkey':
      chrome.tabs.update({ url: 'https://bildungsportal.sachsen.de/opal/home/' })
      await saveClicks(2)
      break
    case 'open_owa_hotkey':
      chrome.tabs.update({ url: 'https://msx.tu-dresden.de/owa/' })
      await saveClicks(2)
      break
    case 'open_jexam_hotkey':
      chrome.tabs.update({ url: 'https://jexam.inf.tu-dresden.de/' })
      await saveClicks(2)
      break
  }
})

/**
 * enable or disable the header listener
 * modify http header from opal, to view pdf in browser without the need to download it
 * @param {true} enabled flag to enable/ disable listener
 */
function enableHeaderListener (enabled) {
  if (enabled) {
    chrome.webRequest.onHeadersReceived.addListener(
      headerListenerFunc,
      {
        urls: [
          'https://bildungsportal.sachsen.de/opal/downloadering*',
          'https://bildungsportal.sachsen.de/opal/*.pdf'
        ]
      },
      ['blocking', 'responseHeaders']
    )
  } else {
    chrome.webRequest.onHeadersReceived.removeListener(headerListenerFunc)
  }
}

function headerListenerFunc (details) {
  const header = details.responseHeaders.find(
    e => e.name.toLowerCase() === 'content-disposition'
  )
  if (!header?.value.includes('.pdf')) return // only for pdf
  header.value = 'inline'
  return { responseHeaders: details.responseHeaders }
}

// open settings (=options) page, if required set params
async function openSettingsPage (params) {
  if (params) {
    // Promisified until usage of Manifest V3
    await new Promise((resolve) => chrome.storage.local.set({ openSettingsPageParam: params }, resolve))
    chrome.runtime.openOptionsPage()
  } else {
    chrome.runtime.openOptionsPage()
  }
}

function openSharePage () {
  chrome.tabs.create(({ url: 'share.html' }))
}

// timeout is 2000 default
async function loggedOut (portal) {
  const timeout = portal === 'loggedOutCloudstore' ? 7000 : 2000
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({ [portal]: true }, resolve))
  setTimeout(async () => {
    // Promisified until usage of Manifest V3
    await new Promise((resolve) => chrome.storage.local.set({ [portal]: false }, resolve))
  }, timeout)
}

// show badge
async function showBadge (text, color, _timeout) {
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.browserAction.setBadgeText({ text }, resolve))
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.browserAction.setBadgeBackgroundColor({ color }, resolve))
  // setTimeout(() => {
  //  chrome.browserAction.setBadgeText({text: ""});
  // }, timeout);
}

// save_click_counter
async function saveClicks (counter) {
  // await new Promise((resolve) => {
  // load number of saved clicks and add counter!
  let savedClicks = 0
  // Promisified until usage of Manifest V3
  const result = await new Promise((resolve) => chrome.storage.local.get(['saved_click_counter'], (result) => resolve(result)))
  savedClicks = (result.saved_click_counter === undefined) ? 0 : result.saved_click_counter
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({ saved_click_counter: savedClicks + counter }, () => {
    console.log('You just saved yourself ' + counter + ' clicks!')
    resolve()
  }))
  // make rocketIcons available if appropriate
  // Promisified until usage of Manifest V3
  const resp = await new Promise((resolve) => chrome.storage.local.get(['availableRockets'], (resp) => resolve(resp)))
  const avRockets = resp.availableRockets
  if (result.saved_click_counter > 250 && !avRockets.includes('RI4')) avRockets.push('RI4')
  if (result.saved_click_counter > 2500 && !avRockets.includes('RI5')) avRockets.push('RI5')
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({ availableRockets: avRockets }, resolve))
}

/// ///////////// FUNCTIONS FOR ENCRYPTION AND USERDATA HANDLING ////////////////
// info: asdf = username | fdsa = password

// create hash from input-string (can also be json of course)
// output hash is always of same length and is of type buffer
async function hashDigest (string) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', TextEncoder().encode(string))
  return hashBuffer
}

// get key for encryption (format: buffer)
async function getKeyBuffer () {
  // async fetch of system information
  // Promisified until usage of Manifest V3
  const sysInfo = await new Promise((resolve) => {
    let sysInfo = ''

    // key differs between browsers, because different APIs
    if (isFirefox) {
      sysInfo += window.navigator.hardwareConcurrency
      chrome.runtime.getPlatformInfo((info) => {
        sysInfo += JSON.stringify(info)
        resolve(sysInfo)
      })
    } else {
      // chrome, edge and everything else
      chrome.system.cpu.getInfo((info) => {
        delete info.processors
        delete info.temperatures
        sysInfo += JSON.stringify(info)
        chrome.runtime.getPlatformInfo((info) => {
          sysInfo += JSON.stringify(info)
          resolve(sysInfo)
        })
      })
    }
  })

  // create key
  const keyBuffer = await crypto.subtle.importKey('raw', await hashDigest(sysInfo),
    { name: 'AES-CBC' },
    false,
    ['encrypt', 'decrypt'])
  return keyBuffer
}

// this functions saved user login-data locally.
// user data is encrypted using the crpyto-js library (aes-cbc). The encryption key is created from pc-information with system.cpu
// a lot of encoding and transforming needs to be done, in order to provide all values in the right format.
async function setUserData (userData) {
  // collect all required information for encryption in the right format
  const userDataConcat = userData.asdf + '@@@@@' + userData.fdsa
  const userDataEncoded = TextEncoder().encode(userDataConcat)
  const keyBuffer = await getKeyBuffer()
  let iv = crypto.getRandomValues(new Uint8Array(16))

  // encrypt
  let userDataEncrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-CBC',
      iv: iv
    },
    keyBuffer,
    userDataEncoded
  )

  // adjust format to save encrypted data in lokal storage
  userDataEncrypted = Array.from(new Uint8Array(userDataEncrypted))
  userDataEncrypted = userDataEncrypted.map(byte => String.fromCharCode(byte)).join('')
  userDataEncrypted = btoa(userDataEncrypted)
  iv = Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join('')
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({ Data: iv + userDataEncrypted }, resolve))
}

// check if username, password exist
async function userDataExists () {
  const { asdf, fdsa } = await getUserData()
  return asdf !== undefined && fdsa !== undefined
}

// return {asdf: "", fdsa: ""}
// decrypt and return user data
// a lot of encoding and transforming needs to be done, in order to provide all values in the right format
async function getUserData () {
  // get required data for decryption
  const keyBuffer = await getKeyBuffer()
  // asnyc fetch of user data
  // Promisified until usage of Manifest V3
  const data = await new Promise((resolve) => chrome.storage.local.get(['Data'], (data) => resolve(data.Data)))

  // check if Data exists, else return
  if (data === undefined || data === 'undefined' || data === null) {
    return ({ asdf: undefined, fdsa: undefined })
  }
  let iv = data.slice(0, 32).match(/.{2}/g).map(byte => parseInt(byte, 16))
  iv = new Uint8Array(iv)
  let userDataEncrypted = atob(data.slice(32))
  userDataEncrypted = new Uint8Array(userDataEncrypted.match(/[\s\S]/g).map(ch => ch.charCodeAt(0)))

  // decrypt
  let userData = await crypto.subtle.decrypt(
    {
      name: 'AES-CBC',
      iv: iv
    },
    keyBuffer,
    userDataEncrypted
  )

  // adjust to useable format
  userData = new TextDecoder().decode(userData)
  userData = userData.split('@@@@@')
  return ({ asdf: userData[0], fdsa: userData[1] })
}

/// ///////////// END FUNCTIONS FOR ENCRYPTION AND USERDATA HANDLING ////////////////

// save parsed courses
// course_list = {type:"", list:[{link:link, name: name}, ...]}
async function saveCourses (courseList) {
  courseList.list.sort((a, b) => (a.name > b.name) ? 1 : -1)
  switch (courseList.type) {
    case 'favoriten':
      // Promisified until usage of Manifest V3
      await new Promise((resolve) => chrome.storage.local.set({ favoriten: JSON.stringify(courseList.list) }, resolve))
      console.log('saved Favoriten in TUfast')
      break
    case 'meine_kurse':
      // Promisified until usage of Manifest V3
      await new Promise((resolve) => chrome.storage.local.set({ meine_kurse: JSON.stringify(courseList.list) }, resolve))
      console.log('saved Meine Kurse in TUfast')
      break
  }
}

// get parsed courses
// return course_list = [{link:link, name: name}, ...]
// function loadCourses (type) {
//   switch (type) {
//     case 'favoriten':
//       chrome.storage.local.get(['favoriten'], (result) => {
//         console.log(JSON.parse(result.favoriten))
//       })
//       break
//     case 'meine_kurse':
//       chrome.storage.local.get(['meine_kurse'], (result) => {
//         console.log(JSON.parse(result.meine_kurse))
//       })
//       break
//     default:
//       break
//   }
// }

// function for custom URIEncoding
function customURIEncoding (string) {
  string = encodeURIComponent(string)
  string = string.replace('!', '%21').replace("'", '%27').replace('(', '%28').replace(')', '%29').replace('~', '%7E')
  return string
}

// function to log msx.tu-dresden.de/owa/ and retrieve the .json containing information about EMails
async function fetchOWA (username, password, logout) {
  // encodeURIComponent and encodeURI are not working for all chars. See documentation. Thats why I implemented custom encoding.
  username = customURIEncoding(username)
  password = customURIEncoding(password)

  // login
  await fetch('https://msx.tu-dresden.de/owa/auth.owa', {
    headers: {
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'accept-language': 'de-DE,de;q=0.9,en-DE;q=0.8,en-GB;q=0.7,en-US;q=0.6,en;q=0.5',
      'cache-control': 'max-age=0',
      'content-type': 'application/x-www-form-urlencoded',
      'Access-Control-Allow-Origin': '*',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1'
    },
    referrer: 'https://msx.tu-dresden.de/owa/auth/logon.aspx?replaceCurrent=1&url=https%3a%2f%2fmsx.tu-dresden.de%2fowa%2f%23authRedirect%3dtrue',
    referrerPolicy: 'strict-origin-when-cross-origin',
    'Access-Control-Allow-Origin': '*',
    body: 'destination=https%3A%2F%2Fmsx.tu-dresden.de%2Fowa%2F%23authRedirect%3Dtrue&flags=4&forcedownlevel=0&username=' + username + '%40msx.tu-dresden.de&password=' + password + '&passwordText=&isUtf8=1',
    method: 'POST',
    mode: 'no-cors',
    credentials: 'include'
  })

  const owaResp = await fetch('https://msx.tu-dresden.de/owa/', {
    headers: {
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'accept-language': 'de-DE,de;q=0.9,en-DE;q=0.8,en-GB;q=0.7,en-US;q=0.6,en;q=0.5',
      'cache-control': 'max-age=0',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'Access-Control-Allow-Origin': '*',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1'
    },
    referrer: 'https://msx.tu-dresden.de/owa/auth/logon.aspx?replaceCurrent=1&url=https%3a%2f%2fmsx.tu-dresden.de%2fowa',
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: null,
    method: 'GET',
    'Access-Control-Allow-Origin': '*',
    mode: 'cors',
    credentials: 'include'
  })

  const respText = await owaResp.text()
  const tmp = respText.split("window.clientId = '")[1]
  const clientId = tmp.split("'")[0]
  const corrId = clientId + '_' + (new Date()).getTime()
  console.log('corrID: ' + corrId)

  const mailInfoRsp = await fetch('https://msx.tu-dresden.de/owa/sessiondata.ashx?appcacheclient=0', {
    headers: {
      accept: '*/*',
      'accept-language': 'de-DE,de;q=0.9,en-DE;q=0.8,en-GB;q=0.7,en-US;q=0.6,en;q=0.5',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'Access-Control-Allow-Origin': '*',
      'sec-fetch-site': 'same-origin',
      'x-owa-correlationid': corrId,
      'x-owa-smimeinstalled': '1'
    },
    referrer: 'https://msx.tu-dresden.de/owa/',
    referrerPolicy: 'strict-origin-when-cross-origin',
    'Access-Control-Allow-Origin': '*',
    body: null,
    method: 'POST',
    mode: 'cors',
    credentials: 'include'
  })

  const mailInfoJson = await mailInfoRsp.json()

  // only logout, if user is not using owa in browser session
  if (logout) {
    console.log('Logging out from owa..')
    await fetch('https://msx.tu-dresden.de/owa/logoff.owa', {
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-language': 'de-DE,de;q=0.9,en-DE;q=0.8,en-GB;q=0.7,en-US;q=0.6,en;q=0.5',
        'sec-fetch-dest': 'document',
        'Access-Control-Allow-Origin': '*',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1'
      },
      referrer: 'https://msx.tu-dresden.de/owa/',
      referrerPolicy: 'strict-origin-when-cross-origin',
      'Access-Control-Allow-Origin': '*',
      body: null,
      method: 'GET',
      mode: 'cors',
      credentials: 'include'
    })
  }

  return mailInfoJson
}

// extract number of unread messages in owa
function countUnreadMsg (json) {
  const folder = json.findFolders.Body.ResponseMessages.Items[0].RootFolder.Folders.find(obj => obj.DisplayName === 'Inbox' || obj.DisplayName === 'Posteingang')
  return folder.UnreadCount
}
