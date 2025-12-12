'use strict'
import * as credentials from './modules/credentials'
import * as otp from './modules/otp'
import * as owaFetch from './modules/owaFetch'
import * as opalInline from './modules/opalInline'
import { isFirefox } from './modules/firefoxCheck'
import rockets from './freshContent/rockets.json'
import studies from './freshContent/studies.json'

// On installed/updated function
chrome.runtime.onInstalled.addListener(async (details) => {
  const reason = details.reason
  switch (reason) {
    case 'install':
      console.log('TUfast installed')
      await chrome.storage.local.set({
        dashboardDisplay: 'favoriten',
        fwdEnabled: true,
        encryptionLevel: 4,
        availableRockets: ['default'],
        selectedRocketIcon: JSON.stringify(rockets.default),
        theme: 'system',
        studiengang: 'general',
        hisqisPimpedTable: true,
        bannersShown: ['mv3UpdateNotice'],
        improveSelma: true
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
        'improveSelma',
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
        'pdfInInline',
        'pdfInNewTab'
      ])

      const updateObj: any = {}

      // Setting the defaults if keys do not exist
      if (typeof currentSettings.dashboardDisplay === 'undefined') updateObj.dashboardDisplay = 'favoriten'
      if (typeof currentSettings.fwdEnabled === 'undefined') updateObj.fwdEnabled = true
      if (typeof currentSettings.hisqisPimpedTable === 'undefined') updateObj.hisqisPimpedTable = true
      if (typeof currentSettings.improveSelma === 'undefined') updateObj.improveSelma = true
      if (typeof currentSettings.theme === 'undefined') updateObj.theme = 'system'
      if (typeof currentSettings.studiengang === 'undefined') updateObj.studiengang = 'general'
      if (typeof currentSettings.selectedRocketIcon === 'undefined')
        updateObj.selectedRocketIcon = JSON.stringify(rockets.default)

      // Upgrade encryption variable
      if (typeof currentSettings.encryption_level !== 'undefined') {
        updateObj.encryptionLevel = currentSettings.encryptionLevel ?? currentSettings.encryption_level
        currentSettings.encryptionLevel = currentSettings.encryptionLevel ?? currentSettings.encryption_level
        await chrome.storage.local.remove(['encryption_level'])
      }

      // Upgrading encryption
      updateObj.encryptionLevel = await credentials.upgradeUserData(currentSettings.encryptionLevel)

      // Upgrading saved_clicks_counter to savedClicksCounter
      const savedClicks = currentSettings.savedClickCounter || currentSettings.saved_click_counter
      if (
        typeof currentSettings.savedClickCounter === 'undefined' &&
        typeof currentSettings.saved_click_counter !== 'undefined'
      ) {
        updateObj.savedClickCounter = savedClicks
        await chrome.storage.local.remove(['saved_click_counter'])
      }

      // Upgrading availableRockets
      let avRockets: string[] = currentSettings.availableRockets || ['default']
      // Renaming the rockets
      avRockets = avRockets.map((rocket) => {
        switch (rocket) {
          case 'RI_default':
            return 'default'
          case 'RI1':
            return 'whatsapp'
          case 'RI2':
            return 'email'
          case 'RI3':
            return 'easteregg'
          case 'RI4':
            return '250clicks'
          case 'RI5':
            return '2500clicks'
          case 'RI6':
            return 'webstore'
          default:
            return rocket
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
      if (currentSettings.showedUnreadMailCounterBanner && !bannersShown.includes('mailCount'))
        bannersShown.push('mailCount')
      if (currentSettings.removedUnlockRocketsBanner && !bannersShown.includes('customizeRockets'))
        bannersShown.push('customizeRockets')
      if (currentSettings.showedOpalCustomizeBanner && !bannersShown.includes('customizeOpal'))
        bannersShown.push('customizeOpal')
      if (currentSettings.removedReviewBanner && !bannersShown.includes('submitReview'))
        bannersShown.push('submitReview')
      if (currentSettings.showedKeyboardBanner2 && !bannersShown.includes('keyboardShortcuts'))
        bannersShown.push('keyboardShortcuts')
      updateObj.bannersShown = bannersShown

      // Migrating pdf settings
      // If the browser implicitly grants us the permsission, it's fine. Otherwise we disable it.
      if (currentSettings.pdfInInline && !(await opalInline.permissionsGrantedWebRequest())) {
        await opalInline.disableOpalInline()
      }

      // Write back to storage
      await chrome.storage.local.set(updateObj)
      break
    }
  }
})

if (chrome.commands) {
  // register hotkeys - hotkeys now open as a new tab right next to the current tab
  chrome.commands.onCommand.addListener(async (command) => {
    console.log('Detected command: ' + command)

    // Get the current tab to find its index
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true })

    switch (command) {
      case 'open_opal_hotkey':
        await chrome.tabs.create({
          url: 'https://bildungsportal.sachsen.de/opal/home/',
          index: currentTab.index + 1
        })
        await saveClicks(2)
        break
      case 'open_owa_hotkey':
        await chrome.tabs.create({
          url: 'https://msx.tu-dresden.de/owa/',
          index: currentTab.index + 1
        })
        await saveClicks(2)
        break
      case 'open_jexam_hotkey':
        await chrome.tabs.create({
          url: 'https://jexam.inf.tu-dresden.de/',
          index: currentTab.index + 1
        })
        await saveClicks(2)
        break
    }
  })
}

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
chrome.storage.local.get(
  ['enabledOWAFetch', 'numberOfUnreadMails', 'additionalNotificationOnNewMail'],
  async (result: any) => {
    if ((await credentials.userDataExists('zih')) && result.enabledOWAFetch) {
      await owaFetch.enableOWAAlarm()
    }

    // When no notifications are enabled, there is nothing to do anymore
    if (!result.additionalNotificationOnNewMail) return
    // Chrome types seem to be deprecated, see https://developer.chrome.com/docs/extensions/reference/permissions/#method-contains
    // Casting so no error is shown
    const notificationAccess: boolean = (await (chrome.permissions as any).contains({
      permissions: ['notifications']
    })) as boolean
    if (notificationAccess) owaFetch.registerNotificationClickListener()
  }
)

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

