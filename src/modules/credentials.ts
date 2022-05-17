// info: user = username | pass = password
export interface UserData {
    user: string;
    pass: string;
}

interface UserDataStore {
    [platform: string]: UserData;
}

const isFirefox = typeof browser !== 'undefined' && browser.runtime && browser.runtime.getBrowserInfo

// create hash from input-string (can also be json of course)
// output hash is always of same length and is of type buffer
async function hashDigest (str: string) {
  return await crypto.subtle.digest('SHA-256', (new TextEncoder()).encode(str))
}

// get key for encryption
async function getKeyBuffer () {
  // async fetch of system information
  // Promisified until usage of Manifest V3
  const sysInfo = await new Promise<string>((resolve) => {
    let sysInfo: string = ''

    // key differs between browsers, because different APIs
    if (isFirefox) {
      sysInfo += window.navigator.hardwareConcurrency
    } else {
      // chrome, edge and everything else
      chrome.system.cpu.getInfo((info) => {
        delete info.processors
        if (info.temperatures) delete info.temperatures // Chrome OS only
        sysInfo += JSON.stringify(info)
      })
    }

    chrome.runtime.getPlatformInfo((info) => {
      sysInfo += JSON.stringify(info)
      resolve(sysInfo)
    })
  })

  // create key
  return await crypto.subtle.importKey('raw', await hashDigest(sysInfo),
    { name: 'AES-CBC' },
    false,
    ['encrypt', 'decrypt'])
}

export async function setUserData (userData: UserData, platform = 'zih') {
  if (!userData || !userData.user || !userData.pass || !platform) return

  // local function so it's not easily called from elsewhere
  const encode = async (decoded: string) => {
    const dataEncoded = (new TextEncoder()).encode(decoded)
    const keyBuffer = await getKeyBuffer()
    const iv = crypto.getRandomValues(new Uint8Array(16))

    // encrypt
    let dataEnc = await crypto.subtle.encrypt(
      {
        name: 'AES-CBC',
        iv: iv
      },
      keyBuffer,
      dataEncoded
    )

    // adjust format to save encrypted data in local storage
    dataEnc = Array.from(new Uint8Array(dataEnc))
    dataEnc = dataEnc.map(byte => String.fromCharCode(byte)).join('')
    dataEnc = btoa(dataEnc)
    const ivStr = Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join('')
    return ivStr + dataEnc
  }

  const user = await encode(userData.user)
  const pass = await encode(userData.pass)

  let dataObj: UserDataStore
  try {
    // Promisified until usage of Manifest V3
    const data = await new Promise((resolve) => chrome.storage.local.get(['udata'], (data) => resolve(data.udata)))
    if (typeof data !== 'string') throw Error()
    dataObj = JSON.parse(data)
  } catch {
    // data field is undefined or broken -> reset it
    dataObj = {}
  }
  dataObj[platform] = { user, pass }

  // Promisified until usage of Manifest V3
  await chrome.storage.local.set({ udata: JSON.stringify(dataObj) })
}

// check if username, password exist
export async function userDataExists (platform: string | undefined) {
  if (typeof platform === 'string') {
    // Query for a specific platform
    const { user, pass } = await getUserData(platform)
    return !!(user && pass)
  } else {
    // Query for any platform
    // Promisified until usage of Manifest V3
    const data = await new Promise((resolve) => chrome.storage.local.get(['udata'], (data) => resolve(data.udata)))
    if (typeof data !== 'string') return false

    try {
      const dataJson = JSON.parse(data)
      for (const platform of Object.keys(dataJson)) {
        const { user, pass } = await getUserData(platform)
        if (user && pass) return true
      }
    } catch { }
  }
  return false
}

// Legacy
export const loginDataExists = (platform = 'zih') => userDataExists(platform)

// return {user: string, pass: string}
// decrypt and return user data
// a lot of encoding and transforming needs to be done, in order to provide all values in the right format
export async function getUserData (platform: string = 'zih') {
  // get required data for decryption
  const keyBuffer = await getKeyBuffer()
  // Promisified until usage of Manifest V3
  const data = await new Promise((resolve) => chrome.storage.local.get(['udata'], (data) => resolve(data.udata)))

  // check if data exists, else return
  if (typeof data !== 'string' || !platform) {
    return ({ user: undefined, pass: undefined })
  }

  // local function so it's not easily called from elsewhere
  const decode = async (encoded: string) => {
    if (!encoded) return undefined
    const ivArr = encoded.slice(0, 32).match(/.{2}/g).map(byte => parseInt(byte, 16))
    const iv = new Uint8Array(ivArr)
    const dataEncryptedStr = atob(encoded.slice(32))
    const dataEncrypted = new Uint8Array(dataEncryptedStr.match(/[\s\S]/g).map(ch => ch.charCodeAt(0)))

    // decrypt
    const decoded = await crypto.subtle.decrypt(
      {
        name: 'AES-CBC',
        iv: iv
      },
      keyBuffer,
      dataEncrypted
    )

    // adjust to useable format
    return new TextDecoder().decode(decoded)
  }

  try {
    const userDataJson = JSON.parse(data)
    const { user: encUser, pass: encPass } = userDataJson[platform]
    return { user: await decode(encUser), pass: await decode(encPass) }
  } catch {
    return { user: undefined, pass: undefined }
  }
}

// return {user: string, pass: string}
// This is the old method to get the user data. It will be preserved until probably every installation uses the new format
export async function getUserDataLagacy () {
  // get required data for decryption
  const keyBuffer = await getKeyBuffer()
  // async fetch of user data
  // Promisified until usage of Manifest V3
  const data = await new Promise<string|undefined>((resolve) => chrome.storage.local.get(['Data'], (data) => resolve(data.Data)))

  // check if Data exists, else return
  if (data === undefined || data === 'undefined') {
    return ({ asdf: undefined, fdsa: undefined })
  }
  const ivSlice = data.slice(0, 32).match(/.{2}/g).map(byte => parseInt(byte, 16))
  const iv = new Uint8Array(ivSlice)
  const userDataEncryptedStr = atob(data.slice(32))
  const userDataEncrypted = new Uint8Array(userDataEncryptedStr.match(/[\s\S]/g).map(ch => ch.charCodeAt(0)))

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
