const shareHTML = '<div style=height:450px;width:510px;overflow:hidden><div class=the-middle style=white-space:nowrap;display:inline><div class=tufast_text><span class=tufasst_name>Hilf deinen Mitstudierenden</span></div><div class="tufast_text" style=position:relative;top:6px><img class="imgicon huge invert" src=../../assets/images/tufast48.png style=position:relative;top:-7px;left:0px><span class="tufasst_name huge" style=position:relative;top:-7px;left:3px>TUfast</span><span class=tufasst_name> &nbsp;zu entdecken</span></div><div class=grey><span class=tufasst_name>und <a class=grey_a id=rewards_link href=javascript:void(0)>sammle coole Raketen</a>!</span></div><div id=download-section><div>Teilen mit</div><div class=download-link><img class=imgicon src=../../assets/icons/gmail.png> <span class=browser_name><a href="mailto:?subject=Probiere%20mal%20TUfast!%20%F0%9F%9A%80&body=Hey%20%3A)%0A%0Akennst%20du%20schon%20TUfast%3F%0A%0ATUfast%20hilft%20beim%20t%C3%A4glichen%20Arbeiten%20mit%20den%20Online-Portalen%20der%20TU%20Dresden.%0ADamit%20spare%20ich%20viel%20Zeit%20und%20nervige%20Klicks.%0A%0ATUfast%20ist%20eine%20Erweiterung%20f%C3%BCr%20den%20Browser%20und%20wurde%20von%20Studenten%20entwickelt.%0AProbiere%20es%20jetzt%20auf%20www.tu-fast.de%20!%0A%0ALiebe%20Gr%C3%BC%C3%9Fe%C2%A0%F0%9F%96%90"target=_blank>E-Mail</a></span></div><div class=download-link><img class=imgicon src=../../assets/icons/wa2.png style=height:1.4em><span class=browser_name> <a href="https://api.whatsapp.com/send?text=Hey%2C%20kennst%20du%20schon%20TUfast%3F%20%F0%9F%9A%80%0A%0AMacht%20das%20arbeiten%20mit%20allen%20Online-Portalen%20der%20TU%20Dresden%20produktiver%20und%20hat%20mir%20schon%20viel%20Zeit%20und%20nervige%20Klicks%20gespart.%20Eine%20richtig%20n%C3%BCtzliche%20Browsererweiterung%20f%C3%BCr%20Studenten!%0A%0AProbiers%20gleich%20mal%20aus%20auf%20www.tu-fast.de%20%F0%9F%96%90"target=_blank>WhatsApp</a></span></div><div class=download-link><span class=browser_name>oder <a href=https://www.tu-fast.de target=_blank>www.tu-fast.de</a></span></div></div></div><div class=the-bottom><p>Gemacht mit 🖤 von Studenten | <a href=https://github.com/TUfast-TUD/TUfast_TUD target=_blank>GitHub</a> | <a href="mailto:frage@tu-fast.de?subject=Feedback%20TUfast"target=_blank>Kontakt</a></div></div>'
const bananaHTML = '<a href="https://www.buymeacoffee.com/olihausdoerfer" target="_blank"style = "position: fixed; bottom: 68px; right: -75px; width:240px; height: auto;" > <img style="width: 160px;"src="https://img.buymeacoffee.com/button-api/?text=Buy me a Mate&emoji=🍾&slug=olihausdoerfer&button_colour=fbd54b&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff"></a>'

