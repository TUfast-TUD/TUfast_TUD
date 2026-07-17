'use strict'
import * as credentials from './modules/credentials'
import * as otp from './modules/otp'
import * as owaFetch from './modules/owaFetch'
import * as opalInline from './modules/opalInline'
import { isFirefox } from './modules/firefoxCheck'
import {
  clearOpalSearchIndex,
  getAllOpalSearchNodes,
  getOpalSearchIndexStats,
  getOpalSearchNode,
  pruneOpalSearchCourse,
  recordOpalSearchNodeVisit,
  upsertGraphNodes
} from './modules/opalSmartSearch/indexDb'
import { searchOpalNodes } from './modules/opalSmartSearch/search'
import {
  SmartSearchKey,
  defaultSmartSearchSettings,
  jobStaleMs,
  loadSmartSearchSettings,
  saveSmartSearchSettings,
  startStaleMs
} from './modules/opalSmartSearch/settings'
import type { OpalActiveIndexProgress, OpalSearchNode } from './modules/opalSmartSearch/types'
import {
  extractOpalRepositoryId,
  isAllowedOpalUrl,
  isOpalLoginUrl,
  normalizeAllowedOpalUrl,
  sanitizeOpalSearchNode,
  sanitizeOpalSearchNodes
} from './modules/opalSmartSearch/urlPolicy'
import rockets from './freshContent/rockets.json'
import studies from './freshContent/studies.json'
import { initLocale, t } from './i18n'

initLocale()

let opalSmartSearchWriteGeneration = 0
let opalSmartSearchControlQueue: Promise<void> = Promise.resolve()

