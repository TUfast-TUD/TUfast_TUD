'use strict'
import * as credentials from "./modules/credentials"
import * as owaFetch from "./modules/owaFetch"

// eslint-disable-next-line no-unused-vars
const isFirefox = typeof browser !== 'undefined' && browser.runtime && browser.runtime.getBrowserInfo

// start fetchOWA if activated and user data exists
chrome.storage.local.get(['enabledOWAFetch', 'numberOfUnreadMails'], async (resp) => {
  if (await credentials.userDataExists() && resp.enabledOWAFetch) {
    await owaFetch.setBadgeUnreadMails(resp.numberOfUnreadMails) // read number of unread mails from storage and display badge
    await owaFetch.enableOWAFetch() // start owa fetch
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
        encryption_level: 3,
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
      const settings = await new Promise<any>((resolve) => chrome.storage.local.get([
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
      ], resolve))

      const updateObj: any = {}

      // check if encryption is already on level 3
      if (settings.encryption_level !== 3) {
        switch (settings.encryption_level) {
          case 1: {
            // This branch probably will not be called anymore...
            console.log('Upgrading encryption standard from level 1 to level 3...')
            // Promisified until usage of Manifest V3
            const userData = await new Promise((resolve) => chrome.storage.local.get(['asdf', 'fdsa'], resolve))
            await credentials.setUserData({ user: atob(userData.asdf), pass: atob(userData.fdsa) }, 'zih')
            break
          }
          case 2: {
            const { asdf: user, fdsa: pass } = await credentials.getUserDataLagacy()
            await credentials.setUserData({ user, pass }, 'zih')
            // Delete old user data
            // Promisified until usage of Manifest V3
            await new Promise((resolve) => chrome.storage.local.remove(['Data'], resolve))
          }
        }
        updateObj.encryption_level = 3
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


// command listener
// this listener behaves weirdly with an async function so it just calls async functions and returns true
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
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
      saveClicks(request.click_count)
      break
    case 'get_user_data': {
      const platform = request.platform || 'zih'
      credentials.getUserData(platform).then(userData => sendResponse(userData))
      break
    }
    case 'set_user_data': {
      const platform = request.platform || 'zih'
      credentials.setUserData(request.userData, platform).then(() => sendResponse(true))
      break
    }
    case 'check_user_data': {
        credentials.userDataExists(request.platform).then(response => sendResponse(response))
      break
    }
    case 'read_mail_owa':
      owaFetch.readMailOWA(request.NrUnreadMails)
      break
    case 'logged_out':
      loggedOut(request.portal)
      break
    case 'disable_owa_fetch':
      owaFetch.disableOwaFetch()
      break
    case 'reload_extension':
      chrome.runtime.reload()
      break
    case 'save_courses':
      saveCourses(request.course_list)
      break
    case 'open_settings_page':
      openSettingsPage(request.params)
      break
    case 'open_share_page':
      openSharePage()
      break
    case 'open_shortcut_settings':
      if (isFirefox) {
        chrome.tabs.create({ url: 'https://support.mozilla.org/de/kb/tastenkombinationen-fur-erweiterungen-verwalten' })
      } else {
        // for chrome and everything else
        chrome.tabs.create({ url: 'chrome://extensions/shortcuts' })
      }
      break
    case 'toggle_pdf_inline_setting':
      enableHeaderListener(request.enabled)
      break
    case 'update_rocket_logo_easteregg':
      chrome.browserAction.setIcon({ path: 'assets/icons/RocketIcons/3_120px.png' })
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

// save_click_counter
async function saveClicks (counter) {
  // await new Promise((resolve) => {
  // load number of saved clicks and add counter!
  let savedClicks = 0
  // Promisified until usage of Manifest V3
  const result = await new Promise((resolve) => chrome.storage.local.get(['saved_click_counter'], resolve))
  savedClicks = (result.saved_click_counter === undefined) ? 0 : result.saved_click_counter
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({ saved_click_counter: savedClicks + counter }, () => {
    console.log('You just saved yourself ' + counter + ' clicks!')
    resolve()
  }))
  // make rocketIcons available if appropriate
  // Promisified until usage of Manifest V3
  const resp = await new Promise((resolve) => chrome.storage.local.get(['availableRockets'], resolve))
  const avRockets = resp.availableRockets
  if (result.saved_click_counter > 250 && !avRockets.includes('RI4')) avRockets.push('RI4')
  if (result.saved_click_counter > 2500 && !avRockets.includes('RI5')) avRockets.push('RI5')
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({ availableRockets: avRockets }, resolve))
}

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