// this config is used to customize TUfast for a course of study
// it overrides the default setting from popup.html
// if you want to add an footer icon for your course of study, you need to add it to popup.html and set footer_icons_display property in this config
const studiengangConfig = {
  geowissenschaften: {
    name: 'Geowissenschaften',
    fsr_icon: '../../assets/icons/FSRIcons/fsr_geo.png',
    fsr_link: 'https://tu-dresden.de/bu/umwelt/geo/fsr',
    fsr_icon_2: '../../assets/icons/OPAL.png',
    fsr_link_2: 'https://bildungsportal.sachsen.de/opal/auth/RepositoryEntry/15833497605',
    fsr_icon_dashboard_style: '',
    fsr_icon_dashboard_style_2: 'max-height: 20px; margin-top: 10px; padding-right:10px',
    footer_icons_display: ['selma', 'opal', 'qis', 'matrix', 'msx', 'cloud', 'swdd', 'geoportal'],
    footer_icons_links: {
      swdd: 'https://www.studentenwerk-dresden.de/mensen/speiseplan/mensa-siedepunkt.html'
    },
    invert_icon_dark_theme: false
  },
  maschinenbau: {
    name: 'Maschinenwesen',
    fsr_icon: '../../assets/icons/FSRIcons/fsr_mw.png',
    fsr_icon_dashboard_style: 'max-height: 32px;',
    fsr_link: 'https://tu-dresden.de/ing/maschinenwesen/fsr',
    footer_icons_display: ['selma', 'opal', 'qis', 'matrix', 'msx', 'cloud', 'swdd'],
    footer_icons_links: {
      swdd: 'https://www.studentenwerk-dresden.de/mensen/speiseplan/'
    },
    invert_icon_dark_theme: false
  },
  mathematik: {
    name: 'Mathematik',
    fsr_icon: '../../assets/icons/FSRIcons/fsr_mathe.png',
    fsr_icon_dashboard_style: 'max-height: 32px;',
    fsr_link: 'https://myfsr.de/dokuwiki/doku.php?id=start',
    footer_icons_display: ['selma', 'opal', 'matrix', 'msx', 'cloud', 'gitlab', 'je', 'swdd'],
    footer_icons_links: {
      swdd: 'https://www.studentenwerk-dresden.de/mensen/speiseplan/'
    },
    invert_icon_dark_theme: false
  },
  medizin: {
    name: 'Medizin',
    fsr_icon: '../../assets/icons/FSRIcons/fsr_medi_small.png',
    fsr_link: 'https://www.medforum-dresden.de/',
    fsr_icon_dashboard_style: '',
    footer_icons_display: ['selma', 'opal', 'moodle', 'eportal', 'msx', 'cloud', 'swdd'],
    footer_icons_links: {
      swdd: 'https://www.studentenwerk-dresden.de/mensen/speiseplan/mensologie.html'
    },
    invert_icon_dark_theme: false
  },
  psychologie: {
    name: 'Psychologie',
    fsr_icon: '../../assets/icons/FSRIcons/fsr_psy.png',
    fsr_link: 'https://tu-dresden.de/mn/psychologie/fsrpsy',
    fsr_icon_dashboard_style: '',
    footer_icons_display: ['selma', 'opal', 'qis', 'matrix', 'msx', 'cloud', 'swdd', 'orsee'],
    footer_icons_links: {
      swdd: 'https://www.studentenwerk-dresden.de/mensen/speiseplan/mensa-siedepunkt.html'
    },
    invert_icon_dark_theme: false
  },
  wirtschaftswissenschaften: {
    name: 'Wirtschaftswissenschaften',
    fsr_icon: '../../assets/icons/FSRIcons/fsr_wiwi.png',
    fsr_icon_dashboard_style: 'max-height: 32px;',
    fsr_link: 'https://fsrwiwi.de',
    footer_icons_display: ['selma', 'opal', 'qis', 'matrix', 'msx', 'cloud', 'swdd'],
    footer_icons_links: {
      swdd: 'https://www.studentenwerk-dresden.de/mensen/speiseplan/'
    },
    invert_icon_dark_theme: false
  },
  elektrotechnik: {
    name: 'Elektrotechnik',
    fsr_icon: '../../assets/icons/FSRIcons/FSR_ET.png',
    fsr_icon_dashboard_style: 'max-height: 32px;',
    fsr_link: 'https://fsret.de',
    footer_icons_display: ['selma', 'opal', 'qis', 'matrix', 'msx', 'cloud', 'swdd'],
    footer_icons_links: {
      swdd: 'https://www.studentenwerk-dresden.de/mensen/speiseplan/'
    },
    invert_icon_dark_theme: true
  },
  general: {
    name: 'Standardeinstellungen',
    fsr_icon: '',
    fsr_link: '',
    footer_icons_display: ['selma', 'opal', 'qis', 'matrix', 'msx', 'cloud', 'je', 'swdd'],
    footer_icons_links: {
      swdd: 'https://www.studentenwerk-dresden.de/mensen/speiseplan/'
    },
    invert_icon_dark_theme: false
  },
  addStudiengang: {
    name: '&#65291; Studiengang hinzufügen...'
  }
}

