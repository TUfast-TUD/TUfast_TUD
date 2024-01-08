const qrAvailable = !!document.getElementById('qr-code')
const seedLink = document.querySelector('#seed-link a[href="otpauth://totp/"]')

const indexedAvailable = document.getElementById('indexed-secret')

if (qrAvailable && seedLink && showWarning()) {
  const seed = seedLink.getAttribute('href');
  if (seed) {
    chrome.runtime.sendMessage({ cmd: 'set_user_data', userData: { user: "totp", pass: seed }, platform: "zih-totp" })
  }
} else if (!!indexedAvailable && showWarning()) {
  const cols = indexedAvailable.querySelectorAll('tr:nth-of-type(2) td') as NodeListOf<HTMLTableCellElement>
  // Maybe the ZIH will change the number of chars in the future
  // Update it here!
  if (cols.length === 25) {
    const secret = Array.from(cols).map((col) => col.innerText).reduce((acc, cur) => acc + cur, '')
    chrome.runtime.sendMessage({ cmd: 'set_user_data', userData: { user: "iotp", pass: secret }, platform: "zih-iotp" })
  }
}

function showWarning(): boolean {
  return confirm('TUfast kann diesen 2-Faktor-Code für dich speichern und automatisch an den entsprechenden einfügen. Dies geht jedoch gegen den Sinn eines zweiten Faktors und ist noch in Entwicklung.\n\nSPEICHERE DIR DEN CODE AUF JEDEN FALL AUCH AN EINER ANDEREN STELLE!\n\nSoll TUfast für dich die 2-Faktor-Authentifizierung übernehmen?')
}