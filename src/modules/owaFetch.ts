import { getUserData } from './credentials'

// function for custom URIEncoding
function customURIEncoding(str: string) {
  str = encodeURIComponent(str)
  str = str.replace('!', '%21').replace("'", '%27').replace('(', '%28').replace(')', '%29').replace('~', '%7E')
  return str
}

// function to log msx.tu-dresden.de/owa/ and retrieve the .json containing information about EMails
export async function fetchOWA(username: string, password: string, logout: boolean) {
  // encodeURIComponent and encodeURI are not working for all chars. See documentation. Thats why I implemented custom encoding.
  username = customURIEncoding(username)
  password = customURIEncoding(password)

  // login
  await fetch('https://msx.tu-dresden.de/owa/auth.owa', {
    headers: {
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
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
    referrer:
      'https://msx.tu-dresden.de/owa/auth/logon.aspx?replaceCurrent=1&url=https%3a%2f%2fmsx.tu-dresden.de%2fowa%2f%23authRedirect%3dtrue',
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: `destination=https%3A%2F%2Fmsx.tu-dresden.de%2Fowa%2F%23authRedirect%3Dtrue&flags=4&forcedownlevel=0&username=${username}&password=${password}&passwordText=&isUtf8=1`,
    method: 'POST',
    mode: 'no-cors',
    credentials: 'include'
  })

  const owaResp = await fetch('https://msx.tu-dresden.de/owa/', {
    headers: {
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'accept-language': 'de-DE,de;q=0.9,en-DE;q=0.8,en-GB;q=0.7,en-US;q=0.6,en;q=0.5',
      'cache-control': 'max-age=0',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'Access-Control-Allow-Origin': '*',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1'
    },
    referrer:
      'https://msx.tu-dresden.de/owa/auth/logon.aspx?replaceCurrent=1&url=https%3a%2f%2fmsx.tu-dresden.de%2fowa',
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: null,
    method: 'GET',
    mode: 'cors',
    credentials: 'include'
  })

  const respText = await owaResp.text()
  const searchString = "window.clientId = '"
  const idxStart = respText.indexOf(searchString)
  const idxEnd = respText.indexOf("'", idxStart + searchString.length)
  if (idxStart === -1 || idxEnd === -1) {
    // console.error(respText)
    return
  }
  const clientId = respText.substring(idxStart + 1, idxEnd)
  const corrId = clientId + '_' + new Date().getTime()

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
    body: null,
    method: 'POST',
    mode: 'cors',
    credentials: 'include'
  })

  const mailInfoJson = await mailInfoRsp.json()

  // only logout, if user is not using owa in browser session
  if (logout) {
    // console.log('Logging out from owa..')
    await fetch('https://msx.tu-dresden.de/owa/logoff.owa', {
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
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
      body: null,
      method: 'GET',
      mode: 'cors',
      credentials: 'include'
    })
  }

  return mailInfoJson
}

// extract number of unread messages in owa
export function countUnreadMsg(json: any) {
  // console.log(json)
  const folder = json.findFolders.Body.ResponseMessages.Items[0].RootFolder.Folders.find(
    (obj) => obj.DisplayName === 'Inbox' || obj.DisplayName === 'Posteingang'
  )
  return folder.UnreadCount
}

// checks, if user currently uses owa in browser
export async function owaIsOpened() {
  const uri = 'msx.tu-dresden.de'
  const tabs = await getAllChromeTabs()
  // Find element with msx in uri, -1 if none found
  if (tabs.findIndex((element) => element.url?.includes(uri)) >= 0) {
    // console.log('currently opened owa')
    return true
  } else return false
}

async function getAllChromeTabs() {
  return await chrome.tabs.query({})
}

// start OWA fetch funtion based on interval
export async function enableOWAFetch(): Promise<boolean> {
  // console.log('starting to fetch from owa...');

  // Chrome types deprecated, https://developer.chrome.com/docs/extensions/reference/permissions/#method-request
  const granted = await (chrome.permissions as any).request({ permissions: ['tabs'] })
  if (granted) {
    await chrome.storage.local.set({ enabledOWAFetch: true })
  } else {
    alert(
      "TUfast braucht diese Berechtigung, um regelm\u00e4\u00dfig alle Mails abzurufen. Bitte dr\u00fccke auf 'Erlauben'."
    )
    await disableOWAFetch()
    return false
  }

  await enableOWAAlarm()
  return true
}

export async function enableOWAAlarm() {
  // Chrome types deprecated, https://developer.chrome.com/docs/extensions/reference/permissions/#method-contains
  const granted = await (chrome.permissions as any).contains({ permissions: ['tabs'] })
  if (!granted) return

  chrome.alarms.create('fetchOWAAlarm', { delayInMinutes: 5, periodInMinutes: 5 })
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'fetchOWAAlarm') await owaFetch()
  })

  await owaFetch()
}