const starRatingSettings = {

  // initial rating value
  rating: '0.0',

  // max rating value
  maxRating: '5',

  // min rating value
  minRating: '0.0',

  // readonly mode?
  readOnly: 'no',

  // custom rating symbols here
  starImage: '../../assets/icons/starRate.png',
  emptyStarImage: '../../assets/icons/starbackground.png',

  // symbol size
  starSize: '18',

  // step size for fractional rating
  step: '0.5'

}

// change this, if you want to highlight the dropdown arrow for the studiengang selection
// this can be used e.g. if a new studiengang was added
// settings this to false (bool-value) will cause no action
// dropdown_update_id is a random string
const dropdownUpdateId = '56tzoguhjk'

// TODO
window.onload = async () => {
  // get things from storage
  // Promisified until usage of Manifest V3
  const result = await new Promise((resolve) => chrome.storage.local.get([
    'dashboardDisplay',
    'ratingEnabledFlag',
    'saved_click_counter',
    'studiengang',
    'closedIntro1',
    'ratedCourses',
    'closedOutro1',
    'theme',
    'closedMsg1'], resolve))

  // set initial theme
  if (result.theme === 'system') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', result.theme)
  }

  // prevent transition on page load
  setTimeout(() => {
    document.documentElement.removeAttribute('data-preload')
  }, 500)

  // display courses
  const dashboardDisplay = result.dashboardDisplay
  const courseList = await loadCourses(dashboardDisplay)
  const htmlList = document.getElementsByClassName('list')[0]
  displayCourseList(courseList, htmlList, dashboardDisplay, result.closedIntro1, result.ratedCourses, result.closedOutro1, result.ratingEnabledFlag, result.closedMsg1)
  if (document.getElementById('intro')) {
    document.getElementById('intro').onclick = removeIntro
  }
  if (document.getElementById('outro')) {
    document.getElementById('outro').onclick = removeOutro
  }
  if (document.getElementById('msg1')) {
    document.getElementById('msg1').onclick = removeMsg1
  }

  // filter list
  listSearchFunction()

  // display saved clicks
  if (result.saved_click_counter === undefined) { result.saved_click_counter = 0 }
  const time = clicksToTime(result.saved_click_counter)
  document.getElementById('saved_clicks').innerHTML = `<text><font color='green'>${result.saved_click_counter} Klicks</font> gespart: <a href='javascript:void(0)' id='time' target='_blank'>${time}</a></text>`
  document.getElementById('time').onclick = openSettingsTimeSection

  // display banana at each end of semester for two weeks!
  let bananaTime = false
  const d = new Date()
  const month = d.getMonth() + 1 // starts at 0
  const day = d.getDate()
  if ((month === 7 && day < 15) || (month === 1 && day > 15)) bananaTime = true
  if (result.saved_click_counter > 100 && bananaTime) {
    document.getElementById('banana').innerHTML = bananaHTML
  }

  // exclusive style adjustments
  customizeForStudiengang(result.studiengang)

  // assign switch function
  document.getElementById('switch').addEventListener('change', saveEnabled)

  // asign input search fct
  // onkeydown?
  this.document.getElementById('searchListInput').onkeyup = listSearchFunction

  this.document.getElementById('settings').onclick = openSettings
  this.document.getElementById('share').onclick = openShare

  await displayEnabled()

  // bind enter key --> when enter key is pressed the first course in list is clicked
  document.getElementById('list').addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      // Cancel the default action, if needed
      // event.preventDefault();
      // Click the first element which is visible
      const listEntries = document.getElementsByClassName('list-entry-wrapper')
      for (const entry of listEntries) {
        if (!(entry.style.display === 'none')) {
          entry.firstElementChild.click()
          break
        }
      }
    }
  })

  // set custom dropdown styles and js for studiengang selection
  // Close the dropdown menu if the user clicks outside of it
  window.onclick = (event) => {
    if (!event.target.matches('.select_studiengang_btn')) {
      const dropdowns = document.getElementsByClassName('select_studiengang_dropdown_content')
      for (const dropdown of dropdowns) {
        if (dropdown.classList.contains('show')) {
          dropdown.classList.remove('show')
        }
      }
    }
  }

  // studiengang selection drop-down
  document.getElementById('select_studiengang_btn').onclick = selectStudiengangDropdown
  addDropdownOptions()

  // highlight studiengang selection (only once)
  // Promisified until usage of Manifest V3
  const studiengangResult = await new Promise((resolve) => chrome.storage.local.get(['updateCustomizeStudiengang', 'saved_click_counter'], resolve))
  if (studiengangResult.updateCustomizeStudiengang !== dropdownUpdateId && dropdownUpdateId !== false && studiengangResult.saved_click_counter > -1) {
    document.getElementById('select_studiengang_dropdown_id').style.border = '2px solid red'
  }

  // we need to set dropdown selection max-height, in case the dashboard is small
  // before wait XXXms because everything needs to be loaded first
  await new Promise(resolve => setTimeout(resolve, 200))
  document.getElementById('select_studiengang_dropdown_content').style.maxHeight = (document.body.offsetHeight - 45).toString() + 'px'

  // show star rating
  // eslint-disable-next-line no-undef
  rateSystem('myRatingClassName', starRatingSettings, (rating, ratingTargetElement) => {
    // callback for clicking on star rating. We dont do anything here.
  })
}

