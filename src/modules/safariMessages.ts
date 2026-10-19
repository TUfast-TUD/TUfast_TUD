import * as credentials from './credentials'
import * as otp from './otp'

const credentialCommands = new Set([
  'get_user_data',
  'set_user_data',
  'delete_user_data',
  'check_user_data',
  'get_totp',
  'get_iotp',
  'set_otp',
  'check_otp',
  'delete_otp',
  'begin_login_attempt',
  'login_failed'
])

const zihHosts = new Set([
  'idp.tu-dresden.de',
  'idp2.tu-dresden.de',
  'bildungsportal.sachsen.de',
  'selma.tu-dresden.de',
  'qis.dez.tu-dresden.de',
  'matrix.tu-dresden.de',
  'msx.tu-dresden.de',
  'cloudstore.zih.tu-dresden.de',
  'elearning.med.tu-dresden.de',
  'eportal.med.tu-dresden.de',
  'lskonline.tu-dresden.de',
  'tex.zih.tu-dresden.de',
  'videocampus.sachsen.de',
  'gitlab.mn.tu-dresden.de',
  'se-gitlab.inf.tu-dresden.de',
  'git.imld.de',
  'gitlab.hrz.tu-chemnitz.de'
])

let attemptQueue: Promise<unknown> = Promise.resolve()

export function isSafariCredentialCommand(command: string): boolean {
  return credentialCommands.has(command)
}

export function isTrustedExtensionPage(sender: chrome.runtime.MessageSender): boolean {
  return !!sender.url?.startsWith(chrome.runtime.getURL(''))
}

export function isSafariLoginSender(sender: chrome.runtime.MessageSender, platform: string): boolean {
  try {
    const url = new URL(sender.url || '')
    if (url.protocol !== 'https:') return false
    if (platform === 'zih') return zihHosts.has(url.hostname)
    return platform === 'slub' && (url.hostname === 'slub-dresden.de' || url.hostname.endsWith('.slub-dresden.de'))
  } catch {
    return false
  }
}

async function beginLoginAttempt(sender: chrome.runtime.MessageSender, platform: string): Promise<boolean> {
  const next = attemptQueue.then(async () => {
    const { isEnabled, safariLoginAttempts = {} } = await chrome.storage.local.get(['isEnabled', 'safariLoginAttempts'])
    if (!isEnabled) return false
    const key = `${platform}:${new URL(sender.url || '').origin}`
    const previous = safariLoginAttempts[key]
    const now = Date.now()
    const count = previous && now - previous.time < 60000 ? previous.count + 1 : 1
    if (count > 3) {
      await chrome.storage.local.set({ isEnabled: false, safariLoginPaused: true })
      return false
    }
    safariLoginAttempts[key] = { count, time: now }
    await chrome.storage.local.set({ safariLoginAttempts })
    return true
  })
  attemptQueue = next.catch(() => {})
  return await next
}

export async function handleSafariCredentialMessage(request: any, sender: chrome.runtime.MessageSender) {
  const platform = request.platform ?? 'zih'
  if (platform !== 'zih' && platform !== 'slub') throw new Error('Unknown platform')
  const trusted = isTrustedExtensionPage(sender)
  const portal = isSafariLoginSender(sender, platform)
  const command = request.cmd
  const enrollment =
    sender.url?.split(/[?#]/)[0] === 'https://selfservice.tu-dresden.de/services/idm/token/create' && platform === 'zih'
  const readCommands = ['get_user_data', 'get_totp', 'get_iotp', 'begin_login_attempt', 'login_failed']
  if (!trusted && !(portal && readCommands.includes(command)) && !(enrollment && command === 'set_otp')) {
    throw new Error('Unauthorized credential request')
  }
  if (!trusted && (command === 'get_totp' || command === 'get_iotp')) {
    const host = new URL(sender.url || '').hostname
    if (!['idp.tu-dresden.de', 'idp2.tu-dresden.de'].includes(host)) throw new Error('Unauthorized OTP request')
  }
  switch (command) {
    case 'begin_login_attempt':
      return await beginLoginAttempt(sender, platform)
    case 'login_failed':
      await chrome.storage.local.set({ isEnabled: false, safariLoginPaused: true })
      return true
    case 'get_user_data':
      return await credentials.getUserData(platform)
    case 'set_user_data':
      if (
        typeof request.userData?.user !== 'string' ||
        !request.userData.user ||
        typeof request.userData?.pass !== 'string' ||
        !request.userData.pass
      )
        throw new Error('Invalid credentials')
      await credentials.setUserData(request.userData, platform)
      break
    case 'delete_user_data':
      await credentials.deleteUserData(platform)
      break
    case 'check_user_data':
    case 'check_otp': {
      if (command === 'check_user_data' && request.platform === undefined)
        return await credentials.userDataExists(undefined)
      const checks = [platform + '-totp', platform + '-iotp']
      if (command === 'check_user_data') checks.push(platform)
      return (await Promise.all(checks.map((name) => credentials.userDataExists(name)))).some(Boolean)
    }
    case 'get_totp':
      return await otp.getTOTP(platform)
    case 'get_iotp':
      if (
        !Array.isArray(request.indexes) ||
        request.indexes.length !== 2 ||
        !request.indexes.every((index: number) => Number.isInteger(index) && index >= 0 && index < 25)
      )
        return null
      return await otp.getIOTP(platform, ...request.indexes)
    case 'set_otp': {
      const { otpType, secret } = request
      if (typeof secret !== 'string' || !secret || !['totp', 'iotp'].includes(otpType)) throw new Error('Invalid OTP')
      await credentials.setUserData({ user: otpType, pass: secret }, `${platform}-${otpType}`)
      await credentials.deleteUserData(`${platform}-${otpType === 'totp' ? 'iotp' : 'totp'}`)
      break
    }
    case 'delete_otp':
      await credentials.deleteUserData(platform + '-totp')
      await credentials.deleteUserData(platform + '-iotp')
      break
  }
  await chrome.runtime.sendMessage({ cmd: 'credentials_updated', platform }).catch(() => {})
  return true
}
