// global vars
const isFirefox = navigator.userAgent.includes('Firefox/') // attention: no failsave browser detection
const webstorelink = isFirefox ? 'https://addons.mozilla.org/de/firefox/addon/tufast/?utm_source=addons.mozilla.org&utm_medium=referral&utm_content=search' : 'https://chrome.google.com/webstore/detail/tufast-tu-dresden/aheogihliekaafikeepfjngfegbnimbk?hl=de'

const availableThemes = {
  system: 'System theme',
  light: 'Light theme',
  dark: 'Dark theme'
}

async function applyTheme (theme) {
  if (theme in availableThemes) {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', theme)
    }

    // Promisified until usage of Manifest V3
    await new Promise((resolve) => chrome.storage.local.set({ theme: theme }, resolve))

    // update switcher
    document.querySelector('#themeSwitcher > .theme-text').innerHTML = availableThemes[theme]
  } else {
    console.error('invalid theme: ' + theme)
  }
}

async function nextTheme () {
  const themeOrder = Object.keys(availableThemes)
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'system'
  const idx = (themeOrder.indexOf(currentTheme) + 1) % themeOrder.length

  await applyTheme(themeOrder[idx])
}

async function changePlatform (e) {
  const platform = e.target.value
  let [usernameExtraHint, usernameFieldHint, passwordFieldHint] = ['', '', '']
  switch (platform) {
    case 'zih':
      usernameFieldHint = 'Nutzername (selma-Login)'
      passwordFieldHint = 'Passwort (selma-Login)'
      usernameExtraHint = '(ohne @mailbox.tu-dresden.de. Also z.B. "s3276763" oder "luka075d")'
      break
    case 'slub':
      usernameFieldHint = 'Benutzernummer (SLUB-Login)'
      passwordFieldHint = 'Passwort (SLUB-Login)'
      usernameExtraHint = '(die Nutzernummer findest du u.a. auf deiner SLUB-Karte)'
  }
  document.getElementById('username_field').setAttribute('placeholder', usernameFieldHint)
  document.getElementById('password_field').setAttribute('placeholder', passwordFieldHint)
  document.getElementById('user_extra_hint').innerHTML = usernameExtraHint
  await updatePlatformStatus(platform)
}

async function saveUserData () {
  const platform = document.getElementById('platform_select')?.value || 'zih'
  const user = document.getElementById('username_field')?.value
  const pass = document.getElementById('password_field')?.value
  if (!user || !pass) {
    document.getElementById('status_platform').innerHTML = '<span class="red-text">Die Felder d&uuml;rfen nicht leer sein!</span>'
    return false
  } else {
    // Promisified until usage of Manifest V3
    await new Promise((resolve) => chrome.storage.local.set({ isEnabled: true }, resolve)) // need to activate auto login feature
    chrome.runtime.sendMessage({ cmd: 'clear_badge' })
    await new Promise((resolve) => chrome.runtime.sendMessage({ cmd: 'set_user_data', userData: { user, pass }, platform }, resolve))
    document.getElementById('save_data').innerHTML = '<span>Gespeichert!</span>'
    document.getElementById('save_data').disabled = true
    document.getElementById('username_field').value = ''
    document.getElementById('password_field').value = ''
    await updatePlatformStatus(platform)
    await updateSavedStatus()
    setTimeout(() => {
      document.getElementById('save_data').innerHTML = 'Speichern'
      document.getElementById('save_data').disabled = false
    }, 2000)
  }
}