async function changeStudiengangSelection () {
  const studiengang = this.getAttribute('studiengang')

  if (studiengang === 'addStudiengang') {
    chrome.runtime.sendMessage({ cmd: 'open_settings_page', params: 'add_studiengang' })
    return
  }

  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({ studiengang: studiengang }, resolve))
  customizeForStudiengang(studiengang)
}

function addDropdownOptions () {
  const dropdownContent = document.getElementById('select_studiengang_dropdown_content')

  // set footer icons
  Object.keys(studiengangConfig).forEach((key) => {
    const listEntry = document.createElement('p')
    listEntry.style = 'display:flex;align-items: center; min-height: 36px; padding-left: 10px; padding-right: 5px; border-radius: 3px;'
    listEntry.onclick = changeStudiengangSelection
    listEntry.setAttribute('studiengang', key)

    const listTxt = document.createElement('text')
    listTxt.style = 'flex:10'
    listTxt.innerHTML = studiengangConfig[key].name

    listEntry.appendChild(listTxt)

    if (studiengangConfig[key].fsr_icon) {
      const listImg = document.createElement('img')
      listImg.style = 'flex: 1;height: 30px; width: auto; vertical-align:middle'
      listImg.src = studiengangConfig[key].fsr_icon
      if (studiengangConfig[key].invert_icon_dark_theme) {
        listImg.className += ' invert'
      }

      listEntry.appendChild(listImg)
    }

    dropdownContent.appendChild(listEntry)
  })
}

