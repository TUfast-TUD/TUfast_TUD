'use strict'

// eslint-disable-next-line no-unused-vars
const isChrome = navigator.userAgent.includes('Chrome/') // attention: no failsave browser detection | also for new edge!
const isFirefox = navigator.userAgent.includes('Firefox/') // attention: no failsave browser detection

// start fetchOWA if activated and user data exists
chrome.storage.local.get(['enabledOWAFetch', 'NumberOfUnreadMails'], async (resp) => {
  if (await userDataExists() && resp.enabledOWAFetch) {
    await enableOWAFetch() // start owa fetch
    await setBadgeUnreadMails(resp.NumberOfUnreadMails) // read number of unread mails from storage and display badge
    console.log('Activated OWA fetch.')
  } else console.log('No OWAfetch registered')
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
chrome.storage.local.get(['openSettingsOnReload'], async (resp) => {
  if (resp.openSettingsOnReload) await openSettingsPage()
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({ openSettingsOnReload: false }, resolve))
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
chrome.storage.local.set({
  loggedOutSelma: false,
  loggedOutElearningMED: false,
  loggedOutTumed: false,
  loggedOutQis: false,
  loggedOutOpal: false,
  loggedOutOwa: false,
  loggedOutMagma: false,
  loggedOutJexam: false,
  loggedOutCloudstore: false,
  loggedOutTex: false,
  loggedOutGitlab: false
})
chrome.storage.local.get(['pdfInNewTab'], (result) => {
  if (result.pdfInNewTab) {
    enableHeaderListener(true)
  }
})

chrome.runtime.onInstalled.addListener(async (details) => {
  const reason = details.reason
  switch (reason) {
    case 'install': {
      console.log('TUfast installed.')

      // Promisified until usage of Manifest V3
      await new Promise((resolve) => chrome.storage.local.set({
        installed: true,
        showed_50_clicks: false,
        showed_100_clicks: false,
        isEnabled: false,
        fwdEnabled: true,
        mostLiklySubmittedReview: false,
        removedReviewBanner: false,
        neverShowedReviewBanner: true,
        encryption_level: 2,
        meine_kurse: false,
        favoriten: false,
        // openSettingsPageParam: false
        seenInOpalAfterDashbaordUpdate: 0,
        dashboardDisplay: 'favoriten',
        additionalNotificationOnNewMail: false,
        // NumberOfUnreadMails: 'undefined',
        removedOpalBanner: false,
        nameIsTUfast: true,
        enabledOWAFetch: false,
        colorfulRocket: 'black',
        PRObadge: false,
        flakeState: false,
        availableRockets: ['RI_default'],
        foundEasteregg: false,
        hisqisPimpedTable: true,
        openSettingsOnReload: false,
        selectedRocketIcon: '{"id": "RI_default", "link": "assets/icons/RocketIcons/default_128px.png"}',
        pdfInInline: false,
        pdfInNewTab: false,
        studiengang: 'general',
        updateCustomizeStudiengang: false,
        TUfastCampInvite1: false,
        theme: 'system'
      }, resolve))

      await openSettingsPage('first_visit') // open settings page
      break
    }
    case 'update': {
      // Promisified until usage of Manifest V3
      const settings = await new Promise((resolve) => chrome.storage.local.get([
        'encryption_level',
        'dashboardDisplay',
        'mostLiklySubmittedReview',
        'removedReviewBanner',
        'neverShowedReviewBanner',
        'seenInOpalAfterDashbaordUpdate',
        'enabledOWAFetch',
        'flakeState',
        'showedFirefoxBanner',
        'showedUnreadMailCounterBanner',
        'openSettingsOnReload',
        'availableRockets',
        'selectedRocketIcon',
        'hisqisPimpedTable',
        'Rocket', 'foundEasteregg', 'saved_click_counter', 'availableRockets',
        'updateCustomizeStudiengang',
        'studiengang',
        'theme'
        // TUfastCampInvite1
      ], (resp) => resolve(resp)))

      const updateObj = {}

      // check if encryption is already on level 2. This should be the case for every install now. But I'll leave this here anyway
      if (settings.encryption_level !== 2) {
        console.log('Upgrading encryption standard to level 2...')
        // Promisified until usage of Manifest V3
        const userData = await new Promise((resolve) => chrome.storage.local.get(['asdf', 'fdsa'], (result) => resolve(result)))
        await setUserData({ asdf: atob(userData.asdf), fdsa: atob(userData.fdsa) })

        updateObj.encryption_level = 2
      }

      // check if the type of courses is selected which should be display in the dasbhaord. If not, set to default
      if (!settings.dashboardDisplay) updateObj.dashboardDisplay = 'favoriten'

      // check if mostLiklySubmittedReview
      if (!settings.mostLiklySubmittedReview && typeof settings.neverShowedReviewBanner !== 'boolean') updateObj.mostLiklySubmittedReview = false

      // check if removedReviewBanner
      if (!settings.removedReviewBanner && typeof settings.neverShowedReviewBanner !== 'boolean') updateObj.removedReviewBanner = false

      // check if neverShowedReviewBanner
      if (!settings.neverShowedReviewBanner && typeof settings.neverShowedReviewBanner !== 'boolean') updateObj.neverShowedReviewBanner = true

      // check if seenInOpalAfterDashbaordUpdate exists
      if (!settings.seenInOpalAfterDashbaordUpdate && typeof settings.seenInOpalAfterDashbaordUpdate !== 'number') updateObj.seenInOpalAfterDashbaordUpdate = 0

      // check if enabledOWAFetch exists
      if (!settings.enabledOWAFetch && typeof settings.enabledOWAFetch !== 'boolean') {
        updateObj.enabledOWAFetch = false
        updateObj.NumberOfUnreadMails = undefined
        updateObj.additionalNotificationOnNewMail = false
      }

      // check, whether flake state exists. If not, initialize with false.
      if (!settings.flakeState && typeof settings.flakeState !== 'boolean') updateObj.flakeState = false

      // check if ShowedFirefoxBanner
      if (!settings.showedFirefoxBanner && typeof settings.showedFirefoxBanner !== 'boolean') updateObj.showedFirefoxBanner = false

      // check if showedUnreadMailCounterBanner
      if (!settings.showedUnreadMailCounterBanner && typeof settings.showedUnreadMailCounterBanner !== 'boolean') updateObj.showedUnreadMailCounterBanner = false

      // check if openSettingsOnReload
      if (!settings.openSettingsOnReload && typeof settings.openSettingsOnReload !== 'boolean') updateObj.openSettingsOnReload = false

      // check if availableRockets
      if (!settings.availableRockets) updateObj.availableRockets = ['RI_default']

      // check if selectedRocketIcon
      if (!settings.selectedRocketIcon) updateObj.selectedRocketIcon = '{"id": "RI_default", "link": "assets/icons/RocketIcons/default_128px.png"}'

      // check if hisqisPimpedTable
      if (!settings.hisqisPimpedTable && typeof settings.hisqisPimpedTable !== 'boolean') updateObj.hisqisPimpedTable = true

      // if easteregg was discovered in an earlier version: enable and select specific rocket!
      const avRockets = settings.availableRockets || []
      if (settings.saved_click_counter > 250 && !avRockets.includes('RI4')) avRockets.push('RI4')
      if (settings.saved_click_counter > 2500 && !avRockets.includes('RI5')) avRockets.push('RI5')
      if (settings.Rocket === 'colorful' && settings.foundEasteregg === undefined) {
        updateObj.foundEasteregg = true
        updateObj.selectedRocketIcon = '{"id": "RI3", "link": "assets/icons/RocketIcons/3_120px.png"}'
        avRockets.push('RI3')
        // Promisified until usage of Manifest V3
        await new Promise((resolve) => chrome.browserAction.setIcon({ path: 'assets/icons/RocketIcons/3_120px.png' }, resolve))
      }
      updateObj.availableRockets = avRockets

      // seen customized studiengang
      if (!settings.updateCustomizeStudiengang && typeof settings.updateCustomizeStudiengang !== 'boolean') updateObj.updateCustomizeStudiengang = false

      // selected studiengang
      if (!settings.studiengang) updateObj.studiengang = 'general'

      // selected theme
      if (!settings.theme) updateObj.theme = 'system'

      // if not yet invite shown: show, and set shown to true
      // if(!settings.TUfastCampInvite1) {
      //   const today = new Date()
      //   const max_invite_date = new Date(2021, 8, 30) // 27.09.2021; month is zero based
      //   if (today < max_invite_date) {
      //     updateObj.TUfastCampInvite1 = true
      //     Promisified until usage of Manifest V3
      //     await new Promise((resolve) => chrome.tabs.create({ url: 'TUfastCamp.html' }, resolve))
      //   }
      // }

      // Promisified until usage of Manifest V3
      await new Promise((resolve) => chrome.storage.local.set(updateObj, resolve))
      break
    }
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
  if (!result.NumberOfUnreadMails !== undefined && result.additionalNotificationOnNewMail) {
    if (result.NumberOfUnreadMails < numberUnreadMails) {
      if (confirm("Neue Mail in deinem TU Dresden Postfach!\nDruecke 'Ok' um OWA zu oeffnen.")) {
        const url = 'https://msx.tu-dresden.de/owa/auth/logon.aspx?url=https%3a%2f%2fmsx.tu-dresden.de%2fowa&reason=0'
        // Promisified until usage of Manifest V3
        await new Promise((resolve) => chrome.tabs.create({ url }, resolve))
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
  await new Promise((resolve) => chrome.storage.local.remove(['NumberOfUnreadMails'], resolve))
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.alarms.clear('fetchOWAAlarm', resolve))
}

async function readMailOWA (NrUnreadMails) {
  // set badge and local storage
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({ NumberOfUnreadMails: NrUnreadMails }, resolve))
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
      await openSharePage()
      break
    case 'open_shortcut_settings':
      if (isFirefox) {
        // Promisified until usage of Manifest V3
        await new Promise((resolve) => chrome.tabs.create({ url: 'https://support.mozilla.org/de/kb/tastenkombinationen-fur-erweiterungen-verwalten' }, resolve))
      } else {
        // for chrome and everything else
        // Promisified until usage of Manifest V3
        await new Promise((resolve) => chrome.tabs.create({ url: 'chrome://extensions/shortcuts' }, resolve))
      }
      break
    case 'toggle_pdf_inline_setting':
      enableHeaderListener(request.enabled)
      break
    case 'update_rocket_logo_easteregg':
      // Promisified until usage of Manifest V3
      await new Promise((resolve) => chrome.browserAction.setIcon({ path: 'assets/icons/RocketIcons/3_120px.png' }, resolve))
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
    // Promisified until usage of Manifest V3
    await new Promise((resolve) => chrome.runtime.openOptionsPage(resolve))
  } else {
    // Promisified until usage of Manifest V3
    await new Promise((resolve) => chrome.runtime.openOptionsPage(resolve))
  }
}

async function openSharePage () {
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.tabs.create({ url: 'share.html' }, resolve))
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
  const hashBuffer = await crypto.subtle.digest('SHA-256', (new TextEncoder()).encode(string))
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
  const userDataEncoded = (new TextEncoder()).encode(userDataConcat)
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
  if (data === undefined) {
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
