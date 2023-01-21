'use strict'
import * as credentials from './modules/credentials'
import * as owaFetch from './modules/owaFetch'
import * as opalInline from './modules/opalInline'
import rockets from './freshContent/rockets.json'

// eslint-disable-next-line no-unused-vars
const isFirefox = !!(typeof globalThis.browser !== 'undefined' && globalThis.browser.runtime && globalThis.browser.runtime.getBrowserInfo)

// On installed/updated function
chrome.runtime.onInstalled.addListener(async (details) => {
  const reason = details.reason
  switch (reason) {
    case 'install':
      console.log('TUfast installed')
      await chrome.storage.local.set({
        dashboardDisplay: 'favoriten',
        fwdEnabled: true,
        encryptionLevel: 3,
        availableRockets: ['default'],
        selectedRocketIcon: JSON.stringify(rockets.default),
        theme: 'system',
        studiengang: 'general',
        hisqisPimpedTable: true
      })
      await openSettingsPage('first_visit')
      break
    case 'update': {
      const currentSettings = await chrome.storage.local.get([
        'dashboardDisplay',
        'fwdEnabled',
        'encryptionLevel',
        'encryption_level', // legacy
        'availableRockets',
        'selectedRocketIcon',
        'theme',
        'studiengang',
        'hisqisPimpedTable',
        'savedClickCounter',
        'saved_click_counter', // legacy
        'Rocket', // legacy
        'foundEasteregg',
        'bannersShown', // new banners
        // Old opal banners
        'showedUnreadMailCounterBanner',
        'removedUnlockRocketsBanner',
        'showedOpalCustomizeBanner',
        'removedReviewBanner',
        'showedKeyboardBanner2',
        'pdfInInline'
      ])

      const updateObj: any = {}

      // Setting the defaults if keys do not exist
      if (typeof currentSettings.dashboardDisplay === 'undefined') updateObj.dashboardDisplay = 'favoriten'
      if (typeof currentSettings.fwdEnabled === 'undefined') updateObj.fwdEnabled = true
      if (typeof currentSettings.hisqisPimpedTable === 'undefined') updateObj.hisqisPimpedTable = true
      if (typeof currentSettings.theme === 'undefined') updateObj.theme = 'system'
      if (typeof currentSettings.studiengang === 'undefined') updateObj.studiengang = 'general'
      if (typeof currentSettings.selectedRocketIcon === 'undefined') updateObj.selectedRocketIcon = JSON.stringify(rockets.default)

      // Upgrading encryption
      // Currently "encryptionLevel" can't be lower than 3, but "encryption_level" can
      if (currentSettings.encryption_level !== 3) {
        switch (currentSettings.encryption_level) {
          case 1: {
            // This branch probably/hopefully will not be called anymore...
            console.log('Upgrading encryption standard from level 1 to level 3...')
            const userData = await chrome.storage.local.get(['asdf', 'fdsa'])
            await credentials.setUserData({ user: atob(userData.asdf), pass: atob(userData.fdsa) }, 'zih')
            await chrome.storage.local.remove(['asdf', 'fdsa'])
            break
          }
          case 2: {
            const { user, pass } = await credentials.getUserDataLagacy()
            await credentials.setUserData({ user, pass }, 'zih')
            // Delete old user data
            await chrome.storage.local.remove(['Data'])
            break
          }
        }
        updateObj.encryptionLevel = 3
        await chrome.storage.local.remove(['encryption_level'])
      }

      // Upgrading saved_clicks_counter to savedClicksCounter
      const savedClicks = currentSettings.savedClickCounter || currentSettings.saved_click_counter
      if (typeof currentSettings.savedClickCounter === 'undefined' && typeof currentSettings.saved_click_counter !== 'undefined') {
        updateObj.savedClickCounter = savedClicks
        await chrome.storage.local.remove(['saved_click_counter'])
      }

      // Upgrading availableRockets
      let avRockets: string[] = currentSettings.availableRockets || ['default']
      // Renaming the rockets
      avRockets = avRockets.map(rocket => {
        switch (rocket) {
          case 'RI_default': return 'default'
          case 'RI1': return 'whatsapp'
          case 'RI2': return 'email'
          case 'RI3': return 'easteregg'
          case 'RI4': return '250clicks'
          case 'RI5': return '2500clicks'
          case 'RI6': return 'webstore'
          default: return rocket
        }
      })
      // Making things unique
      avRockets = avRockets.filter((value, index, array) => array.indexOf(value) === index)

      if (savedClicks >= 250 && !avRockets.includes('250clicks')) avRockets.push('250clicks')
      if (savedClicks >= 2500 && !avRockets.includes('2500clicks')) avRockets.push('2500clicks')
      if (currentSettings.Rocket === 'colorful') {
        if (!currentSettings.foundEasteregg) updateObj.foundEasteregg = true

        if (!avRockets.includes('easteregg')) avRockets.push('easteregg')
        updateObj.selectedRocketIcon = JSON.stringify(rockets.easteregg)
        await chrome.action.setIcon({ path: rockets.easteregg.iconPathUnlocked })
        await chrome.storage.local.remove(['Rocket'])
      }
      updateObj.availableRockets = avRockets

      // Migrating which opal banners where already shown
      const bannersShown: string[] = currentSettings.bannersShown || []
      if (currentSettings.showedUnreadMailCounterBanner && !bannersShown.includes('mailCount')) bannersShown.push('mailCount')
      if (currentSettings.removedUnlockRocketsBanner && !bannersShown.includes('customizeRockets')) bannersShown.push('customizeRockets')
      if (currentSettings.showedOpalCustomizeBanner && !bannersShown.includes('customizeOpal')) bannersShown.push('customizeOpal')
      if (currentSettings.removedReviewBanner && !bannersShown.includes('submitReview')) bannersShown.push('submitReview')
      if (currentSettings.showedKeyboardBanner2 && !bannersShown.includes('keyboardShortcuts')) bannersShown.push('keyboardShortcuts')
      updateObj.bannersShown = bannersShown

      // Write back to storage
      await chrome.storage.local.set(updateObj)
      break
    }
  }
})