// dashboard adjustments for studiengang
function customizeForStudiengang (studiengang) {
  // set footer icons
  if (studiengangConfig[studiengang].footer_icons_display) {
    // set visibility for all icons to none
    const icons = document.getElementById('settings-footer-bar-icons').children
    for (let i = 0; i < icons.length; i++) {
      icons[i].style.display = 'none'
    }

    // set visible icons
    studiengangConfig[studiengang].footer_icons_display.forEach(element => {
      document.getElementById(element).style.display = 'flex'
    })
  }

  // set footer icon links
  if (studiengangConfig[studiengang].footer_icons_links) {
    Object.keys(studiengangConfig[studiengang].footer_icons_links).forEach((key) => {
      document.getElementById(key).href = studiengangConfig[studiengang].footer_icons_links[key]
    })
  }

  // set fsr icon
  if (studiengangConfig[studiengang].fsr_icon) {
    document.getElementById('fsr_icon').src = studiengangConfig[studiengang].fsr_icon
    document.getElementById('fsr_icon').style = studiengangConfig[studiengang].fsr_icon_dashboard_style
    if (studiengangConfig[studiengang].invert_icon_dark_theme) {
      document.getElementById('fsr_icon').className += ' invert'
    }
  } else {
    document.getElementById('fsr_icon').style.display = 'none'
  }

  // set fsr icon 2
  if (studiengangConfig[studiengang].fsr_icon_2) {
    document.getElementById('fsr_icon_2').src = studiengangConfig[studiengang].fsr_icon_2
    document.getElementById('fsr_icon_2').style = studiengangConfig[studiengang].fsr_icon_dashboard_style_2
  } else {
    document.getElementById('fsr_icon_2').style.display = 'none'
  }

  // set fsr link
  if (studiengangConfig[studiengang].fsr_link) {
    document.getElementById('fsr_link').href = studiengangConfig[studiengang].fsr_link
    document.getElementById('fsr_link').style.display = 'unset'
  } else {
    document.getElementById('fsr_link').style.display = 'none'
  }

  // set fsr link 2
  if (studiengangConfig[studiengang].fsr_link_2) {
    document.getElementById('fsr_link_2').href = studiengangConfig[studiengang].fsr_link_2
    document.getElementById('fsr_link_2').style.display = 'unset'
  } else {
    document.getElementById('fsr_link_2').style.display = 'none'
  }
}

function clicksToTime (clicks) {
  clicks = clicks * 3
  const secs = clicks % 60
  const mins = Math.floor(clicks / 60)
  return mins + 'min ' + secs + 's'
}

async function openSettings () {
  chrome.runtime.sendMessage({ cmd: 'open_settings_page', param: '' }) // for some reason I need to pass empty param - else it wont work in ff
  const isFirefox = navigator.userAgent.includes('Firefox/') // attention: no failsave browser detection
  if (isFirefox) window.close()
  return false // Required for ff
}

async function openShare () {
  document.getElementById('list').innerHTML = shareHTML // it needs to be injected this way, else click doesnt work
  await new Promise(resolve => setTimeout(resolve, 500))
  document.getElementById('rewards_link').addEventListener('click', async (e) => { // click handler needs to be set this way
    chrome.runtime.sendMessage({ cmd: 'open_settings_page', params: 'rocket_icons_settings' }) // for some reason I need to pass empty param - else it wont work in ff
    const isFirefox = navigator.userAgent.includes('Firefox/') // attention: no failsave browser detection
    if (isFirefox) window.close()
    return false // Required for ff
  })
}

async function openSettingsTimeSection () {
  chrome.runtime.sendMessage({ cmd: 'open_settings_page', params: 'time_settings' })
  const isFirefox = navigator.userAgent.includes('Firefox/') // attention: no failsave browser detection
  if (isFirefox) window.close()
  return false // Required for ff
}

function listSearchFunction () {
  const filter = document.getElementById('searchListInput').value.toLowerCase()
  const listEntries = document.querySelectorAll('#list .list-entry-wrapper')

  for (const entry of listEntries) {
    try {
      const txtValue = entry.firstChild.text.toLowerCase()
      if (!txtValue.includes(filter)) {
        entry.style.display = 'none'
      } else {
        entry.style.display = 'block'
      }
    } catch (e) {
      console.log('Could not set visibility of item. Does not necessarily need to be an error.')
    }
  }

  // always show "Klicke hier, um die Kursliste manuell zu aktualisieren..."
  if (listEntries[listEntries.length - 1].innerHTML.includes('aktualisieren')) { listEntries[listEntries.length - 1].style.display = 'block' }
}