export async function disableOWAFetch() {
  // console.log('stopped owa connection')
  await chrome.storage.local.set({ enabledOWAFetch: false })

  await setBadgeUnreadMails(0)
  await chrome.alarms.clear('fetchOWAAlarm')
  await chrome.storage.local.remove(['numberOfUnreadMails', 'additionalNotificationOnNewMail'])
  await chrome.permissions.remove({ permissions: ['tabs'] })
}

export async function readMailOWA(numberOfUnreadMails: number) {
  // set badge and local storage
  await chrome.storage.local.set({ numberOfUnreadMails })
  await setBadgeUnreadMails(numberOfUnreadMails)
}

export async function setBadgeUnreadMails(numberOfUnreadMails: number) {
  // set badge
  if (!numberOfUnreadMails) {
    await showBadge('', '#4cb749')
  } else if (numberOfUnreadMails > 99) {
    await showBadge('99+', '#4cb749')
  } else {
    await showBadge(numberOfUnreadMails.toString(), '#4cb749')
  }
}

// show badge
async function showBadge(text: string, color: string) {
  await chrome.action.setBadgeText({ text })
  await chrome.action.setBadgeBackgroundColor({ color })
}

export async function owaFetch() {
  // dont logout if user is currently using owa in browser
  const logout = !(await owaIsOpened())
  console.log('Executing OWA fetch ...')

  // get user data
  const { user, pass } = await getUserData('zih')
  if (!user || !pass) return
  // call fetch
  const mailInfoJson = await fetchOWA(user, pass, logout).catch(() => {})
  if (!mailInfoJson) return
  // check # of unread mails
  const numberOfUnreadMails = countUnreadMsg(mailInfoJson)
  // console.log('Unread mails in OWA: ' + numberOfUnreadMails)

  // alert on new Mail
  const result = await chrome.storage.local.get(['numberOfUnreadMails', 'additionalNotificationOnNewMail'])
  const oldUnread = result.numberOfUnreadMails || 0
  const notificationGranted = await (chrome.permissions as any).contains({ permissions: ['notifications'] })

  if (notificationGranted && result.additionalNotificationOnNewMail && oldUnread < numberOfUnreadMails) {
    // Promisified notification, currently no async support https://developer.chrome.com/docs/extensions/reference/notifications/#method-create
    await new Promise<void>((resolve) =>
      chrome.notifications.create(
        'tuFastNewEmailNotification',
        {
          type: 'basic',
          message: `Du hast ${numberOfUnreadMails} neue E-Mail${numberOfUnreadMails > 1 ? 's' : ''}`,
          title: 'Neue E-Mails',
          iconUrl: '/assets/icons/RocketIcons/default_128px.png'
        },
        (_id) => resolve(undefined)
      )
    )
  }

  // set badge and local storage
  await chrome.storage.local.set({ numberOfUnreadMails })
  await setBadgeUnreadMails(numberOfUnreadMails)
}

export async function enableOWANotifications(): Promise<boolean> {
  const granted = await (chrome.permissions as any).request({ permissions: ['notifications'] })
  if (granted) {
    await chrome.storage.local.set({ additionalNotificationOnNewMail: true })
  } else {
    await chrome.storage.local.set({ additionalNotificationOnNewMail: false })
    alert(
      "TUfast braucht diese Berechtigung, um dir zus\u00e4tzliche Benachrichtigungen zu senden. Bitte dr\u00fccke auf 'Erlauben'."
    )
    return false
  }

  registerNotificationClickListener()
  return true
}

export async function disableOWANotifications() {
  await chrome.storage.local.set({ additionalNotificationOnNewMail: false })
  if (chrome.notifications) chrome.notifications.onClicked.removeListener(notificationListener)
  await (chrome.permissions as any).remove({ permissions: ['notifications'] }).catch(() => {
    /* ignore */
  })
}

export function registerNotificationClickListener() {
  // register listener for owaFetch notifications
  chrome.notifications.onClicked.addListener(notificationListener)
}

async function notificationListener(id: string) {
  if (id === 'tuFastNewEmailNotification') {
    await chrome.tabs.create({ url: 'https://msx.tu-dresden.de/owa/' })
  }
}

export async function checkOWAStatus(): Promise<{ fetch: boolean; notification: boolean }> {
  const result = await chrome.storage.local.get(['enabledOWAFetch', 'additionalNotificationOnNewMail'])
  return {
    fetch: !!result.enabledOWAFetch,
    notification: !!result.additionalNotificationOnNewMail
  }
}