// register hotkeys
chrome.commands.onCommand.addListener(async (command) => {
  console.log('Detected command: ' + command)
  switch (command) {
    case 'open_opal_hotkey':
      await chrome.tabs.update({ url: 'https://bildungsportal.sachsen.de/opal/home/' })
      await saveClicks(2)
      break
    case 'open_owa_hotkey':
      await chrome.tabs.update({ url: 'https://msx.tu-dresden.de/owa/' })
      await saveClicks(2)
      break
    case 'open_jexam_hotkey':
      await chrome.tabs.update({ url: 'https://jexam.inf.tu-dresden.de/' })
      await saveClicks(2)
      break
  }
})

// Set icon on startup
chrome.storage.local.get(['selectedRocketIcon'], async (resp) => {
  try {
    const r = JSON.parse(resp.selectedRocketIcon)
    if (!r.iconPathUnlocked) console.warn('Rocket icon has no attribute "iconPathUnlocked", fallback to default icon.')
    await chrome.action.setIcon({ path: r.iconPathUnlocked || rockets.default.iconPathUnlocked })
  } catch (e) {
    console.log(`Cannot parse rocket icon: ${JSON.stringify(resp.selectedRocketIcon)}`)
    await chrome.action.setIcon({ path: rockets.default.iconPathUnlocked })
  }
})

// start fetchOWA if activated and user data exists
chrome.storage.local.get(['enabledOWAFetch', 'numberOfUnreadMails', 'additionalNotificationOnNewMail'], async (result: any) => {
  if (await credentials.userDataExists('zih') && result.enabledOWAFetch) {
    await owaFetch.enableOWAAlarm()
  }

  // When no notifications are enabled, there is nothing to do anymore
  if (!result.additionalNotificationOnNewMail) return
  // Chrome types seem to be deprecated, see https://developer.chrome.com/docs/extensions/reference/permissions/#method-contains
  // Casting so no error is shown
  const notificationAccess: boolean = await (chrome.permissions as any).contains({ permissions: ['notifications'] }) as boolean
  if (notificationAccess) owaFetch.registerNotificationClickListener()
})

