const necessaryPermissions = {
  cookies: 'Wir brauchen Zugriff auf Cookies, damit wir Funktionalität gewährleisten können.'
}

let toBeGranted = Object.keys(necessaryPermissions)

const container = document.getElementById('container')

function createPermissionButton (permission, reason) {
  const div = document.createElement('div')
  const reasonText = document.createElement('p')
  reasonText.innerText = reason
  const extraText = document.createElement('p')
  const button = document.createElement('button')
  button.innerText = 'Erlauben'
  button.addEventListener('click', () => {
    chrome.permissions.request({ permissions: [permission] }, (granted) => {
      if (granted) {
        toBeGranted = toBeGranted.filter(p => p !== permission)
        extraText.innerText = 'Perfekt, Danke!'
        button.setAttribute('disabled', true)
      } else {
        extraText.innerText = 'Das hat nicht geklappt, bitte versuch es noch einmal!'
      }
    })
  })

  div.appendChild(reasonText)
  div.appendChild(extraText)
  div.appendChild(button)
  return div
}

for (const [permission, reason] of Object.entries(necessaryPermissions)) {
  chrome.permissions.contains({ permissions: [permission] }, (granted) => {
    if (!granted) container?.appendChild(createPermissionButton(permission, reason))
  })
}