async function deleteUserData () {
  chrome.runtime.sendMessage({ cmd: 'clear_badge' })
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.remove([
    'udata', // this is how to delete user data!
    'meine_kurse', // delete opal courses
    'favoriten', // delete opal courses
    'isEnabled'], resolve)) // need to deactivate auto login feature
  // --
  // -- also deactivate owa fetch
  document.getElementById('owa_mail_fetch').checked = false
  chrome.runtime.sendMessage({ cmd: 'disable_owa_fetch' })
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({
    enabledOWAFetch: false,
    additionalNotificationOnNewMail: false
  }, resolve))
  document.getElementById('additionalNotification').checked = false
  // --
  document.getElementById('delete_data').innerHTML = '<span>Gel&ouml;scht!</span>'
  document.getElementById('delete_data').setAttribute('class', 'button-accept')
  document.getElementById('delete_data').disabled = true
  document.getElementById('username_field').value = ''
  document.getElementById('password_field').value = ''
  document.getElementById('status_platform').innerHTML = '<span class="gray-text">Derzeit sind keine Daten für diese Platform gespeichert.</span>'
  document.getElementById('status_msg').innerHTML = '<span class="grey-text">Derzeit sind keine Logindaten gespeichert.</span>'
  setTimeout(() => {
    document.getElementById('delete_data').innerHTML = 'Alle Daten l&ouml;schen'
    document.getElementById('delete_data').setAttribute('class', 'button-deny')
    document.getElementById('delete_data').disabled = false
  }, 2000)
}

async function fwdGoogleSearch () {
  // Promisified until usage of Manifest V3
  const result = await new Promise((resolve) => chrome.storage.local.get(['fwdEnabled'], resolve))
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({ fwdEnabled: !(result.fwdEnabled) }, resolve))
}

async function checkSelectedRocket () {
  // Promisified until usage of Manifest V3
  const res = await new Promise((resolve) => chrome.storage.local.get(['selectedRocketIcon'], resolve))
  try {
    const icon = JSON.parse(res.selectedRocketIcon)
    document.getElementById(icon.id).checked = true
  } catch {
    console.error('Cannot set rocket icon')
  }
}

// set switches and other elements
async function displayEnabled () {
  const result = await new Promise((resolve) => chrome.storage.local.get([
    'fwdEnabled',
    'enabledOWAFetch',
    'additionalNotificationOnNewMail',
    'studiengang',
    'openSettingsPageParam',
    'pdfInInline',
    'pdfInNewTab'
    // 'dashboardDisplay'
  ], resolve))

  // '!!' should be used in checkboxes if value is undefined. Value will be false then
  document.getElementById('switch_fwd').checked = !!result.fwdEnabled
  document.getElementById('owa_mail_fetch').checked = !!result.enabledOWAFetch
  document.getElementById('additionalNotification').checked = !!result.additionalNotificationOnNewMail

  if (result.openSettingsPageParam === 'add_studiengang') {
    document.getElementById('studiengangSelect').value = 'add'
    document.getElementById('addStudiengang').style.display = 'block'
  } else if (!result.studiengang || result.studiengang === 'general') {
    document.getElementById('studiengangSelect').value = 'general'
  } else {
    document.getElementById('studiengangSelect').value = result.studiengang
  }

  document.getElementById('switch_pdf_inline').checked = !!result.pdfInInline
  if (!result.pdfInInline) {
    document.getElementById('switch_pdf_newtab_block').style.visibility = 'hidden'
  }

  document.getElementById('switch_pdf_newtab').checked = result.pdfInNewTab
  await updatePlatformStatus(document.getElementById('status_platform').value)

  /*
    if(result.dashboardDisplay === "favoriten") {document.getElementById('fav').checked = true}
    if(result.dashboardDisplay === "meine_kurse") {document.getElementById('crs').checked = true}
  }) */
}

// handle dashboard course select customization
/* function dashboardCourseSelect () {
  if(document.getElementById('fav').checked) {
    chrome.storage.local.set({dashboardDisplay: "favoriten"}, function() {})
  }else if(document.getElementById('crs').checked) {
    chrome.storage.local.set({dashboardDisplay: "meine_kurse"}, function() {})
  }
} */