// Register header listener
chrome.storage.local.get(['pdfInInline'], async (result) => {
  if (result.pdfInInline) {
    await opalInline.enableOpalHeaderListener()
  }
})

// reset banner for gOPAL on 20. 10.
const d = new Date(new Date().getFullYear(), 10, 20)
if (d.getTime() - Date.now() < 0) d.setFullYear(d.getFullYear() + 1)
chrome.alarms.create('resetGOpalBanner', { when: d.getTime() })
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'resetGOpalBanner') {
    await chrome.storage.local.set({ closedMsg1: false })
  }
})

// DOESNT WORK IN RELEASE VERSION
chrome.storage.local.get(['openSettingsOnReload'], async (resp) => {
  if (resp.openSettingsOnReload) await openSettingsPage()
  await chrome.storage.local.set({ openSettingsOnReload: false })
})

// command listener
// This listener can send async responses. If this is desired it must return true.
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  switch (request.cmd) {
    case 'save_clicks':
      // The first one is legacy and should not be used anymore
      saveClicks(request.click_count || request.clickCount)
      break
    /*********************
     * Settings commands *
     *********************/
    /* User data */
    case 'get_user_data':
      // Asynchronous response
      credentials.getUserData(request.platform || 'zih').then(sendResponse)
      return true // required for async sendResponse
    case 'set_user_data':
      // Asynchronous response
      credentials.setUserData(request.userData, request.platform || 'zih').then(() => sendResponse(true))
      return true // required for async sendResponse
    case 'check_user_data':
      // Asynchronous response
      credentials.userDataExists(request.platform).then(sendResponse)
      return true // required for async sendResponse
    case 'delete_user_data':
      // Asynchronous response
      credentials.deleteUserData(request.platform).then(sendResponse) // Response can probably be ignored
      return true // required for async sendResponse
    /* OWA */
    case 'enable_owa_fetch':
      owaFetch.enableOWAFetch().then(sendResponse)
      return true // required for async sendResponse
    case 'disable_owa_fetch':
      owaFetch.disableOWAFetch().then(sendResponse)
      return true
    case 'enable_owa_notification':
      owaFetch.enableOWANotifications().then(() => sendResponse(true))
      return true // required for async sendResponse
    case 'disable_owa_notification':
      owaFetch.disableOWANotifications().then(() => sendResponse(true))
      return true
    case 'check_owa_status':
      owaFetch.checkOWAStatus().then(sendResponse)
      return true // required for async sendResponse
    /* Opal PDF */
    case 'enable_opalpdf_inline':
      opalInline.enableOpalInline().then(sendResponse)
      return true // required for async sendResponse
    case 'disable_opalpdf_inline':
      opalInline.disableOpalInline().then(() => sendResponse(true))
      return true
    case 'enable_opalpdf_newtab':
      opalInline.enableOpalFileNewTab().then(sendResponse)
      return true // required for async sendResponse
    case 'disable_opalpdf_newtab':
      opalInline.disableOpalFileNewTab().then(() => sendResponse(true))
      return true
    case 'check_opalpdf_status':
      opalInline.checkOpalFileStatus().then(sendResponse)
      return true // required for async sendResponse
    /* SE Redirects */
    case 'enable_se_redirect':
      chrome.storage.local.set({ fwdEnabled: true }, () => sendResponse(true))
      return true
    case 'disable_se_redirect':
      chrome.storage.local.set({ fwdEnabled: false }, () => sendResponse(true))
      return true
    case 'check_se_status':
      chrome.storage.local.get(['fwdEnabled'], (result) => sendResponse({ redirect: result.fwdEnabled }))
      return true
    /* Rocket functions */
    case 'set_rocket_icon':
      setRocketIcon(request.rocketId || 'default').then(() => sendResponse(true))
      return true
    case 'unlock_rocket_icon':
      unlockRocketIcon(request.rocketId || 'default').then(() => sendResponse(true))
      return true
    case 'check_rocket_status':
      chrome.storage.local.get(['selectedRocketIcon', 'availableRockets'], (result) => sendResponse({ selected: result.selectedRocketIcon, available: result.availableRockets }))
      return true
    /* End of settings function */
    // Command for OWA MutationObserver when site is opened
    case 'read_mail_owa':
      owaFetch.readMailOWA(request.nrOfUnreadMail || 0)
      break
    case 'reload_extension':
      chrome.runtime.reload()
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
    case 'update_rocket_logo_easteregg':
      chrome.action.setIcon({ path: 'assets/icons/RocketIcons/3_120px.png' })
      break
    case 'logout_idp':
      logoutIdp(request.logoutDuration)
      break
    case 'easteregg_found':
      eastereggFound()
      break
    default:
      console.log(`Cmd not found "${request.cmd}"!`)
      break
  }
  return false // no async sendResponse will be fired
})