chrome.tabs.onRemoved.addListener((tabId) => resumeOpalSmartSearchAfterOwnerLoss(tabId))
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url && (!isAllowedOpalUrl(changeInfo.url) || isOpalLoginUrl(changeInfo.url)))
    resumeOpalSmartSearchAfterOwnerLoss(tabId)
})

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
        // 'auto' uses the browser UI language when supported, otherwise English.
        locale: 'auto',
        studiengang: 'general',
        hisqisPimpedTable: true,
        bannersShown: ['mv3UpdateNotice'],
        improveSelma: true,
        [SmartSearchKey.settings]: defaultSmartSearchSettings
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
        'locale',
        'studiengang',
        'hisqisPimpedTable',
        'improveSelma',
        SmartSearchKey.settings,
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
      if (typeof currentSettings[SmartSearchKey.settings] === 'undefined')
        updateObj[SmartSearchKey.settings] = defaultSmartSearchSettings
      if (typeof currentSettings.theme === 'undefined') updateObj.theme = 'system'
      if (typeof currentSettings.locale === 'undefined') updateObj.locale = 'auto'
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
      case 'open_opal_smart_search_hotkey':
        await openOpalSmartSearch(currentTab)
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
    case 'open_all': {
      // 1 - receive both values
      const links = request.links
      const behavior = request.behavior

      // 2 - call function to open links
      openCourseLinks(links, behavior)
        .then(() => sendResponse({ success: true }))
        .catch((error) => sendResponse({ success: false, error: error.message || 'Unknown error during tab opening' }))

      // 3 - IMPORTANT: Return true to signal that 'sendResponse' will be called asynchronously
      return true
    }
    // Close All Tabs in Opal
    case 'close_all_tabs':
      saveClicks(request.closedCount)
      sendResponse({ success: true })
      return true
    // Close current chrome tab
    case 'close_current_tab':
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
            resolve(result.improveSelma ?? true)
          })
        }),
        // 6 - Searchengine (has user activated searchengine commands?)
        new Promise<boolean>((resolve) => {
          chrome.storage.local.get(['fwdEnabled'], (result) => {
            resolve(result.fwdEnabled ?? false)
          })
        }),
        // 7 - OPAL Smart Search (has user enabled local OPAL search?)
        loadSmartSearchSettings().then((settings) => settings.enabled),
        // 8 - Faculty (which faculty has user selected?)
        new Promise<string>((resolve) => {
          chrome.storage.local.get(['studiengang'], (result) => {
            const studiengangId = result.studiengang ?? 'general'
            resolve(studies[studiengangId] ? studiengangId : 'general')
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
          smartSearchStatus, // 7
          faculty, // 8
          userDataExists // 9
        ]) => {
          sendResponse({
            otp: totpExists || iotpExists,
            owa: owaStatus,
            opalPdf: opalStatus,
            userData: userDataExists || loginExists,
            selma: selmaStatus,
            searchengine: seCommandsStatus,
            smartSearch: smartSearchStatus,
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
    /* OPAL Smart Search */
    case 'opal_smart_search_upsert_nodes': {
      const senderUrl = _sender.url ?? _sender.tab?.url
      const ownerTabId = _sender.tab?.id
      const nodes = Array.isArray(request.nodes) ? sanitizeOpalSearchNodes(request.nodes as OpalSearchNode[]) : []
      if (!senderUrl || !isAllowedOpalUrl(senderUrl) || nodes.length === 0) {
        sendResponse(false)
        return true
      }

      const writeGeneration = opalSmartSearchWriteGeneration
      const jobStartedAt = readFiniteNumber(request.jobStartedAt)
      if (!nodes.some((node) => node.source === 'active')) {
        upsertGraphNodes(nodes)
          .then(() => sendResponse(true))
          .catch((error) => {
            console.warn('[TUfast Smart Search] Could not upsert nodes:', error)
            sendResponse(false)
          })
        return true
      }

      queueOpalSmartSearchControl(async () => {
        const accepted = await canAcceptOpalSmartSearchNodes(nodes, writeGeneration, ownerTabId, jobStartedAt)
        if (!accepted) return false
        await upsertGraphNodes(nodes)
        return true
      })
        .then(sendResponse)
        .catch((error) => {
          console.warn('[TUfast Smart Search] Could not upsert nodes:', error)
          sendResponse(false)
        })
      return true
    }
    case 'opal_smart_search_get_node': {
      const id = readRequiredString(request.id)
      if (!id) {
        sendResponse(undefined)
        return true
      }

      getOpalSearchNode(id)
        .then((node) => sendResponse(node ? sanitizeOpalSearchNode(node) ?? undefined : undefined))
        .catch(() => sendResponse(undefined))
      return true
    }
    case 'opal_smart_search_prune_course': {
      const senderUrl = _sender.url ?? _sender.tab?.url
      const ownerTabId = _sender.tab?.id
      const courseId = readRequiredString(request.courseId)
      const olderThan = readFiniteNumber(request.olderThan)
      const jobStartedAt = readFiniteNumber(request.jobStartedAt)
      if (
        !senderUrl ||
        !isAllowedOpalUrl(senderUrl) ||
        !courseId ||
        !extractOpalRepositoryId(courseId) ||
        !olderThan ||
        !jobStartedAt
      ) {
        sendResponse(false)
        return true
      }

      const writeGeneration = opalSmartSearchWriteGeneration
      queueOpalSmartSearchControl(async () => {
        const accepted = await canAcceptOpalSmartSearchJob(writeGeneration, ownerTabId, jobStartedAt)
        return accepted ? pruneOpalSearchCourse(courseId, olderThan) : false
      })
        .then(sendResponse)
        .catch((error) => {
          console.warn('[TUfast Smart Search] Could not prune stale course nodes:', error)
          sendResponse(false)
        })
      return true
    }
    case 'opal_smart_search_commit_course': {
      const senderUrl = _sender.url ?? _sender.tab?.url
      const ownerTabId = _sender.tab?.id
      const courseUrl = normalizeAllowedOpalUrl(readRequiredString(request.courseUrl) || '')
      const jobStartedAt = readFiniteNumber(request.jobStartedAt)
      if (
        !senderUrl ||
        !isAllowedOpalUrl(senderUrl) ||
        !courseUrl ||
        !extractOpalRepositoryId(courseUrl) ||
        !jobStartedAt
      ) {
        sendResponse(false)
        return true
      }

      const writeGeneration = opalSmartSearchWriteGeneration
      queueOpalSmartSearchControl(() =>
        commitOpalSmartSearchCourse(courseUrl, jobStartedAt, request.successful === true, writeGeneration, ownerTabId)
      )
        .then(sendResponse)
        .catch((error) => {
          console.warn('[TUfast Smart Search] Could not commit course completion:', error)
          sendResponse(false)
        })
      return true
    }
    case 'opal_smart_search_query': {
      const rawQuery = readRequiredString(request.rawQuery)
      if (!rawQuery) {
        sendResponse([])
        return true
      }

      searchOpalNodes(rawQuery, readOptionalString(request.courseId), readSearchLimit(request.limit))
        .then((results) =>
          sendResponse(
            results.flatMap((result) => {
              const node = sanitizeOpalSearchNode(result.node)
              return node ? [{ ...result, node }] : []
            })
          )
        )
        .catch((error) => {
          console.warn('[TUfast Smart Search] Query failed:', error)
          sendResponse(undefined)
        })
      return true
    }
    case 'open_opal_smart_search_result': {
      const nodeId = readRequiredString(request.nodeId)
      if (!nodeId) {
        sendResponse(false)
        return true
      }

      openOpalSmartSearchResult(nodeId)
        .then(sendResponse)
        .catch((error) => {
          console.warn('[TUfast Smart Search] Could not open popup result:', error)
          sendResponse(false)
        })
      return true
    }
    case 'opal_smart_search_record_visit': {
      const nodeId = readRequiredString(request.nodeId)
      if (!nodeId) {
        sendResponse(false)
        return true
      }

      recordOpalSearchNodeVisit(nodeId)
        .then(sendResponse)
        .catch(() => sendResponse(false))
      return true
    }
    case 'open_opal_smart_search_query': {
      const rawQuery = readRequiredString(request.rawQuery)
      if (!rawQuery) {
        sendResponse(false)
        return true
      }

      chrome.tabs
        .query({ active: true, currentWindow: true })
        .then(([activeTab]) => openOpalSmartSearch(activeTab, rawQuery))
        .then(sendResponse)
        .catch((error) => {
          console.warn('[TUfast Smart Search] Could not open popup query:', error)
          sendResponse(false)
        })
      return true
    }
    case 'check_opal_smart_search_status':
      loadSmartSearchSettings().then(sendResponse)
      return true
    case 'enable_opal_smart_search':
      updateOpalSmartSearchSetting(readSmartSearchSettingOption(request.option), true).then(sendResponse)
      return true
    case 'disable_opal_smart_search':
      updateOpalSmartSearchSetting(readSmartSearchSettingOption(request.option), false).then(sendResponse)
      return true
    case 'opal_smart_search_stats':
      getOpalSearchIndexStats().then(sendResponse)
      return true
    case 'opal_smart_search_dump_nodes':
      // ponytail: temporary beta debug export; remove before the merge-ready release build.
      getAllOpalSearchNodes()
        .then((nodes) => sendResponse({ exportedAt: new Date().toISOString(), count: nodes.length, nodes }))
        .catch(() => sendResponse({ exportedAt: new Date().toISOString(), count: 0, nodes: [] }))
      return true
    case 'opal_smart_search_progress':
      queueOpalSmartSearchControl(readCurrentOpalSmartSearchProgress).then(sendResponse)
      return true
    case 'opal_smart_search_claim_job': {
      const senderUrl = _sender.url ?? _sender.tab?.url
      const ownerTabId = _sender.tab?.id
      const jobStartedAt = readFiniteNumber(request.jobStartedAt)
      if (!senderUrl || !isAllowedOpalUrl(senderUrl) || !ownerTabId || !jobStartedAt) {
        sendResponse(false)
        return true
      }

      const writeGeneration = opalSmartSearchWriteGeneration
      queueOpalSmartSearchControl(() => claimOpalSmartSearchJob(ownerTabId, jobStartedAt, writeGeneration))
        .then(sendResponse)
        .catch(() => sendResponse(false))
      return true
    }
    case 'opal_smart_search_publish_progress': {
      const senderUrl = _sender.url ?? _sender.tab?.url
      const ownerTabId = _sender.tab?.id
      const update = request.update as Partial<OpalActiveIndexProgress> | undefined
      const jobStartedAt = readFiniteNumber(update?.startedAt)
      if (!senderUrl || !isAllowedOpalUrl(senderUrl) || !update || !jobStartedAt) {
        sendResponse(readOpalSmartSearchProgress(undefined))
        return true
      }

      const writeGeneration = opalSmartSearchWriteGeneration
      queueOpalSmartSearchControl(() => publishOpalSmartSearchProgress(update, writeGeneration, ownerTabId))
        .then(sendResponse)
        .catch((error) => {
          console.warn('[TUfast Smart Search] Could not publish progress:', error)
          sendResponse(readOpalSmartSearchProgress(undefined))
        })
      return true
    }
    case 'start_opal_smart_search_preload':
      startOpalSmartSearchPreload(_sender.tab)
        .then(sendResponse)
        .catch((error) => {
          console.warn('[TUfast Smart Search] Could not start preload:', error)
          sendResponse(false)
        })
      return true
    case 'cancel_opal_smart_search_preload':
      queueOpalSmartSearchControl(async () => {
        await cancelOpalSmartSearchPreload()
        return true
      })
        .then(sendResponse)
        .catch(() => sendResponse(false))
      return true
    case 'clear_opal_smart_search_index':
      queueOpalSmartSearchControl(async () => {
        await cancelOpalSmartSearchPreload()
        await clearOpalSearchIndex()
        await chrome.storage.local.remove([
          SmartSearchKey.activeProgress,
          SmartSearchKey.activeRuns,
          SmartSearchKey.highlight,
          SmartSearchKey.successfulRuns
        ])
        return true
      })
        .then(() => sendResponse(true))
        .catch(() => sendResponse(false))
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

// Smart Search has one opener on purpose: the OPAL header, Alt+K, and a future central TUfast search
// can all call this without depending on each other's UI. If Smart Search is folded into central search later,
// keep this opener for OPAL pages and add a small provider adapter around `opal_smart_search_query`.
async function openOpalSmartSearch(currentTab?: chrome.tabs.Tab, rawQuery?: string): Promise<boolean> {
  const settings = await loadSmartSearchSettings()
  if (!settings.enabled) {
    await openSettingsPage('OpalSmartSearch')
    return false
  }

  if (currentTab?.id && currentTab.url && isAllowedOpalUrl(currentTab.url)) {
    // A still-initializing OPAL tab has no receiver yet — retry briefly instead of opening a duplicate tab.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      if (attempt > 0) await delay(400)
      if (await sendOpenOpalSmartSearch(currentTab.id, rawQuery)) {
        await saveClicks(2)
        return true
      }
    }
  }

  await chrome.storage.local.set({
    [SmartSearchKey.openAfterOpalLoad]: {
      expiresAt: Date.now() + 15000,
      ...(typeof rawQuery === 'string' ? { rawQuery } : {})
    }
  })
  await chrome.tabs.create({
    url: 'https://bildungsportal.sachsen.de/opal/home/',
    index: typeof currentTab?.index === 'number' ? currentTab.index + 1 : undefined
  })
  await saveClicks(2)
  return true
}

async function sendOpenOpalSmartSearch(tabId: number, rawQuery?: string): Promise<boolean> {
  return Boolean(
    await sendOpalSmartSearchTabMessage(tabId, {
      cmd: 'open_opal_smart_search',
      ...(typeof rawQuery === 'string' ? { rawQuery } : {})
    })
  )
}

async function openOpalSmartSearchResult(nodeId: string): Promise<boolean> {
  const node = await getOpalSearchNode(nodeId)
  if (!node) return false

  let targetUrl = normalizeAllowedOpalUrl(node.url)
  if (node.type === 'file' && node.parentId) {
    const parent = await getOpalSearchNode(node.parentId)
    const parentUrl = parent ? normalizeAllowedOpalUrl(parent.url) : null
    if (parentUrl && targetUrl) {
      await chrome.storage.local.set({
        [SmartSearchKey.highlight]: { title: node.title, url: targetUrl }
      })
      targetUrl = parentUrl
    }
  }

  if (!targetUrl) return false
  await recordOpalSearchNodeVisit(nodeId)
  await chrome.tabs.create({ url: targetUrl, active: true })
  await saveClicks(2)
  return true
}

async function updateOpalSmartSearchSetting(option: string, value: boolean): Promise<boolean> {
  if (option !== 'enabled') return false

  if (!value) {
    return queueOpalSmartSearchControl(async () => {
      await saveSmartSearchSettings({ enabled: false })
      await cancelOpalSmartSearchPreload()
      return false
    })
  }

  await saveSmartSearchSettings({ enabled: value })
  return value
}

function readRequiredString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function readSearchLimit(value: unknown): number | undefined {
  const limit = readFiniteNumber(value)
  return limit === undefined ? undefined : Math.max(1, Math.min(50, Math.trunc(limit)))
}

function readFiniteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function readSmartSearchSettingOption(value: unknown): string {
  return typeof value === 'string' ? value : 'enabled'
}

// Active indexing is deliberately reachable only from explicit user actions. If Oli later wants automatic
// semester-change indexing, change the recommendation policy first and keep this function as the single start gate.
interface OpalSmartSearchStart {
  tab: chrome.tabs.Tab
  tabId: number
  startedAt: number
  writeGeneration: number
}

async function startOpalSmartSearchPreload(preferredTab?: chrome.tabs.Tab): Promise<boolean> {
  const start = await queueOpalSmartSearchControl(() => prepareOpalSmartSearchPreload(preferredTab))
  if (!start) return false

  try {
    const favoritesReady = await refreshStoredOpalFavorites(start)
    if (!favoritesReady) {
      await queueOpalSmartSearchControl(() => failOpalSmartSearchPreload(start.startedAt, start.writeGeneration))
      return false
    }

    const activated = await queueOpalSmartSearchControl(() => activateOpalSmartSearchPreload(start))
    if (!activated) return false

    const started = Boolean(
      await sendStartOpalSmartSearchPreload(start.tabId, 60, start.startedAt, start.writeGeneration)
    )
    if (!started)
      await queueOpalSmartSearchControl(() => failOpalSmartSearchPreload(start.startedAt, start.writeGeneration))
    return started
  } catch (error) {
    await queueOpalSmartSearchControl(() => failOpalSmartSearchPreload(start.startedAt, start.writeGeneration))
    throw error
  }
}

async function prepareOpalSmartSearchPreload(
  preferredTab?: chrome.tabs.Tab
): Promise<OpalSmartSearchStart | undefined> {
  await cancelOpalSmartSearchPreload()
  const existingTab = await findOpalSmartSearchTab(preferredTab)
  const tab =
    existingTab ?? (await chrome.tabs.create({ url: 'https://bildungsportal.sachsen.de/opal/home/', active: true }))
  if (!tab.id) return undefined

  const writeGeneration = opalSmartSearchWriteGeneration
  const existing = await chrome.storage.local.get([SmartSearchKey.activeProgress])
  const previous = readOpalSmartSearchProgress(existing[SmartSearchKey.activeProgress])
  const startedAt = Math.max(Date.now(), previous.startedAt + 1)
  await saveSmartSearchSettings({ enabled: true })
  // Manual Improve always retries every favorite; clear this before publishing the job so auto-recovery sees it.
  await chrome.storage.local.remove(SmartSearchKey.activeRuns)
  await chrome.storage.local.set({
    [SmartSearchKey.activeProgress]: {
      status: 'starting',
      startedAt,
      updatedAt: Date.now(),
      ownerTabId: tab.id,
      totalCourses: 0,
      completedCourses: 0,
      failedCourses: 0,
      indexedItems: 0
    } satisfies OpalActiveIndexProgress
  })

  return { tab, tabId: tab.id, startedAt, writeGeneration }
}

async function findOpalSmartSearchTab(preferredTab?: chrome.tabs.Tab): Promise<chrome.tabs.Tab | undefined> {
  if (preferredTab?.id && preferredTab.url && isAllowedOpalUrl(preferredTab.url)) return preferredTab

  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (activeTab?.id && activeTab.url && isAllowedOpalUrl(activeTab.url)) return activeTab

  const opalTabs = await chrome.tabs.query({ url: 'https://bildungsportal.sachsen.de/opal/*' })
  return opalTabs.find((tab) => typeof tab.id === 'number')
}

function resumeOpalSmartSearchAfterOwnerLoss(ownerTabId: number): void {
  queueOpalSmartSearchControl(async () => {
    const data = await chrome.storage.local.get([SmartSearchKey.activeProgress])
    const progress = readOpalSmartSearchProgress(data[SmartSearchKey.activeProgress])
    if (progress.ownerTabId !== ownerTabId) return undefined
    if (progress.status === 'starting') {
      opalSmartSearchWriteGeneration += 1
      await chrome.storage.local.set({
        [SmartSearchKey.activeProgress]: {
          ...progress,
          status: 'failed',
          updatedAt: Date.now(),
          ownerTabId: undefined
        } satisfies OpalActiveIndexProgress
      })
      return undefined
    }
    if (progress.status !== 'running') return undefined

    const tabs = await chrome.tabs.query({ url: 'https://bildungsportal.sachsen.de/opal/*' })
    const candidates = tabs.filter(
      (tab) =>
        tab.id !== ownerTabId &&
        !tab.discarded &&
        Boolean(tab.url && isAllowedOpalUrl(tab.url) && !isOpalLoginUrl(tab.url))
    )
    const activeCandidate = candidates.find((tab) => tab.active)
    const tabIds = [activeCandidate, ...candidates.filter((tab) => tab !== activeCandidate)]
      .map((tab) => tab?.id)
      .filter((tabId): tabId is number => typeof tabId === 'number')
    return { startedAt: progress.startedAt, ownerTabId, tabIds }
  })
    .then((handoff) => handoff && handoffOpalSmartSearch(handoff))
    .catch((error) => console.warn('[TUfast Smart Search] Could not hand off indexing:', error))
}

async function handoffOpalSmartSearch(handoff: {
  startedAt: number
  ownerTabId: number
  tabIds: number[]
}): Promise<void> {
  for (const tabId of handoff.tabIds) {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const data = await chrome.storage.local.get([SmartSearchKey.activeProgress])
      const progress = readOpalSmartSearchProgress(data[SmartSearchKey.activeProgress])
      if (progress.status !== 'running' || progress.startedAt !== handoff.startedAt) return
      if (progress.ownerTabId !== handoff.ownerTabId && progress.ownerTabId !== tabId) return

      await sendOpalSmartSearchTabMessage(tabId, { cmd: 'start_opal_smart_search_preload' })
      await delay(500)

      const latest = await chrome.storage.local.get([SmartSearchKey.activeProgress])
      const latestProgress = readOpalSmartSearchProgress(latest[SmartSearchKey.activeProgress])
      if (latestProgress.status !== 'running' || latestProgress.startedAt !== handoff.startedAt) return
      if (latestProgress.ownerTabId === tabId) return
    }
  }
}

async function refreshStoredOpalFavorites(start: OpalSmartSearchStart): Promise<boolean> {
  if (!(await isOpalSmartSearchStartCurrent(start, 'starting'))) return false
  const stored = await chrome.storage.local.get(['favoriten', SmartSearchKey.favoritesDetectedAt])
  if (typeof stored.favoriten === 'string') return true

  const favoritesUrl = 'https://bildungsportal.sachsen.de/opal/auth/resource/favorites'
  const requestedAt = Date.now()

  if (start.tab.url?.startsWith(favoritesUrl)) await chrome.tabs.reload(start.tabId)
  else await chrome.tabs.update(start.tabId, { url: favoritesUrl })

  for (let attempt = 0; attempt < 60; attempt += 1) {
    await delay(250)
    if (!(await isOpalSmartSearchStartCurrent(start, 'starting'))) return false
    const data = await chrome.storage.local.get([SmartSearchKey.favoritesDetectedAt])
    if (Number(data[SmartSearchKey.favoritesDetectedAt]) >= requestedAt) return true
  }

  return false
}

async function activateOpalSmartSearchPreload(start: OpalSmartSearchStart): Promise<boolean> {
  if (!(await isOpalSmartSearchStartCurrent(start, 'starting'))) return false
  const data = await chrome.storage.local.get([SmartSearchKey.activeProgress])
  const progress = readOpalSmartSearchProgress(data[SmartSearchKey.activeProgress])
  await chrome.storage.local.set({
    [SmartSearchKey.activeProgress]: {
      ...progress,
      status: 'running',
      updatedAt: Date.now()
    } satisfies OpalActiveIndexProgress
  })
  return true
}

async function isOpalSmartSearchStartCurrent(
  start: Pick<OpalSmartSearchStart, 'tabId' | 'startedAt' | 'writeGeneration'>,
  status: 'starting' | 'running'
): Promise<boolean> {
  if (start.writeGeneration !== opalSmartSearchWriteGeneration) return false
  const data = await chrome.storage.local.get([SmartSearchKey.activeProgress])
  const progress = readOpalSmartSearchProgress(data[SmartSearchKey.activeProgress])
  return progress.status === status && progress.startedAt === start.startedAt && progress.ownerTabId === start.tabId
}

async function sendStartOpalSmartSearchPreload(
  tabId: number,
  attempts: number,
  jobStartedAt: number,
  writeGeneration: number
): Promise<boolean> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (!(await isOpalSmartSearchStartCurrent({ tabId, startedAt: jobStartedAt, writeGeneration }, 'running')))
      return false
    if (
      await sendOpalSmartSearchTabMessage(tabId, {
        cmd: 'start_opal_smart_search_preload'
      })
    )
      return true

    await delay(500)
  }

  return false
}

async function failOpalSmartSearchPreload(jobStartedAt: number, writeGeneration: number): Promise<void> {
  const result = await chrome.storage.local.get([SmartSearchKey.activeProgress])
  const progress = readOpalSmartSearchProgress(result[SmartSearchKey.activeProgress])
  if (
    writeGeneration !== opalSmartSearchWriteGeneration ||
    (progress.status !== 'starting' && progress.status !== 'running') ||
    progress.startedAt !== jobStartedAt
  )
    return
  await chrome.storage.local.set({
    [SmartSearchKey.activeProgress]: {
      ...progress,
      status: 'failed',
      updatedAt: Date.now()
    } satisfies OpalActiveIndexProgress
  })
}

async function cancelOpalSmartSearchPreload(): Promise<void> {
  const writeGeneration = ++opalSmartSearchWriteGeneration
  const result = await chrome.storage.local.get([SmartSearchKey.activeProgress])
  if (writeGeneration !== opalSmartSearchWriteGeneration) return
  const progress = readOpalSmartSearchProgress(result[SmartSearchKey.activeProgress])
  if (progress.status !== 'starting' && progress.status !== 'running') return

  await chrome.storage.local.set({
    [SmartSearchKey.activeProgress]: {
      ...progress,
      status: 'idle',
      updatedAt: Date.now(),
      ownerTabId: undefined,
      currentCourseTitle: undefined
    } satisfies OpalActiveIndexProgress
  })
}

function queueOpalSmartSearchControl<T>(operation: () => Promise<T>): Promise<T> {
  const result = opalSmartSearchControlQueue.then(operation, operation)
  opalSmartSearchControlQueue = result.then(
    () => undefined,
    () => undefined
  )
  return result
}

async function readCurrentOpalSmartSearchProgress(): Promise<OpalActiveIndexProgress> {
  const result = await chrome.storage.local.get([SmartSearchKey.activeProgress])
  const progress = readOpalSmartSearchProgress(result[SmartSearchKey.activeProgress])
  if (!(await expireOpalSmartSearchProgress(progress))) return progress

  const expired = await chrome.storage.local.get([SmartSearchKey.activeProgress])
  return readOpalSmartSearchProgress(expired[SmartSearchKey.activeProgress])
}

async function claimOpalSmartSearchJob(
  ownerTabId: number,
  jobStartedAt: number,
  writeGeneration: number
): Promise<boolean> {
  const result = await chrome.storage.local.get([SmartSearchKey.activeProgress])
  const progress = readOpalSmartSearchProgress(result[SmartSearchKey.activeProgress])
  if (
    writeGeneration !== opalSmartSearchWriteGeneration ||
    progress.status !== 'running' ||
    progress.startedAt !== jobStartedAt ||
    (await expireOpalSmartSearchProgress(progress))
  )
    return false
  if (progress.ownerTabId === ownerTabId) return true
  if (progress.ownerTabId && (await isLiveOpalTab(progress.ownerTabId))) return false

  await chrome.storage.local.set({
    [SmartSearchKey.activeProgress]: {
      ...progress,
      ownerTabId,
      updatedAt: Date.now()
    } satisfies OpalActiveIndexProgress
  })
  return true
}

async function isLiveOpalTab(tabId: number): Promise<boolean> {
  try {
    const tab = await chrome.tabs.get(tabId)
    return Boolean(!tab.discarded && tab.url && isAllowedOpalUrl(tab.url) && !isOpalLoginUrl(tab.url))
  } catch {
    return false
  }
}

async function expireOpalSmartSearchProgress(progress: OpalActiveIndexProgress): Promise<boolean> {
  const lastActivityAt = Math.max(progress.startedAt, progress.updatedAt)
  const staleAfter = progress.status === 'starting' ? startStaleMs : progress.status === 'running' ? jobStaleMs : 0
  if (!staleAfter || !lastActivityAt || Date.now() - lastActivityAt <= staleAfter) return false

  opalSmartSearchWriteGeneration += 1
  await chrome.storage.local.set({
    [SmartSearchKey.activeProgress]: {
      ...progress,
      status: 'failed',
      updatedAt: Date.now()
    } satisfies OpalActiveIndexProgress
  })
  return true
}

async function canAcceptOpalSmartSearchNodes(
  nodes: OpalSearchNode[],
  writeGeneration: number,
  ownerTabId?: number,
  jobStartedAt?: number
): Promise<boolean> {
  if (!nodes.some((node) => node.source === 'active')) return true
  if (!jobStartedAt) return false
  return canAcceptOpalSmartSearchJob(writeGeneration, ownerTabId, jobStartedAt)
}

async function canAcceptOpalSmartSearchJob(
  writeGeneration: number,
  ownerTabId: number | undefined,
  jobStartedAt: number
): Promise<boolean> {
  const result = await chrome.storage.local.get([SmartSearchKey.activeProgress])
  const progress = readOpalSmartSearchProgress(result[SmartSearchKey.activeProgress])
  if (await expireOpalSmartSearchProgress(progress)) return false
  return (
    writeGeneration === opalSmartSearchWriteGeneration &&
    ownerTabId === progress.ownerTabId &&
    progress.status === 'running' &&
    progress.startedAt === jobStartedAt
  )
}

async function publishOpalSmartSearchProgress(
  update: Partial<OpalActiveIndexProgress>,
  writeGeneration: number,
  ownerTabId?: number
): Promise<OpalActiveIndexProgress> {
  const result = await chrome.storage.local.get([SmartSearchKey.activeProgress])
  const previous = readOpalSmartSearchProgress(result[SmartSearchKey.activeProgress])
  if (
    writeGeneration !== opalSmartSearchWriteGeneration ||
    ownerTabId !== previous.ownerTabId ||
    previous.status !== 'running' ||
    previous.startedAt !== update.startedAt ||
    (await expireOpalSmartSearchProgress(previous))
  )
    return previous

  const status = update.status === 'done' || update.status === 'failed' ? update.status : 'running'
  const completedCourses = Math.max(previous.completedCourses, readProgressCount(update.completedCourses) ?? 0)
  const failedCourses = Math.max(previous.failedCourses || 0, readProgressCount(update.failedCourses) ?? 0)
  const progress: OpalActiveIndexProgress = {
    status,
    startedAt: previous.startedAt,
    updatedAt: Date.now(),
    ownerTabId: previous.ownerTabId,
    totalCourses: Math.max(
      previous.totalCourses,
      readProgressCount(update.totalCourses) ?? 0,
      completedCourses + failedCourses
    ),
    completedCourses,
    failedCourses,
    indexedItems: Math.max(previous.indexedItems, readProgressCount(update.indexedItems) ?? 0),
    currentCourseTitle: update.currentCourseTitle
  }
  await chrome.storage.local.set({ [SmartSearchKey.activeProgress]: progress })
  return progress
}

async function commitOpalSmartSearchCourse(
  courseUrl: string,
  jobStartedAt: number,
  successful: boolean,
  writeGeneration: number,
  ownerTabId?: number
): Promise<{ completedCourses: number; failedCourses: number } | false> {
  const result = await chrome.storage.local.get([
    SmartSearchKey.activeProgress,
    SmartSearchKey.activeRuns,
    SmartSearchKey.successfulRuns
  ])
  const progress = readOpalSmartSearchProgress(result[SmartSearchKey.activeProgress])
  if (
    writeGeneration !== opalSmartSearchWriteGeneration ||
    ownerTabId !== progress.ownerTabId ||
    progress.status !== 'running' ||
    progress.startedAt !== jobStartedAt ||
    (await expireOpalSmartSearchProgress(progress))
  )
    return false

  const now = Date.now()
  const cooldowns = { ...(result[SmartSearchKey.activeRuns] || {}) }
  if (readFiniteNumber(cooldowns[courseUrl])) {
    return { completedCourses: progress.completedCourses, failedCourses: progress.failedCourses || 0 }
  }
  cooldowns[courseUrl] = now
  const successfulRuns = { ...(result[SmartSearchKey.successfulRuns] || {}) }
  if (successful) successfulRuns[courseUrl] = now
  const completedCourses = progress.completedCourses + (successful ? 1 : 0)
  const failedCourses = (progress.failedCourses || 0) + (successful ? 0 : 1)
  await chrome.storage.local.set({
    [SmartSearchKey.activeRuns]: cooldowns,
    [SmartSearchKey.successfulRuns]: successfulRuns,
    [SmartSearchKey.activeProgress]: {
      ...progress,
      updatedAt: now,
      totalCourses: Math.max(progress.totalCourses, completedCourses + failedCourses),
      completedCourses,
      failedCourses
    } satisfies OpalActiveIndexProgress
  })
  return { completedCourses, failedCourses }
}

function sendOpalSmartSearchTabMessage(tabId: number, message: { cmd: string; rawQuery?: string }): Promise<unknown> {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      // The content script may still be loading after opening OPAL, or may have exited while disabled.
      if (chrome.runtime.lastError) {
        resolve(undefined)
        return
      }

      resolve(response)
    })
  })
}