async function updatePlatformStatus (platform = 'zih') {
  const statusField = document.getElementById('status_platform')
  statusField.innerHTML = ''
  const dataSet = await new Promise((resolve) => chrome.runtime.sendMessage({ cmd: 'check_user_data', platform }, resolve))
  if (dataSet) statusField.innerHTML = '<span class="green-text">Deine Zugangsdaten für diese Platform sind gespeichert!</span>'
  else statusField.innerHTML = '<span class="gray-text">Derzeit sind keine Daten für diese Platform gespeichert.</span>'
}

async function updateSavedStatus () {
  const statusField = document.getElementById('status_msg')
  const platformOption = document.getElementById('platform_select').children
  const dataSaved = []
  for (const platform of platformOption) {
    const platformName = platform.value
    const dataSet = await new Promise((resolve) => chrome.runtime.sendMessage({ cmd: 'check_user_data', platform: platformName }, resolve))
    if (dataSet) dataSaved.push(platform.innerHTML)
  }
  if (dataSaved.length === 0) {
    statusField.innerHTML = '<span class="grey-text">Derzeit sind keine Logindaten gespeichert.</span>'
  } else {
    statusField.innerHTML = `<span class="green-text">Derzeit gespeichert sind Logindaten für: ${dataSaved.join(', ')}</span>`
  }
}

// eslint-disable-next-line no-unused-vars
function clicksToTime (clicks) {
  const clicksCalc = clicks * 3
  const secs = clicksCalc % 60
  const mins = Math.floor(clicksCalc / 60)
  return '<strong>' + clicks + ' Klicks &#x1F5B1</strong> und <strong>' + mins + 'min ' + secs + 's</strong> &#9202; gespart!'
}

function clicksToTimeNoIcon (clicks) {
  const clicksCalc = clicks * 3
  const secs = clicksCalc % 60
  const mins = Math.floor(clicksCalc / 60)
  return '<strong>' + clicks + ' Klicks </strong> und <strong>' + mins + 'min ' + secs + 's</strong> gespart!'
}

async function openKeyboardSettings () {
  chrome.runtime.sendMessage({ cmd: 'open_shortcut_settings' })
}

async function toggleOWAfetch () {
  // NOTE: not required to check for permission. Browser will only ask for permission, if not given yet!
  // check for optional tabs permission
  // await chrome.permissions.contains({
  //  permissions: ['tabs'],
  // }, async function(gotPermission) {
  //    if (gotPermission) {
  //      enableOWAFetch()
  //    }
  //    else {
  // request permission
  // Promisified until usage of Manifest V3
  const granted = await new Promise((resolve) => chrome.permissions.request({ permissions: ['tabs'] }, resolve))
  if (granted) {
    await enableOWAFetch()
  } else {
    // Promisified until usage of Manifest V3
    await new Promise((resolve) => chrome.storage.local.set({ enabledOWAFetch: false }, resolve))
    document.getElementById('owa_mail_fetch').checked = false
    alert("TUfast braucht diese Berechtigung, um regelmaessig alle Mails abzurufen. Bitte druecke auf 'Erlauben'.")
  }
  //    }
  //  }
  // );
}