// open settings (=options) page, if required set params
async function openSettingsPage (params?: string) {
  if (params) {
    await chrome.storage.local.set({ openSettingsPageParam: params })
  }
  await chrome.runtime.openOptionsPage()
}

async function openSharePage () {
  await chrome.tabs.create({ url: 'share.html' })
}

// save_click_counter
async function saveClicks (counter: number) {
  // load number of saved clicks and add counter!
  const result = await chrome.storage.local.get(['savedClickCounter'])
  const savedClickCounter = (typeof result.savedClickCounter === 'undefined') ? counter : result.savedClickCounter + counter
  await chrome.storage.local.set({ savedClickCounter })
  console.log('Saved ' + counter + ' clicks!')
  // make rocketIcons available if appropriate
  const { availableRockets } = await chrome.storage.local.get(['availableRockets'])
  if (savedClickCounter >= 250 && !availableRockets.includes('250clicks')) availableRockets.push('250clicks')
  if (savedClickCounter >= 2500 && !availableRockets.includes('2500clicks')) availableRockets.push('2500clicks')
  await chrome.storage.local.set({ availableRockets })
}

// logout function for idp
async function logoutIdp (logoutDuration: number = 5) {
  // Chrome types are wrong, so we need to cast them, see https://developer.chrome.com/docs/extensions/reference/permissions/#method-request
  const granted = await chrome.permissions.request({ permissions: ['cookies'] }) as unknown as boolean
  if (!granted) return

  // Set the logout cookie for idp
  const date = new Date()
  date.setMinutes(date.getMinutes() + logoutDuration)
  await chrome.cookies.set({
    url: 'https://idp.tu-dresden.de',
    name: 'tuFast_idp_loggedOut',
    value: 'true',
    secure: true,
    expirationDate: date.getTime() / 1000
  })

  // Log out
  const { idpLogoutEnabled } = await chrome.storage.local.get(['idpLogoutEnabled'])
  if (!idpLogoutEnabled) return

  // get session cookie
  const sessionCookie = await chrome.cookies.get({
    url: 'https://idp.tu-dresden.de',
    name: 'JSESSIONID'
  })
  if (!sessionCookie) return

  const redirect = await fetch('https://idp.tu-dresden.de/idp/profile/Logout', {
    headers: {
      Cookie: `JSESSIONID=${sessionCookie.value}`
    }
  })
  await fetch(redirect.url, {
    headers: {
      Cookie: `JSESSIONID=${sessionCookie.value}`
    },
    method: 'POST'
  })
}

// Function called when the easteregg is found
async function eastereggFound () {
  await unlockRocketIcon('easteregg')
  await setRocketIcon('easteregg')

  await chrome.storage.local.set({ foundEasteregg: true })
}

async function setRocketIcon (rocketId: string): Promise<void> {
  const rocket = rockets[rocketId] || rockets.default

  await chrome.storage.local.set({ selectedRocketIcon: JSON.stringify(rocket) })
  await chrome.action.setIcon({ path: rocket.iconPathUnlocked })
}

async function unlockRocketIcon (rocketId: string): Promise<void> {
  const { availableRockets } = await chrome.storage.local.get(['availableRockets'])
  if (!availableRockets.includes(rocketId)) availableRockets.push(rocketId)

  const update: any = { availableRockets }
  if (rocketId === 'webstore') update.mostLikelySubmittedReview = true

  await chrome.storage.local.set(update)
}