// Define the openAllCourses Configuration
type OpenCourseBehavior = 'background_load' | 'immediate_active'

interface OpenCourseConfig {
  behavior: OpenCourseBehavior
}

// command listener
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  switch (request.cmd) {
    case 'save_clicks':
      // The first one is legacy and should not be used anymore
      saveClicks(request.click_count || request.clickCount)
      break
    /********************************
     * Open all courses / favorites *
     ********************************/
    // keep three cases for setting different opening behaviors in function
    case 'open_all_courses':
    case 'openAllCoursesInOpal':
    case 'openAllFavoritesInOpal': {
      // Basic check for required data
      if (!request.courseLinks || !Array.isArray(request.courseLinks)) {
        sendResponse({ success: false, error: 'Missing or invalid courseLinks array.' })
        return false // Return false if no async response is sent (though we handle the response here)
      }

      // 1 - determine the configuration based on the command (cmd)
      let config: OpenCourseConfig

      if (request.cmd === 'open_all_courses') {
        // This is the old 'openAllCoursesInBackground' behavior (for the popup)
        config = { behavior: 'background_load' }
      } else {
        // This covers both 'openAllCoursesInOpal' and 'openAllFavoritesInOpal'
        // which use the old 'openAllCoursesInOpal' behavior (for the Opal page)
        config = { behavior: 'immediate_active' }
      }

      // 2 - call the unified function
      openCourseLinks(request.courseLinks, config)
        .then(() => sendResponse({ success: true }))
        .catch((error) => sendResponse({ success: false, error: error.message || 'Unknown error during tab opening' }))

      // 3 - IMPORTANT: Return true to signal that 'sendResponse' will be called asynchronously
      return true
    }
    // Close All Tabs in Opal
    case 'closeAllTabs':
      saveClicks(request.closedCount)
      sendResponse({ success: true })
      return true
    case 'closeCurrentTab':
      if (_sender.tab?.id) {
        chrome.tabs.remove(_sender.tab.id)
      }
      break
    /*********************
     * Settings commands *
     *********************/
    // Check all settings for indicator on setting tiles
    // Only runs once on mount and when credential-related settings change (userData or otp)
    case 'check_all_settings':
      console.log('check_all_settings case hit!')
      // Asynchronous response
      Promise.all([
        // Login Check (has login data been set? username password)
        credentials.userDataExists(request.platform), // 0
        credentials.userDataExists(request.platform + '-totp'), // 1
        credentials.userDataExists(request.platform + '-iotp'), // 2
        // 3 - Mail (has user activated notifications for OWA Mails?)
        new Promise<boolean>((resolve) => {
          chrome.storage.local.get(['enabledOWAFetch', 'additionalNotificationOnNewMail'], (result) => {
            resolve((result.enabledOWAFetch ?? false) || (result.additionalNotificationOnNewMail ?? false))
          })
        }),
        // 4 - Opal PDF checks (has user activated Opal Open files in Browser?)
        new Promise<boolean>((resolve) => {
          chrome.storage.local.get(['pdfInInline', 'pdfInNewTab'], (result) => {
            resolve((result.pdfInInline ?? false) || (result.pdfInNewTab ?? false))
          })
        }),
        // 5 - Selma (has user activated selma improvements?)
        new Promise<boolean>((resolve) => {
          chrome.storage.local.get(['improveSelma'], (result) => {
            resolve(result.improveSelma ?? false)
          })
        }),
        // 6 - Searchengine (has user activated searchengine commands?)
        new Promise<boolean>((resolve) => {
          chrome.storage.local.get(['fwdEnabled'], (result) => {
            resolve(result.fwdEnabled ?? false)
          })
        }),
        // 7 - Faculty (which faculty has user selected?)
        new Promise<string>((resolve) => {
          chrome.storage.local.get(['studiengang'], (result) => {
            const studiengangId = result.studiengang ?? 'general'
            const faculty = studies[studiengangId]
            if (faculty && faculty.name) {
              resolve(faculty.name)
            } else {
              resolve(studies.general.name)
            }
          })
        }),
        // User data check
        credentials.userDataExists(request.platform)
        // Language (which language has user selected?)
        // missing - will add when language is implemented
      ]).then(
        ([
          loginExists, // 0
          totpExists, // 1
          iotpExists, // 2
          owaStatus, // 3
          opalStatus, // 4
          selmaStatus, // 5
          seCommandsStatus, // 6
          faculty, // 7
          userDataExists // 8
        ]) => {
          sendResponse({
            otp: totpExists || iotpExists,
            owa: owaStatus,
            opalPdf: opalStatus,
            userData: userDataExists || loginExists,
            selma: selmaStatus,
            searchengine: seCommandsStatus,
            faculty: faculty
          })
        }
      )
      return true // required for async sendResponse
    /* User data */
    case 'get_user_data':
      // Asynchronous response
      credentials.getUserData(request.platform || 'zih').then(sendResponse)
      return true // required for async sendResponse
    case 'set_user_data':
      // Asynchronous response
      credentials.setUserData(request.userData, request.platform || 'zih').then(() => {
        sendResponse(true)
        // Trigger credential indicator update
        chrome.runtime.sendMessage({ cmd: 'credentials_updated', platform: request.platform || 'zih' })
      })
      return true

    case 'check_user_data':
      // Asynchronous response
      Promise.all([
        credentials.userDataExists(request.platform),
        credentials.userDataExists(request.platform + '-totp'),
        credentials.userDataExists(request.platform + '-iotp')
      ]).then(([loginExists, totpExists, iotpExists]) => {
        sendResponse(loginExists || totpExists || iotpExists)
      })
      return true // required for async sendResponse
    case 'delete_user_data':
      // Asynchronous response
      credentials.deleteUserData(request.platform).then(() => {
        sendResponse(true)
        // Trigger credential indicator update
        chrome.runtime.sendMessage({ cmd: 'credentials_updated', platform: request.platform })
      })
      return true

    case 'get_totp':
      // Asynchronous response
      otp.getTOTP(request.platform).then(sendResponse)
      return true // required for async sendResponse
    case 'get_iotp':
      // Asynchronous response
      if (!request.indexes) return sendResponse(undefined)
      otp.getIOTP(request.platform, ...request.indexes).then(sendResponse)
      return true // required for async sendResponse
    case 'check_otp': // checking if otp is saved or not
      // Asynchronous response
      Promise.all([
        credentials.userDataExists(request.platform + '-totp'),
        credentials.userDataExists(request.platform + '-iotp')
      ]).then(([totpExists, iotpExists]) => {
        sendResponse(totpExists || iotpExists)
      })
      return true // required for async sendResponse
    case 'set_otp':
      // Asynchronous response
      switch (request.otpType) {
        case 'totp':
          if (!request.secret) return sendResponse(false)
          credentials
            .setUserData({ user: 'totp', pass: request.secret }, (request.platform ?? 'zih') + '-totp')
            .then(() => {
              credentials.deleteUserData((request.platform ?? 'zih') + '-iotp').then(() => {
                sendResponse(true)
                // Trigger credential indicator update
                chrome.runtime.sendMessage({ cmd: 'credentials_updated', platform: request.platform ?? 'zih' })
              })
            })
          return true

        case 'iotp':
          if (!request.secret) return sendResponse(false)
          credentials
            .setUserData({ user: 'iotp', pass: request.secret }, (request.platform ?? 'zih') + '-iotp')
            .then(() => {
              credentials.deleteUserData((request.platform ?? 'zih') + '-totp').then(() => {
                sendResponse(true)
                // Trigger credential indicator update
                chrome.runtime.sendMessage({ cmd: 'credentials_updated', platform: request.platform ?? 'zih' })
              })
            })
          return true

        default:
          return sendResponse(false)
      }
    case 'delete_otp':
      credentials
        .deleteUserData((request.platform ?? 'zih') + '-totp')
        .then(() => credentials.deleteUserData((request.platform ?? 'zih') + '-iotp'))
        .then(() => {
          sendResponse(true)
          // Trigger credential indicator update
          chrome.runtime.sendMessage({ cmd: 'credentials_updated', platform: request.platform ?? 'zih' })
        })
      return true
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
      chrome.storage.local.get(['selectedRocketIcon', 'availableRockets'], (result) =>
        sendResponse({ selected: result.selectedRocketIcon, available: result.availableRockets })
      )
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
      openSettingsPage(request.params).then(() => sendResponse(true))
      return true
    case 'open_share_page':
      openSharePage()
      break
    case 'open_shortcut_settings': {
      if (isFirefox()) {
        chrome.tabs.create({ url: 'https://support.mozilla.org/de/kb/tastenkombinationen-fur-erweiterungen-verwalten' })
      } else {
        // for chrome and everything else
        chrome.tabs.create({ url: 'chrome://extensions/shortcuts' })
      }
      break
    }
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
async function openSettingsPage(params?: string) {
  if (params) {
    await chrome.storage.local.set({ openSettingsPageParam: params })
  }
  await chrome.runtime.openOptionsPage()
}

async function openSharePage() {
  await chrome.tabs.create({ url: 'share.html' })
}

// save_click_counter
async function saveClicks(counter: number) {
  // load number of saved clicks and add counter!
  const result = await chrome.storage.local.get(['savedClickCounter'])
  const savedClickCounter =
    typeof result.savedClickCounter === 'undefined' ? counter : result.savedClickCounter + counter
  await chrome.storage.local.set({ savedClickCounter })
  console.log('Saved ' + counter + ' clicks!')
  // make rocketIcons available if appropriate
  const { availableRockets } = await chrome.storage.local.get(['availableRockets'])
  if (savedClickCounter >= 250 && !availableRockets.includes('250clicks')) availableRockets.push('250clicks')
  if (savedClickCounter >= 2500 && !availableRockets.includes('2500clicks')) availableRockets.push('2500clicks')
  await chrome.storage.local.set({ availableRockets })
}

// logout function for idp
async function logoutIdp(logoutDuration: number = 5) {
  // Chrome types are wrong, so we need to cast them, see https://developer.chrome.com/docs/extensions/reference/permissions/#method-request
  const granted = (await chrome.permissions.request({ permissions: ['cookies'] })) as unknown as boolean
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
async function eastereggFound() {
  await unlockRocketIcon('easteregg')
  await setRocketIcon('easteregg')

  await chrome.storage.local.set({ foundEasteregg: true })
}

async function setRocketIcon(rocketId: string): Promise<void> {
  const rocket = rockets[rocketId] || rockets.default

  await chrome.storage.local.set({ selectedRocketIcon: JSON.stringify(rocket) })
  await chrome.action.setIcon({ path: rocket.iconPathUnlocked })
}

async function unlockRocketIcon(rocketId: string): Promise<void> {
  const { availableRockets } = await chrome.storage.local.get(['availableRockets'])
  if (!availableRockets.includes(rocketId)) availableRockets.push(rocketId)

  const update: any = { availableRockets }
  if (rocketId === 'webstore') update.mostLikelySubmittedReview = true

  await chrome.storage.local.set(update)
}

/**
 * Unified function to open course links with configurable behavior
 * Enables both background loading (popup) and immediate active (opal)
 *
 * Opens a list of course links with configurable behavior (active/background and cleanup).
 *
 * @param courseLinks An array of URL strings to open.
 * @param config Configuration object specifying the opening behavior.
 */

async function openCourseLinks(courseLinks: string[], config: OpenCourseConfig): Promise<void> {
  if (!courseLinks || courseLinks.length === 0) {
    return
  }

  const { behavior } = config
  const isBackgroundLoad = behavior === 'background_load'
  // Delay for the cleanup operation
  const cleanupDelayMs = isBackgroundLoad ? 2000 : 1000

  // 1 - determine Tab Index
  let startIndex: number | undefined
  try {
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (currentTab && typeof currentTab.index === 'number') {
      startIndex = currentTab.index + 1
    }
  } catch (e) {
    // Cannot get current tab, proceed without explicit index
  }

  // Use a Promise array to track the *creation* of all tabs
  const tabCreationPromises: Promise<chrome.tabs.Tab | undefined>[] = []

  // 2 - Open Tabs
  for (let i = 0; i < courseLinks.length; i++) {
    const link = courseLinks[i]
    const isLastLink = i === courseLinks.length - 1
    const trimmed = link ? link.trim() : ''

    // --- Basic Sanitization (Simplified) ---
    const absoluteUrlPattern = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//
    const protocolRelativePattern = /^\/\//

    if (
      !trimmed ||
      trimmed === '#' ||
      trimmed.startsWith('javascript:') ||
      trimmed.startsWith('chrome-extension:') ||
      (!absoluteUrlPattern.test(trimmed) && !protocolRelativePattern.test(trimmed))
    ) {
      // console.warn('Skipping invalid course link:', link); // Optional: Re-add original warning
      continue
    }

    const createProps: chrome.tabs.CreateProperties = {
      url: trimmed,
      // Active: false for background_load, OR active on the last tab for immediate_active
      active: !isBackgroundLoad && isLastLink,
      index: typeof startIndex !== 'undefined' ? startIndex + tabCreationPromises.length : undefined
    }

    // Wrap the chrome.tabs.create callback in a Promise for tracking
    const tabCreationPromise = new Promise<chrome.tabs.Tab | undefined>((resolve) => {
      chrome.tabs.create(createProps, (newTab) => {
        // Resolve with the new tab object or undefined if creation fails
        resolve(newTab)
      })
    })

    tabCreationPromises.push(tabCreationPromise)

    // Delay between opening tabs
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  // 3 - Await all tab creation to get their IDs
  const openedTabs = await Promise.all(tabCreationPromises)
  const openedTabIds = openedTabs
    .filter((tab): tab is chrome.tabs.Tab => !!tab && typeof tab.id === 'number')
    .map((tab) => tab.id!) // Non-null assertion is safe after the filter

  const lastTabId = openedTabIds[openedTabIds.length - 1]

  // 4 - cleanup and activate last tab
  // Use setTimeout to ensure cleanup happens *after* the tabs have had a chance to load
  setTimeout(() => {
    if (openedTabIds.length === 0) {
      return // No tabs were successfully opened
    }

    // Remove all tabs except the last one
    const tabsToRemove = openedTabIds.slice(0, openedTabIds.length - 1)

    if (tabsToRemove.length > 0) {
      // NOTE: chrome.tabs.remove can take an array of IDs
      chrome.tabs.remove(tabsToRemove).catch((e) => {
        // Handle potential errors if tabs have already been closed
        console.error('Error removing old tabs:', e)
      })
    }

    // Activate the last tab only if in 'background_load' mode
    if (isBackgroundLoad && lastTabId) {
      chrome.tabs.update(lastTabId, { active: true }).catch((e) => {
        // Handle potential errors if the tab has already been closed
        console.error('Error activating last tab:', e)
      })
    }
  }, cleanupDelayMs)

  // 5 - Save Clicks
  saveClicks(2 * courseLinks.length)
}
