export function isFirefox (): boolean {
  return !!(typeof globalThis.browser !== 'undefined' && globalThis.browser.runtime && globalThis.browser.runtime.getBrowserInfo)
}

export function getBrowserNetRequestPermissions (): string[] {
  return isFirefox() ? ['webRequest', 'webRequestBlocking'] : ['declarativeNetRequestWithHostAccess']
}
