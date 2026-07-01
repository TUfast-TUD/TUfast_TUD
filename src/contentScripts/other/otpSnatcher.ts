const otpSnatcherStrings = globalThis.TUFAST_STRINGS.otp
const qrAvailable = !!document.getElementById('qr-code')
const seedLink = document.querySelector('#seed-link a[href^="otpauth://totp/"]')

const indexedAvailable = document.getElementById('indexed-secret')

if (qrAvailable && seedLink && showWarning()) {
  const seed = seedLink.getAttribute('href')
  if (seed) {
    const secret = new URL(seed).searchParams.get('secret')
    chrome.runtime.sendMessage({ cmd: 'set_otp', otpType: 'totp', secret, platform: 'zih' })
  }
} else if (!!indexedAvailable && showWarning()) {
  const cols = Array.from(indexedAvailable.querySelectorAll('tr:nth-of-type(2) td'))
  // Maybe the ZIH will change the number of chars in the future
  // Update it here!
  if (cols.length === 25) {
    const secret = cols.map((col) => (col as HTMLTableCellElement).innerText).reduce((acc, cur) => acc + cur, '')
    chrome.runtime.sendMessage({ cmd: 'set_otp', otpType: 'iotp', secret, platform: 'zih' })
  }
}

function showWarning(): boolean {
  return confirm(otpSnatcherStrings.snatcherConfirm)
}