function displayCourseList (courseList, htmlList, type, closedIntro1, ratedCourses, closedOutro1, ratingEnabledFlag, closedMsg1) {
  let link = ''
  let name = ''
  let imgSrc = ''
  switch (type) {
    case 'favoriten':
      link = 'https://bildungsportal.sachsen.de/opal/auth/resource/favorites'
      name = 'Klicke, um deine Opal-Kurse zu importieren'
      imgSrc = '../../assets/icons/star.png'
      break
    case 'meine_kurse':
      link = 'https://bildungsportal.sachsen.de/opal/auth/resource/courses'
      name = 'Klicke, um deine Opal-Kurse zu importieren'
      imgSrc = '../../assets/icons/CoursesOpalIcon.png'
      break
    default:
      break
  }

  if (courseList === undefined || courseList.length === 0 || courseList === false) {
    courseList = []
    courseList.push({ name, link, img: '../../assets/icons/reload.png' })
  } else {
    courseList.push({ name: 'Diese Kursliste jetzt aktualisieren...', link, img: '../../assets/icons/reload.png' })
  }

  // determine when to show outro and intro for course rating
  // THIS NEEDS TO BE ADAPTED FOR EACH SEMESTER because ratedCourses is never purged for now - its only expanded. However, courses which are not longer in courseList shouldnt be in ratedCourses either!
  ratedCourses = ratedCourses || []
  const showIntro = (ratingEnabledFlag && !closedIntro1 && courseList.length > 1 && !(courseList.length - 2 < ratedCourses.length))
  const showOutro = (ratingEnabledFlag && !closedOutro1 && courseList.length > 1 && !showIntro && (courseList.length - 2 < ratedCourses.length))
  const d = new Date()
  const month = d.getMonth() + 1 // starts at 0
  const day = d.getDate()
  //  show gOPAL-Banner at beginning of semester. showMsg1 is resetted in background.js
  const showMsg1 = (!showIntro && !showOutro && !closedMsg1 && month === 10 && day < 20)

  // add introduction to course Rating element
  if (showIntro) {
    const introRating = document.createElement('div')
    introRating.id = 'intro_rating'
    const introRatingText = document.createElement('p')
    introRating.classList.add('list-entry-wrapper')
    introRatingText.classList.add('list-intro')

    introRatingText.innerHTML = "<b>Wir suchen den besten Kurs an der TU Dresden. Bewerte jetzt deine Kurse mit 1-5 Sternen!</b> Deine Bewertung ist zu 100% völlig anonym. Die Ergebnisse der Abstimmung veröffentlichen wir anschließend. Details und die Erweiterung zur Datenschutzerklärung gibts <a target='_blank' href='https://docs.google.com/document/d/1CIt2Q16gtzsuopXZxxMcC1BU1urpJF6FCQ8d77-um1U/edit?usp=sharing'>hier</a>. <a id='intro' href='#'>Schließen</a>."
    introRating.appendChild(introRatingText)
    htmlList.appendChild(introRating)
  }

  // add outro to course Rating element
  if (showOutro) {
    const outroRating = document.createElement('div')
    outroRating.id = 'outro_rating'
    const outroRatingText = document.createElement('p')
    outroRating.classList.add('list-entry-wrapper')
    outroRatingText.classList.add('list-outro')

    outroRatingText.innerHTML = "<b>Danke für's Abstimmen. Über die Ergebnisse wirst du benachrichtigt!</b> Teile <a target='_blank' href='https://www.tu-fast.de'>www.tu-fast.de</a> jetzt mit deinen Freunden, damit auch sie die Kurse bewerten. Damit k&ouml;nnen wir die Lehre an der TU verbessern! Danke &#x1f499;<br><a id='outro' href='#'>Schließen</a>."
    outroRating.appendChild(outroRatingText)
    htmlList.appendChild(outroRating)
  }

  // add msg1
  if (showMsg1) {
    const msg1 = document.createElement('div')
    msg1.id = 'msg1-wrapper'
    const msg1Text = document.createElement('p')
    msg1.classList.add('list-entry-wrapper')
    msg1Text.classList.add('list-outro')

    msg1Text.innerHTML = "<b>Tipp für Erstis: Erfahre alles wichtige rund um dein Studium mit gOPAL - dem mobilen Studienassistenzsystem! Hier <a target='_blank' href='https://tu-dresden.de/mz/projekte/projektoverview/mobiles-studienassistenzsystem-gopal'>gOPAL öffnen.</a> <a id='msg1' href='#'>Schließen</a>."
    msg1.appendChild(msg1Text)
    htmlList.appendChild(msg1)
  }

  courseList.forEach(element => {
    const listEntrywrapper = document.createElement('div')
    const listEntry = document.createElement('a')
    const listImg = document.createElement('div')
    const listText = document.createElement('div')
    const img = document.createElement('img')
    const rateEntryWrapper = document.createElement('div')
    const rateEntry = document.createElement('div')
    const confirmEntry = document.createElement('div')
    const confirmEntryLink = document.createElement('a')

    listEntrywrapper.className = 'list-entry-wrapper'

    rateEntryWrapper.style.display = 'flex'
    rateEntryWrapper.style.alignItems = 'center'
    rateEntryWrapper.style.marginBottom = '7px'
    rateEntryWrapper.id = element.name + ' Wrapper'
    rateEntry.style.flex = 1
    rateEntry.style.marginLeft = '150px'
    confirmEntry.style.flex = 2

    confirmEntryLink.setAttribute('courseRef', element.name)
    confirmEntryLink.style.fontSize = '15px'
    confirmEntryLink.href = '#'
    confirmEntryLink.innerHTML = "Fertig <text style='font-size:14px'>✅</text>"
    confirmEntryLink.onclick = sendRating
    confirmEntry.appendChild(confirmEntryLink)

    // this is the structure required by starRating.js
    const rateEntryInner1 = document.createElement('div')
    const rateEntryInner2 = document.createElement('div')
    rateEntryInner1.className = 'starRatingContainer'
    rateEntryInner2.className = 'myRatingClassName'
    rateEntryInner2.id = element.name
    rateEntryInner1.appendChild(rateEntryInner2)
    rateEntry.appendChild(rateEntryInner1)

    listEntry.className = 'list-entry'
    listEntry.href = element.link
    listEntry.target = '_blank'
    listEntry.onclick = saveTwoClicks

    listImg.className = 'list-entry-img'

    listText.className = 'list-entry-text'
    listText.innerHTML = element.name

    img.className = 'list-img'
    img.src = imgSrc

    if (element.img === '../../assets/icons/reload.png') {
      img.src = '../../assets/icons/reload.png'
      img.className += ' invert'
    }

    listImg.appendChild(img)
    if (!(element.img === false)) { listEntry.appendChild(listImg) }
    listEntry.appendChild(listText)
    listEntrywrapper.appendChild(listEntry)
    rateEntryWrapper.appendChild(rateEntry)
    rateEntryWrapper.appendChild(confirmEntry)
    let isRated = false
    if (ratedCourses === undefined) {
      isRated = false
    } else {
      isRated = ratedCourses.includes(element.name)
    }
    if (!(element.name === 'Diese Kursliste jetzt aktualisieren...' || element.name === 'Klicke, um deine Opal-Kurse zu importieren' || isRated) && ratingEnabledFlag) listEntrywrapper.appendChild(rateEntryWrapper)
    htmlList.appendChild(listEntrywrapper)
  })

  // Create button so switch courses <> favorites
  const listEntry = document.createElement('a')
  const listImg = document.createElement('div')
  const listText = document.createElement('div')
  const img = document.createElement('img')

  listImg.className = 'list-entry-img'

  listEntry.className = 'list-entry'
  listEntry.href = 'javascript:void(0)'
  listEntry.onclick = switchCoursesToShow

  listText.className = 'list-entry-text'

  img.className = 'list-img'

  if (type === 'favoriten') img.src = '../../assets/icons/CoursesOpalIcon.png'
  if (type === 'meine_kurse') img.src = '../../assets/icons/star.png'

  listImg.appendChild(img)
  listEntry.appendChild(listImg)

  if (type === 'favoriten') listText.innerHTML = 'Wechsel zu "Meine Kurse" ... '
  if (type === 'meine_kurse') listText.innerHTML = 'Wechsel zu "Meine Favoriten" ...'

  listEntry.appendChild(listText)
  htmlList.appendChild(listEntry)
}