async function enableOWAFetch () {
  // Promisified until usage of Manifest V3
  const result = await new Promise((resolve) => chrome.storage.local.get(['enabledOWAFetch'], resolve))
  if (result.enabledOWAFetch) {
    // disable
    chrome.runtime.sendMessage({ cmd: 'disable_owa_fetch' })
    // Promisified until usage of Manifest V3
    await new Promise((resolve) => chrome.storage.local.set({
      enabledOWAFetch: false,
      additionalNotificationOnNewMail: false
    }, resolve))

    document.getElementById('additionalNotification').checked = false
  } else {
    // Promisified until usage of Manifest V3
    const resp = await new Promise((resolve) => chrome.runtime.sendMessage({ cmd: 'get_user_data' }, resolve))
    const userData = await resp
    // check if user data is saved
    if (userData.user && userData.pass) {
      document.getElementById('owa_fetch_msg').innerHTML = ''
      // Promisified until usage of Manifest V3
      await new Promise((resolve) => chrome.storage.local.set({
        enabledOWAFetch: true,
        openSettingsPageParam: 'mailFetchSettings',
        openSettingsOnReload: true
      }, resolve))
      // reload chrome extension is necessary
      alert('Perfekt! Bitte starte den Browser einmal neu, damit die Einstellungen uebernommen werden!')
      chrome.runtime.sendMessage({ cmd: 'reload_extension' })
    } else {
      document.getElementById('owa_fetch_msg').innerHTML = '<span class="red-text">Speichere deine Login-Daten im Punkt \'Automatisches Anmelden in Opal, Selma & Co.\' um diese Funktion zu nutzen!</span>'
      document.getElementById('owa_mail_fetch').checked = false
    }
  }
}

async function getAvailableRockets () {
  // Promisified until usage of Manifest V3
  const availableRockets = await new Promise((resolve) => chrome.storage.local.get(['availableRockets'], (resp) => resolve(resp.availableRockets)))
  return availableRockets || {} // To prevent errors when undefined
}