function readOpalSmartSearchProgress(value: unknown): OpalActiveIndexProgress {
  if (value && typeof value === 'object') {
    const progress = value as Partial<OpalActiveIndexProgress>
    if (
      progress.status === 'idle' ||
      progress.status === 'starting' ||
      progress.status === 'running' ||
      progress.status === 'done' ||
      progress.status === 'failed'
    ) {
      return {
        status: progress.status,
        startedAt: readProgressCount(progress.startedAt) ?? 0,
        updatedAt: readProgressCount(progress.updatedAt) ?? 0,
        ownerTabId: readProgressCount(progress.ownerTabId) || undefined,
        totalCourses: readProgressCount(progress.totalCourses) ?? 0,
        completedCourses: readProgressCount(progress.completedCourses) ?? 0,
        failedCourses: readProgressCount(progress.failedCourses) ?? 0,
        indexedItems: readProgressCount(progress.indexedItems) ?? 0,
        currentCourseTitle: progress.currentCourseTitle
      }
    }
  }

  return {
    status: 'idle',
    startedAt: 0,
    updatedAt: 0,
    totalCourses: 0,
    completedCourses: 0,
    failedCourses: 0,
    indexedItems: 0
  }
}

function readProgressCount(value: unknown): number | undefined {
  const number = readFiniteNumber(value)
  return number === undefined ? undefined : Math.max(0, Math.trunc(number))
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
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
 * Open All Courses / Favorites Functionality
 * How does this work?
 * Buttons in popup.html and inside Opal send two params:
 * links - What do they want to open?
 * --> meine_kurse or
 * --> favoriten
 * behavior - How do they want to open it?
 * --> background_load (users current active page stays open, used for opening from popup) or
 * --> immediate_active (users current active page is replaced, used for opening from within opal)
 *
 * @param links Specifies what links to get from storage
 * @param behavior Configuration object specifying the behavior for opening links.
 */

async function openCourseLinks(links: string, behavior: string): Promise<void> {
  // Validate behavior parameter
  if (behavior !== 'background_load' && behavior !== 'immediate_active') {
    throw new Error(
      `Invalid behavior parameter: "${behavior}". Must be either "background_load" or "immediate_active".`
    )
  }

  // 1 - Get course links from storage
  async function getLinksFromStorage(): Promise<string[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get([links], (result) => {
        try {
          // Use the 'links' parameter as the key to access the stored data
          const storedData = result[links]

          // If it's already an array, use it directly
          if (Array.isArray(storedData)) {
            resolve(storedData.filter(Boolean))
            return
          }

          // Otherwise try to parse it as JSON
          const linkContent = JSON.parse(storedData || '[]')

          // If the parsed content is an array of objects with 'link' property
          if (Array.isArray(linkContent) && linkContent.length > 0 && linkContent[0].link) {
            const extractedLinks = linkContent.map((item: any) => item.link).filter(Boolean)
            resolve(extractedLinks)
          } else {
            // Otherwise assume it's an array of strings
            resolve(linkContent.filter(Boolean))
          }
        } catch (e) {
          console.error(`Error parsing ${links}:`, e)
          resolve([])
        }
      })
    })
  }

  // Actually call the function to get the links
  const courseLinks = await getLinksFromStorage()

  // 2 - Handle empty courses case
  if (courseLinks.length === 0) {
    console.warn(`No course links found for: ${links}`)

    // Set retry flag based on what type of links were requested
    const retryFlag = links === 'favoriten' ? 'retry_open_all_favorites' : 'retry_open_all_courses'

    // We have to store a retry flag to inform the following opal page to retry opening all courses/favorites
    await new Promise<void>((resolve) => {
      chrome.storage.local.set({ [retryFlag]: true }, () => resolve())
    })

    if (behavior === 'immediate_active') {
      // Redirect the current active tab (user is on OPAL page)
      const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (currentTab?.id) {
        chrome.tabs.update(currentTab.id, {
          url: 'https://bildungsportal.sachsen.de/opal/auth/resource/courses'
        })
      }
    } else {
      // background_load: User clicked from popup, open OPAL in a new tab
      chrome.tabs.create({
        url: 'https://bildungsportal.sachsen.de/opal/auth/resource/courses',
        active: true
      })
    }
    return
  }

  // 3 - Check if more than 25 courses
  if (courseLinks.length > 25) {
    const linkType = links === 'favoriten' ? t('content.background.favorites') : t('content.background.courses')

    if (behavior === 'immediate_active') {
      // Show alert in the current OPAL tab context
      const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (currentTab?.id) {
        chrome.scripting.executeScript({
          target: { tabId: currentTab.id },
          func: (message: string) => alert(message),
          args: [t('content.background.tooManyLinks', { type: linkType })]
        })
      }
    } else {
      // background_load: Silently fail since displayCourseList already disables the button
      console.warn(`Too many courses (${courseLinks.length}) for background_load mode`)
    }
    return
  }

  const isBackgroundLoad = behavior === 'background_load'
  // Delay for the cleanup operation
  const cleanupDelayMs = isBackgroundLoad ? 2000 : 1000

  // 4 - Determine Tab Index and capture original tab ID for immediate_active mode
  let startIndex: number | undefined
  let originalTabId: number | undefined
  try {
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (currentTab && typeof currentTab.index === 'number') {
      startIndex = currentTab.index + 1
    }
    // Capture the original tab ID before opening new tabs (for immediate_active mode)
    if (behavior === 'immediate_active' && currentTab?.id) {
      originalTabId = currentTab.id
    }
  } catch (e) {
    console.error('Cannot get current tab:', e)
    // Cannot get current tab, proceed without explicit index
  }

  // Use a Promise array to track the *creation* of all tabs
  const tabCreationPromises: Promise<chrome.tabs.Tab | undefined>[] = []

  // 5 - Open Tabs
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
      console.warn('Skipping invalid course link:', link)
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

  // 6 - Await all tab creation to get their IDs
  const openedTabs = await Promise.all(tabCreationPromises)
  const openedTabIds = openedTabs
    .filter((tab): tab is chrome.tabs.Tab => !!tab && typeof tab.id === 'number')
    .map((tab) => tab.id!) // Non-null assertion is safe after the filter

  const lastTabId = openedTabIds[openedTabIds.length - 1]

  // 7 - For immediate_active mode: Close the original OPAL tab after a delay
  // We must use the captured originalTabId because active tab switches to newly opened tabs
  if (behavior === 'immediate_active' && originalTabId) {
    const tabIdToClose = originalTabId // Capture the value
    setTimeout(() => {
      chrome.tabs.remove(tabIdToClose).catch((e) => {
        console.error('Error closing original tab:', e)
      })
    }, 1000)
  }

  // 8 - Cleanup and activate last tab
  // Use setTimeout to ensure cleanup happens *after* the tabs have had a chance to load
  setTimeout(() => {
    if (openedTabIds.length === 0) {
      return // No tabs were successfully opened
    }

    // Remove all tabs except the last one (for BOTH modes)
    const tabsToRemove = openedTabIds.slice(0, openedTabIds.length - 1)

    if (tabsToRemove.length > 0) {
      // NOTE: chrome.tabs.remove can take an array of IDs
      chrome.tabs.remove(tabsToRemove).catch((e) => {
        // Handle potential errors if tabs have already been closed
        console.error('Error removing old tabs:', e)
      })
    }

    // For background_load mode: Activate the last tab after cleanup
    if (isBackgroundLoad && lastTabId) {
      chrome.tabs.update(lastTabId, { active: true }).catch((e) => {
        // Handle potential errors if the tab has already been closed
        console.error('Error activating last tab:', e)
      })
    }

    // For immediate_active mode: Last tab is already active (set during creation)
  }, cleanupDelayMs)

  // 9 - Save Clicks
  saveClicks(2 * courseLinks.length)
}