async function switchCoursesToShow () {
  // Promisified until usage of Manifest V3
  const result = await new Promise((resolve) => chrome.storage.local.get(['dashboardDisplay'], resolve))
  if (result.dashboardDisplay === 'meine_kurse') await new Promise((resolve) => chrome.storage.local.set({ dashboardDisplay: 'favoriten' }, resolve))
  if (result.dashboardDisplay === 'favoriten') await new Promise((resolve) => chrome.storage.local.set({ dashboardDisplay: 'meine_kurse' }, resolve))
  location.reload()
}

async function saveTwoClicks () {
  chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 2 })
}

// changeIsEnabledState
async function saveEnabled () {
  // only save, if user data is available. Else forward to settings page
  // Promisified until usage of Manifest V3
  const isEnabled = await new Promise((resolve) => chrome.storage.local.get(['isEnabled'], resolve))
  // Promisified until usage of Manifest V3
  // If there are multiple platforms user data has to be checked for every platform
  const userDataAvail = await new Promise((resolve) => chrome.runtime.sendMessage({ cmd: 'check_user_data' }, resolve))
  await userDataAvail
  if (userDataAvail) {
    // Promisified until usage of Manifest V3
    await new Promise((resolve) => chrome.storage.local.set({ isEnabled: !(isEnabled.isEnabled) }, resolve))
  } else {
    chrome.runtime.sendMessage({ cmd: 'open_settings_page', params: 'auto_login_settings' })
    window.close()
  }
}