const rocketIconsConfig = {

  RI4: {
    IconPathEnabled: '../../assets/icons/RocketIcons/4_103px.png',
    IconPathDisabled: '../../assets/icons/RocketIcons/4_grey_103px.png',
    innerHTMLToEnable: '&nbsp;&nbsp;Spare mehr als 250 Klicks.',
    innerHTMLEnabled: '&nbsp;&nbsp;Mehr als 250 Klicks gespart. TUfast scheint n&uuml;tzlich!',
    id: 'RI4'
  },
  RI5: {
    IconPathEnabled: '../../assets/icons/RocketIcons/13_128px.png',
    IconPathDisabled: '../../assets/icons/RocketIcons/13_grey_128px.png',
    innerHTMLToEnable: '&nbsp;&nbsp;Spare mehr als 2500 Klicks. Du bist Profi!',
    innerHTMLEnabled: '&nbsp;&nbsp;Mehr als 2500 Klicks gespart. TUfast ist n&uuml;tzlich!',
    id: 'RI5'
  },
  RI3: {
    IconPathEnabled: '../../assets/icons/RocketIcons/7_128px.png',
    IconPathDisabled: '../../assets/icons/RocketIcons/7_grey_128px.png',
    innerHTMLToEnable: '&nbsp;&nbsp;Finde das Easteregg!',
    innerHTMLEnabled: '&nbsp;&nbsp;Easteregg gefunden :)',
    id: 'RI3'
  },
  RI2: {
    IconPathEnabled: '../../assets/icons/RocketIcons/2_128px.png',
    IconPathDisabled: '../../assets/icons/RocketIcons/2_grey_128px.png',
    innerHTMLToEnable: "&nbsp;&nbsp;Du findest TUfast n&uuml;tzlich? Erz&auml;hle es zwei Leuten mit &#128073;<a target='_blank' href='mailto:?subject=Probiere%20mal%20TUfast!%20%F0%9F%9A%80&body=Hey%20%3A)%0A%0Akennst%20du%20schon%20TUfast%3F%0A%0ATUfast%20hilft%20beim%20t%C3%A4glichen%20Arbeiten%20mit%20den%20Online-Portalen%20der%20TU%20Dresden.%0ADamit%20spare%20ich%20viel%20Zeit%20und%20nervige%20Klicks.%0A%0ATUfast%20ist%20eine%20Erweiterung%20f%C3%BCr%20den%20Browser%20und%20wurde%20von%20Studenten%20entwickelt.%0AProbiere%20es%20jetzt%20auf%20www.tu-fast.de%20!%0A%0ALiebe%20Gr%C3%BC%C3%9Fe%C2%A0%F0%9F%96%90'>E-Mail</a>, um diese schicke Rakete freizuschalten!",
    innerHTMLEnabled: "&nbsp;&nbsp;Diese Rakete hast du dir verdient! Mit <a target='_blank' href='mailto:?subject=Probiere%20mal%20TUfast!%20%F0%9F%9A%80&body=Hey%20%3A)%0A%0Akennst%20du%20schon%20TUfast%3F%0A%0ATUfast%20hilft%20beim%20t%C3%A4glichen%20Arbeiten%20mit%20den%20Online-Portalen%20der%20TU%20Dresden.%0ADamit%20spare%20ich%20viel%20Zeit%20und%20nervige%20Klicks.%0A%0ATUfast%20ist%20eine%20Erweiterung%20f%C3%BCr%20den%20Browser%20und%20wurde%20von%20Studenten%20entwickelt.%0AProbiere%20es%20jetzt%20auf%20www.tu-fast.de%20!%0A%0ALiebe%20Gr%C3%BC%C3%9Fe%C2%A0%F0%9F%96%90'>E-Mail</a> empfohlen.",
    id: 'RI2'
  },
  RI6: {
    IconPathEnabled: '../../assets/icons/RocketIcons/6_128px.png',
    IconPathDisabled: '../../assets/icons/RocketIcons/6_grey_128px.png',
    innerHTMLToEnable: "&nbsp;&nbsp;Gef&auml;llt dir TUfast? Oder hast du Anmerkdungen? Dann hinterlasse eine Bewertung im &#128073;<a target='_blank' href=" + webstorelink + '>Webstore</a>!',
    innerHTMLEnabled: '&nbsp;&nbsp;Danke f&uuml;r deine Bewertung im Webstore!',
    id: 'RI6'
  },
  RI1: {
    IconPathEnabled: '../../assets/icons/RocketIcons/1_128px.png',
    IconPathDisabled: '../../assets/icons/RocketIcons/1_grey_128px.png',
    innerHTMLToEnable: "&nbsp;&nbsp;Coole Dinge Teilen ist dein Ding? Teile TUfast mit zwei Freunden auf &#128073;<a href='https://api.whatsapp.com/send?text=Hey%2C%20kennst%20du%20schon%20TUfast%3F%20%F0%9F%9A%80%0A%0AMacht%20das%20arbeiten%20mit%20allen%20Online-Portalen%20der%20TU%20Dresden%20produktiver%20und%20hat%20mir%20schon%20viel%20Zeit%20und%20nervige%20Klicks%20gespart.%20Eine%20richtig%20n%C3%BCtzliche%20Browsererweiterung%20f%C3%BCr%20Studenten!%0A%0AProbiers%20gleich%20mal%20aus%3A%20www.tu-fast.de%20%F0%9F%96%90' data-action='share/whatsapp/share' target='_blank'>WhatsApp</a> und sammle diese tolle Rakete!",
    innerHTMLEnabled: "&nbsp;&nbsp;Danke f&uuml;r deine Unterst&uuml;tzung! Mit <a href='https://api.whatsapp.com/send?text=Hey%2C%20kennst%20du%20schon%20TUfast%3F%20%F0%9F%9A%80%0A%0AMacht%20das%20arbeiten%20mit%20allen%20Online-Portalen%20der%20TU%20Dresden%20produktiver%20und%20hat%20mir%20schon%20viel%20Zeit%20und%20nervige%20Klicks%20gespart.%20Eine%20richtig%20n%C3%BCtzliche%20Browsererweiterung%20f%C3%BCr%20Studenten!%0A%0AProbiers%20gleich%20mal%20aus%3A%20www.tu-fast.de%20%F0%9F%96%90' data-action='share/whatsapp/share' target='_blank'>WhatsApp</a> empfohlen.",
    id: 'RI1'
  }
}

async function insertAllRocketIcons () {
  const availableRockets = await getAvailableRockets()

  Object.keys(rocketIconsConfig).forEach((key) => {
    const p = document.createElement('p')
    const input = document.createElement('input')
    const span = document.createElement('span')
    const image = document.createElement('img')
    const label = document.createElement('label')
    const text = document.createElement('text')

    input.type = 'radio'
    input.id = rocketIconsConfig[key].id
    input.name = 'Rockets'
    input.value = rocketIconsConfig[key].id
    span.className = 'helper'
    label.htmlFor = rocketIconsConfig[key].id
    image.style = 'height: 50px;'

    if (availableRockets.includes(rocketIconsConfig[key].id)) {
      image.src = rocketIconsConfig[key].IconPathEnabled
      text.innerHTML = rocketIconsConfig[key].innerHTMLEnabled
    } else {
      image.src = rocketIconsConfig[key].IconPathDisabled
      input.disabled = 'true'
      text.innerHTML = rocketIconsConfig[key].innerHTMLToEnable
    }

    span.appendChild(image)
    span.appendChild(text)
    p.appendChild(input)
    p.appendChild(label)
    p.appendChild(span)

    document.getElementById('RocketForm').appendChild(p)
  })

  await checkSelectedRocket()

  // attach on click handlers
  document.querySelectorAll('#RocketForm a').forEach((el) => {
    el.onclick = enableRocketIcon
  })

  // attach form change handler
  document.querySelectorAll('input[name=Rockets]').forEach((el) => {
    el.onclick = rocketIconSelectionChange
  })
}

function rocketIconSelectionChange () {
  const rocketNode = this.parentElement
  const rocketID = this.id
  const imgSrc = '../../assets/icons/RocketIcons' + rocketNode.querySelectorAll('img')[0].src.split('RocketIcons')[1]
  chrome.storage.local.set({ selectedRocketIcon: '{"id": "' + rocketID + '", "link": "' + imgSrc + '"}' })
  chrome.browserAction.setIcon({ path: imgSrc })
}

async function enableRocketIcon () {
  const el = this.parentElement.parentElement.parentElement
  const rocketID = el.querySelectorAll('input')[0].id

  // save in storage
  // Promisified until usage of Manifest V3
  const availRockets = await new Promise((resolve) => chrome.storage.local.get(['availableRockets'], (resp) => resolve(resp.availableRockets)))
  if (!availRockets) {
    // Promisified until usage of Manifest V3
    await new Promise((resolve) => chrome.storage.local.set({ availableRockets: [rocketID] }, resolve))
  } else if (!availRockets.includes(rocketID)) {
    availRockets.push(rocketID)
    // Promisified until usage of Manifest V3
    await new Promise((resolve) => chrome.storage.local.set({ availableRockets: availRockets }, resolve))
  }

  // change picture and text and enable radio button
  const timestamp = new Date().getTime()
  const rocketNode = document.querySelectorAll('#' + rocketID)[0]
  const rocketImage = rocketNode.parentElement.querySelectorAll('img')[0]
  const rocketText = rocketNode.parentElement.querySelectorAll('text')[0]
  const rocketInput = rocketNode.parentElement.querySelectorAll('input')[0]
  rocketImage.src = rocketIconsConfig[rocketID].IconPathEnabled + '?t =' + timestamp
  rocketText.innerHTML = rocketIconsConfig[rocketID].innerHTMLEnabled
  rocketInput.removeAttribute('disabled')
}