// set switch
async function displayEnabled () {
  // Promisified until usage of Manifest V3
  const isEnabled = await new Promise((resolve) => chrome.storage.local.get(['isEnabled'], resolve))
  document.getElementById('switch').checked = !!isEnabled.isEnabled
}

// return course_list = [{link:link, name: name}, ...]
async function loadCourses (type) {
  // Promisified until usage of Manifest V3
  const data = await new Promise((resolve) => chrome.storage.local.get(['favoriten', 'meine_kurse'], resolve))
  try {
    return JSON.parse(data[type])
  } catch {
    return false
  }
}

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
async function selectStudiengangDropdown () {
  document.getElementById('select_studiengang_dropdown_content').classList.toggle('show')
  document.getElementById('select_studiengang_dropdown_id').style.border = 'none'
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({ updateCustomizeStudiengang: dropdownUpdateId }, resolve))
}

async function sendRating () {
  const course = this.getAttribute('courseref')
  const rating = document.getElementById(course).dataset.rating

  console.log('GOT THE FOLLOWING RATING:')
  console.log(course)
  console.log(rating)

  // rating cannot be zero
  if (rating === '0.0') {
    alert('Bitte bewerte den Kurs mit Sternen, bevor du dein Rating abgibst!')
    return
  }

  // add to rated list
  // Promisified until usage of Manifest V3
  const ratedCoursesFetch = await new Promise((resolve) => chrome.storage.local.get(['ratedCourses'], resolve))
  const updatedCourseList = ratedCoursesFetch.ratedCourses || []
  updatedCourseList.push(course)
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({ ratedCourses: updatedCourseList }, resolve))

  // remove the rating div
  document.getElementById(course + ' Wrapper').remove()

  // send rating
  let courseURI = course.replaceAll('/', '') // very important, as it is interpreted as documents and collections in the db
  courseURI = encodeURIComponent(courseURI)
  courseURI = courseURI.replaceAll('!', '%21').replaceAll("'", '%27').replaceAll('(', '%28').replaceAll(')', '%29').replaceAll('~', '%7E')
  const ratingURI = rating.replace('.', ',')
  // console.log(courseURI)

  // IF YOU ARE TRYING TO HACK please use the following domain instead: https://us-central1-tufastcourseratinghack.cloudfunctions.net/setRatingHACK . It has the same services running. Let me know if you find any security issues - thanks! - oli
  const url = 'https://us-central1-tufastcourserating2.cloudfunctions.net/setRating?rating=' + ratingURI + '&course=' + courseURI
  // console.log(url)

  const resp = await fetch(url)
  console.log(await resp.text())
}

async function removeIntro () {
  document.getElementById('intro_rating').remove()
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({ closedIntro1: true }, resolve))
}

async function removeOutro () {
  document.getElementById('outro_rating').remove()
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({ closedOutro1: true }, resolve))
}

async function removeMsg1 () {
  document.getElementById('msg1-wrapper').remove()
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({ closedMsg1: true }, resolve))
}