// this need to be done here since manifest v2
window.onload = async () => {
  document.getElementsByClassName('banner__close')[0]?.addEventListener('click', () => document.getElementsByClassName('banner')[0]?.remove())

  // apply initial theme
  // Promisified until usage of Manifest V3
  const theme = await new Promise((resolve) => chrome.storage.local.get('theme', (res) => resolve(res.theme)))
  await applyTheme(theme)

  // prevent transition on page load
  setTimeout(() => {
    document.documentElement.removeAttribute('data-preload')
  }, 500)

  // only display additionNotificationSection in chrome, because it doesnt work in ff
  if (isFirefox) {
    document.getElementById('additionNotificationSection').style.display = 'none'
  }

  await insertAllRocketIcons()

  // assign functions
  document.getElementById('platform_select').onchange = changePlatform
  document.getElementById('save_data').onclick = saveUserData
  document.getElementById('delete_data').onclick = deleteUserData
  document.getElementById('switch_fwd').onclick = fwdGoogleSearch
  document.getElementById('open_shortcut_settings').onclick = openKeyboardSettings
  document.getElementById('open_shortcut_settings1').onclick = openKeyboardSettings
  document.getElementById('owa_mail_fetch').addEventListener('click', toggleOWAfetch)
  document.getElementById('themeSwitcher').addEventListener('click', nextTheme)

  // document.getElementById('fav').onclick = dashboardCourseSelect
  // document.getElementById('crs').onclick = dashboardCourseSelect

  // add additional notification checkbox listener
  const checkbox = document.getElementById('additionalNotification')
  checkbox.addEventListener('change', async (e) => {
    if (e.target.checked) {
      // only when owa fetch enabled
      // Promisified until usage of Manifest V3
      const enabledOWAFetch = await new Promise((resolve) => chrome.storage.local.get(['enabledOWAFetch'], (resp) => resolve(resp.enabledOWAFetch)))
      if (enabledOWAFetch) {
        // Promisified until usage of Manifest V3
        await new Promise((resolve) => chrome.storage.local.set({ additionalNotificationOnNewMail: true }, resolve))
      } else {
        document.getElementById('owa_fetch_msg').innerHTML = '<span class="red-text">F&uuml;r dieses Feature musst der Button auf \'Ein\' stehen.</span>'
        document.getElementById('additionalNotification').checked = false
      }
    } else {
      // Promisified until usage of Manifest V3
      await new Promise((resolve) => chrome.storage.local.set({ additionalNotificationOnNewMail: false }, resolve))
    }
  })

  // add studiengang-select listener
  document.getElementById('studiengangSelect').addEventListener('change', async (e) => {
    if (e.target.value === 'add') {
      document.getElementById('addStudiengang').style.display = 'block'
    } else {
      document.getElementById('addStudiengang').style.display = 'none'
      // Promisified until usage of Manifest V3
      await new Promise((resolve) => chrome.storage.local.set({ studiengang: e.target.value }, resolve))
    }
  })

  // add storage listener for autologin
  chrome.storage.onChanged.addListener(async (changes) => {
    if ('openSettingsPageParam' in changes && changes.openSettingsPageParam.newValue === 'auto_login_settings') {
      if (!document.getElementById('auto_login_settings').classList.contains('active')) {
        document.getElementById('auto_login_settings').click()
      }
      // Promisified until usage of Manifest V3
      await new Promise((resolve) => chrome.storage.local.set({ openSettingsPageParam: false }, resolve))
      document.getElementById('settings_comment').innerHTML = '<strong>F&uuml;r dieses Feature gib hier deine Zugangsdaten ein.</strong>'
    }

    if ('openSettingsPageParam' in changes && changes.openSettingsPageParam.newValue === 'add_studiengang') {
      document.getElementById('studiengangSelect').value = 'add'
      document.getElementById('addStudiengang').style.display = 'block'
      // Promisified until usage of Manifest V3
      await new Promise((resolve) => chrome.storage.local.set({ openSettingsPageParam: false }, resolve))
    }
  })

  document.getElementById('switch_pdf_inline').addEventListener('click', async (e) => {
    // Promisified until usage of Manifest V3
    await new Promise((resolve) => chrome.storage.local.set({ pdfInInline: e.target.checked }, resolve))

    document.getElementById('switch_pdf_newtab_block').style.visibility = e.target.checked ? 'visible' : 'hidden'

    if (e.target.checked) {
      // request necessary permissions
      // Promisified until usage of Manifest V3
      const granted = await new Promise((resolve) => chrome.permissions.request({ permissions: ['webRequest', 'webRequestBlocking'], origins: ['https://bildungsportal.sachsen.de/opal/*'] }, resolve))
      if (granted) {
        chrome.runtime.sendMessage({ cmd: 'toggle_pdf_inline_setting', enabled: true })
        if (isFirefox) {
          alert('Perfekt! Bitte starte den Browser einmal neu, damit die Einstellungen uebernommen werden!')
          // Promisified until usage of Manifest V3
          await new Promise((resolve) => chrome.storage.local.set({ openSettingsPageParam: 'opalCustomize', openSettingsOnReload: true }, resolve))
          chrome.runtime.sendMessage({ cmd: 'reload_extension' })
        }
      } else {
        // permission granting failed :( -> revert checkbox settings
        // Promisified until usage of Manifest V3
        await new Promise((resolve) => chrome.storage.local.set({ pdfInInline: false }, resolve))
        e.target.checked = false
        alert('TUfast braucht diese Berechtigung, um die PDFs im Browser anzeigen zu koennen. Versuche es erneut.')
        document.getElementById('switch_pdf_newtab_block').style.visibility = 'hidden'
      }
    } else {
      // disable "pdf in new tab" setting since it doesn't make any sense without inline pdf
      // Promisified until usage of Manifest V3
      await new Promise((resolve) => chrome.storage.local.set({ pdfInNewTab: false }, resolve))
      document.getElementById('switch_pdf_newtab').checked = false
      chrome.runtime.sendMessage({ cmd: 'toggle_pdf_inline_setting', enabled: false })
    }
  })

  document.getElementById('switch_pdf_newtab').addEventListener('click', async (e) => {
    // Promisified until usage of Manifest V3
    await new Promise((resolve) => chrome.storage.local.set({ pdfInNewTab: e.target.checked }, resolve))
  })

  // set all switches and elements
  await displayEnabled()

  // prep accordion
  const accList = document.getElementsByClassName('accordion')
  for (const acc of accList) {
    acc.addEventListener('click', (e) => {
      // --only open one accordions section at a time
      for (const acc of accList) {
        if (acc === e.target) continue // skip actual clicked element
        const pan = acc.nextElementSibling
        if (pan.style.maxHeight) {
          pan.style.maxHeight = null
          acc.classList.toggle('active')
        }
      }
      // --
      // open clicked accordion section and set active
      e.target.classList.toggle('active')
      const panel = e.target.nextElementSibling
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null
      } else {
        panel.style.maxHeight = panel.scrollHeight + 'px'
      }
    })
  }

  // get things from storage// Promisified until usage of Manifest V3
  const result = await new Promise((resolve) => chrome.storage.local.get(['saved_click_counter', 'openSettingsPageParam', 'isEnabled'], resolve))
  await updateSavedStatus()
  // update saved clicks
  // see if any params are available
  if (result.openSettingsPageParam === 'auto_login_settings') {
    setTimeout(() => document.getElementById('auto_login_settings').click(), 200)
  } else if (result.openSettingsPageParam === 'time_settings') {
    setTimeout(() => document.getElementById('time_settings').click(), 200)
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 500)
  } else if (result.openSettingsPageParam === 'mailFetchSettings') {
    setTimeout(() => document.getElementById('owa_mail_settings').click(), 200)
  } else if (result.openSettingsPageParam === 'opalCustomize') {
    setTimeout(() => document.getElementById('opal_modifications').click(), 200)
  } else if (result.openSettingsPageParam === 'rocket_icons_settings') {
    setTimeout(() => document.getElementById('rocket_icons').click(), 200)
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 500)
  }

  this.document.getElementById('settings_comment').innerHTML = 'Bereits ' + clicksToTimeNoIcon(result.saved_click_counter || 0)
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({ openSettingsPageParam: false }, resolve))
}
