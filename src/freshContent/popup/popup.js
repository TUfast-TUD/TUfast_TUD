import studiengangConfig from '../studies.json'
import { strings } from '../../i18n'
import '../../styles/popup.scss'
import '../../styles/components/switch.scss'
import '../../styles/components/share.scss'

const shareHTML = strings.popup.shareHtml
const bananaHTML = strings.popup.bananaHtml

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
  setStaticText()

  // get things from storage
  // Promisified until usage of Manifest V3
  const result = await new Promise((resolve) =>
    chrome.storage.local.get(
      [
        'dashboardDisplay',
        'ratingEnabledFlag',
        'savedClickCounter',
        'studiengang',
        'closedIntro1',
        'ratedCourses',
        'closedOutro1',
        'theme',
        'closedMsg1'
      ],
      resolve
    )
  )

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
  const dashboardDisplay = result.dashboardDisplay || 'favoriten'
  const courseList = await loadCourses(dashboardDisplay)
  const htmlList = document.getElementsByClassName('list')[0]
  displayCourseList(
    courseList,
    htmlList,
    dashboardDisplay,
    result.closedIntro1,
    result.ratedCourses,
    result.closedOutro1,
    result.ratingEnabledFlag,
    result.closedMsg1
  )
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
  const time = clicksToTime(result.savedClickCounter || 0)
  document.getElementById('saved_clicks').innerHTML =
    `<text>${strings.popup.savedClicks(result.savedClickCounter || 0, time)}</text>`

  // display banana at each end of semester for two weeks!
  let bananaTime = false
  const d = new Date()
  const month = d.getMonth() + 1 // starts at 0
  const day = d.getDate()
  if ((month === 7 && day < 15) || (month === 1 && day > 15)) bananaTime = true
  if (result.savedClickCounter > 100 && bananaTime) {
    document.getElementById('banana').innerHTML = bananaHTML
  }

  // exclusive style adjustments
  customizeForStudiengang(result.studiengang || 'general')

  // assign switch function
  document.getElementById('switch').addEventListener('change', saveEnabled)

  // asign input search fct
  // onkeydown?
  document.getElementById('searchListInput').onkeyup = listSearchFunction

  document.getElementById('settings').onclick = openSettings
  document.getElementById('share').onclick = openShare

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
  const studiengangResult = await new Promise((resolve) =>
    chrome.storage.local.get(['updateCustomizeStudiengang', 'savedClickCounter'], resolve)
  )
  if (
    studiengangResult.updateCustomizeStudiengang !== dropdownUpdateId &&
    dropdownUpdateId !== false &&
    studiengangResult.savedClickCounter > -1
  ) {
    document.getElementById('select_studiengang_dropdown_id').style.border = '2px solid red'
  }

  // we need to set dropdown selection max-height, in case the dashboard is small
  // before wait XXXms because everything needs to be loaded first
  await new Promise((resolve) => setTimeout(resolve, 200))
  document.getElementById('select_studiengang_dropdown_content').style.maxHeight =
    (document.body.offsetHeight - 45).toString() + 'px'

  // show star rating
  // eslint-disable-next-line no-undef
  rateSystem('myRatingClassName', starRatingSettings, (rating, ratingTargetElement) => {
    // callback for clicking on star rating. We dont do anything here.
  })
}

async function changeStudiengangSelection() {
  const studiengang = this.getAttribute('studiengang')

  if (studiengang === 'addStudiengang') {
    chrome.runtime.sendMessage({
      cmd: 'open_settings_page',
      params: 'Contact'
    })
    return
  }

  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({ studiengang: studiengang }, resolve))
  customizeForStudiengang(studiengang)
}

function addDropdownOptions() {
  const dropdownContent = document.getElementById('select_studiengang_dropdown_content')

  // set footer icons
  Object.keys(studiengangConfig).forEach((key) => {
    const listEntry = document.createElement('p')
    listEntry.style =
      'display:flex; align-items: center; min-height: 36px; padding-left: 10px; padding-right: 5px; gap: 8px'
    listEntry.onclick = changeStudiengangSelection
    listEntry.setAttribute('studiengang', key)

    const listTxt = document.createElement('text')
    listTxt.style = 'flex:10'
    listTxt.innerHTML = facultyName(key, studiengangConfig[key].name)

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
function customizeForStudiengang(studiengang) {
  const config = studiengangConfig[studiengang] || studiengangConfig.general

  // set footer icons
  if (config.footer_icons_display) {
    // set visibility for all icons to none
    const icons = document.getElementById('settings-footer-bar-icons').children
    for (let i = 0; i < icons.length; i++) {
      icons[i].style.display = 'none'
    }

    // set visible icons
    config.footer_icons_display.forEach((element) => {
      const icon = document.getElementById(element)
      if (icon) icon.style.display = 'flex'
    })
  }

  // set footer icon links
  if (config.footer_icons_links) {
    Object.keys(config.footer_icons_links).forEach((key) => {
      document.getElementById(key).href = config.footer_icons_links[key]
    })
  }

  // set fsr icon
  if (config.fsr_icon) {
    document.getElementById('fsr_icon').src = config.fsr_icon
    document.getElementById('fsr_icon').style = config.fsr_icon_dashboard_style
    if (config.invert_icon_dark_theme) {
      document.getElementById('fsr_icon').className += ' invert'
    }
  } else {
    document.getElementById('fsr_icon').style.display = 'none'
  }

  // set fsr icon 2
  if (config.fsr_icon_2) {
    document.getElementById('fsr_icon_2').src = config.fsr_icon_2
    document.getElementById('fsr_icon_2').style = config.fsr_icon_dashboard_style_2
  } else {
    document.getElementById('fsr_icon_2').style.display = 'none'
  }

  // set fsr link
  if (config.fsr_link) {
    document.getElementById('fsr_link').href = config.fsr_link
    document.getElementById('fsr_link').style.display = 'unset'
  } else {
    document.getElementById('fsr_link').style.display = 'none'
  }

  // set fsr link 2
  if (config.fsr_link_2) {
    document.getElementById('fsr_link_2').href = config.fsr_link_2
    document.getElementById('fsr_link_2').style.display = 'unset'
  } else {
    document.getElementById('fsr_link_2').style.display = 'none'
  }

  // set pa link
  if (config.pa_link) {
    document.getElementById('pa').href = config.pa_link
  }
}

function setStaticText() {
  document.getElementById('popupHeadline').textContent = strings.popup.title
  document.getElementById('searchListInput').placeholder = strings.popup.searchPlaceholder
  document.getElementById('autoLoginLabel').textContent = strings.popup.autoLogin

  Object.entries(strings.popup.iconTitles).forEach(([id, title]) => {
    const element = document.getElementById(id === 'infoDiscord' ? 'info_discord' : id)
    if (element) element.title = title
  })
}

function facultyName(key, fallback) {
  return strings.settings.faculty.names[key] || fallback
}

function clicksToTime(clicks) {
  clicks = clicks * 3
  const secs = clicks % 60
  const mins = Math.floor(clicks / 60)
  return mins + 'min ' + secs + 's'
}

async function openSettings() {
  chrome.runtime.sendMessage({ cmd: 'open_settings_page', param: '' }) // for some reason I need to pass empty param - else it wont work in ff
  const isFirefox = navigator.userAgent.includes('Firefox/') // attention: no failsave browser detection
  if (isFirefox) window.close()
  return false // Required for ff
}

async function openShare() {
  document.getElementById('list-top').style.display = 'none'
  document.getElementById('list').innerHTML = shareHTML // it needs to be injected this way, else click doesnt work
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Event Listener for Rockets Link
  document.getElementById('rockets_link').addEventListener('click', async (e) => {
    e.preventDefault()
    chrome.runtime.sendMessage({
      cmd: 'open_settings_page',
      params: 'Rockets'
    })
    const isFirefox = navigator.userAgent.includes('Firefox/')
    if (isFirefox) window.close()
    return false
  })
}

function listSearchFunction() {
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
  if (listEntries.length && listEntries[listEntries.length - 1].innerHTML.includes(strings.popup.updateCourseList)) {
    listEntries[listEntries.length - 1].style.display = 'block'
  }
}

function displayCourseList(
  courseList,
  htmlList,
  type,
  closedIntro1,
  ratedCourses,
  closedOutro1,
  ratingEnabledFlag,
  closedMsg1
) {
  let link = ''
  let name = ''
  let imgSrc = ''
  switch (type) {
    case 'favoriten':
      link = 'https://bildungsportal.sachsen.de/opal/auth/resource/favorites'
      name = strings.popup.importOpalCourses
      imgSrc = '../../assets/icons/star.png'
      break
    case 'meine_kurse':
      link = 'https://bildungsportal.sachsen.de/opal/auth/resource/courses'
      name = strings.popup.importOpalCourses
      imgSrc = '../../assets/icons/CoursesOpalIcon.png'
      break
    default:
      break
  }

  // save reload button later, so it appears later in the list
  const reloadButton = {
    name:
      courseList === undefined || courseList.length === 0 || courseList === false
        ? name
        : strings.popup.updateCourseList,
    link,
    img: '../../assets/icons/reload.png'
  }

  if (courseList === undefined || courseList.length === 0 || courseList === false) {
    courseList = []
  }

  // determine when to show outro and intro for course rating
  // THIS NEEDS TO BE ADAPTED FOR EACH SEMESTER because ratedCourses is never purged for now - its only expanded. However, courses which are not longer in courseList shouldnt be in ratedCourses either!
  ratedCourses = ratedCourses || []
  const showIntro =
    ratingEnabledFlag && !closedIntro1 && courseList.length > 1 && !(courseList.length - 2 < ratedCourses.length)
  const showOutro =
    ratingEnabledFlag &&
    !closedOutro1 &&
    courseList.length > 1 &&
    !showIntro &&
    courseList.length - 2 < ratedCourses.length
  const d = new Date()
  const month = d.getMonth() + 1 // starts at 0
  const day = d.getDate()
  //  show gOPAL-Banner at beginning of semester. showMsg1 is resetted in background.js
  const showMsg1 = !showIntro && !showOutro && !closedMsg1 && month === 10 && day < 20

  // add introduction to course Rating element
  if (showIntro) {
    const introRating = document.createElement('div')
    introRating.id = 'intro_rating'
    const introRatingText = document.createElement('p')
    introRating.classList.add('list-entry-wrapper')
    introRatingText.classList.add('list-intro')

    introRatingText.innerHTML = strings.popup.introRating
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

    outroRatingText.innerHTML = strings.popup.outroRating
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

    msg1Text.innerHTML = strings.popup.gopalBanner
    msg1.appendChild(msg1Text)
    htmlList.appendChild(msg1)
  }

  courseList.forEach((element) => {
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
    confirmEntryLink.innerHTML = strings.popup.ratingDone
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
    listEntry.onclick = function (event) {
      // If Cmd/Ctrl is held, open in background tab manually
      if (event.metaKey || event.ctrlKey) {
        event.preventDefault()
        chrome.tabs.create({ url: element.link, active: false })
        saveTwoClicks()
        return false
      }
      // Normal click - let it proceed naturally (popup will close)
      saveTwoClicks()
    }

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
    if (!(element.img === false)) {
      listEntry.appendChild(listImg)
    }
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
    if (
      !(
        element.name === strings.popup.updateCourseList ||
        element.name === strings.popup.importOpalCourses ||
        isRated
      ) &&
      ratingEnabledFlag
    ) {
      listEntrywrapper.appendChild(rateEntryWrapper)
    }
    htmlList.appendChild(listEntrywrapper)
  })

  // add "Alle Kurse/Favoriten öffnen" button if courses have been imported
  if (courseList.length > 0) {
    const openAllCoursesEntry = document.createElement('a')
    const openAllCoursesImg = document.createElement('div')
    const openAllCoursesText = document.createElement('div')
    const openAllCoursesIcon = document.createElement('img')

    openAllCoursesEntry.className = 'list-entry'
    openAllCoursesEntry.style.cursor = 'pointer'
    openAllCoursesEntry.href = '#'
    // give the entry an id so we can reference/disable it reliably
    openAllCoursesEntry.id = 'open_all_courses_entry'

    // If user has more than 25 courses, disable the button and show a hint
    if (courseList.length > 25) {
      openAllCoursesEntry.className += ' disabled'
      openAllCoursesEntry.style.opacity = 0.5
      openAllCoursesEntry.style.pointerEvents = 'none'
      openAllCoursesEntry.title = strings.popup.tooManyCourses
    } else {
      openAllCoursesEntry.onclick = openAllCourses
    }

    openAllCoursesImg.className = 'list-entry-img'
    openAllCoursesText.className = 'list-entry-text'

    // Change text and icon based on current view (type)
    if (type === 'favoriten') {
      openAllCoursesText.innerHTML = strings.popup.openAllFavorites
      openAllCoursesIcon.src = '../../assets/icons/starAll.png'
    } else {
      openAllCoursesText.innerHTML = strings.popup.openAllCourses
      openAllCoursesIcon.src = '../../assets/icons/CoursesOpalIconAll.png'
    }

    // Like the reload icon, add 'invert' so the icon contrasts on dark backgrounds
    openAllCoursesIcon.className = 'list-img invert'

    openAllCoursesImg.appendChild(openAllCoursesIcon)
    openAllCoursesEntry.appendChild(openAllCoursesImg)
    openAllCoursesEntry.appendChild(openAllCoursesText)

    const openAllCoursesWrapper = document.createElement('div')
    openAllCoursesWrapper.className = 'list-entry-wrapper'
    openAllCoursesWrapper.appendChild(openAllCoursesEntry)

    htmlList.appendChild(openAllCoursesWrapper)
  }

  // add reload button
  const reloadEntry = document.createElement('a')
  const reloadImg = document.createElement('div')
  const reloadText = document.createElement('div')
  const reloadIcon = document.createElement('img')

  reloadEntry.className = 'list-entry'
  reloadEntry.href = reloadButton.link
  reloadEntry.target = '_blank'
  reloadEntry.onclick = function (event) {
    // If Cmd/Ctrl is held, open in background tab manually
    if (event.metaKey || event.ctrlKey) {
      event.preventDefault()
      chrome.tabs.create({ url: reloadButton.link, active: false })
      saveTwoClicks()
      return false
    }
    // Normal click - let it proceed naturally (popup will close)
    saveTwoClicks()
  }

  reloadImg.className = 'list-entry-img'
  reloadText.className = 'list-entry-text'
  reloadText.innerHTML = reloadButton.name

  reloadIcon.className = 'list-img invert'
  reloadIcon.src = reloadButton.img

  reloadImg.appendChild(reloadIcon)
  reloadEntry.appendChild(reloadImg)
  reloadEntry.appendChild(reloadText)

  const reloadWrapper = document.createElement('div')
  reloadWrapper.className = 'list-entry-wrapper'
  reloadWrapper.appendChild(reloadEntry)

  htmlList.appendChild(reloadWrapper)

  // Create button so switch courses <> favorites
  const listEntry = document.createElement('a')
  const listImg = document.createElement('div')
  const listText = document.createElement('div')
  const img = document.createElement('img')

  listImg.className = 'list-entry-img'

  listEntry.className = 'list-entry'
  listEntry.href = '#'
  listEntry.style.cursor = 'pointer'
  listEntry.onclick = switchCoursesToShow

  listText.className = 'list-entry-text'

  img.className = 'list-img'

  if (type === 'favoriten') img.src = '../../assets/icons/CoursesOpalIcon.png'
  if (type === 'meine_kurse') img.src = '../../assets/icons/star.png'

  listImg.appendChild(img)
  listEntry.appendChild(listImg)

  if (type === 'favoriten') {
    listText.innerHTML = strings.popup.switchToCourses
  }
  if (type === 'meine_kurse') {
    listText.innerHTML = strings.popup.switchToFavorites
  }

  listEntry.appendChild(listText)
  htmlList.appendChild(listEntry)
}

async function switchCoursesToShow() {
  // Promisified until usage of Manifest V3
  const result = await new Promise((resolve) => chrome.storage.local.get(['dashboardDisplay'], resolve))
  if (result.dashboardDisplay === 'meine_kurse') {
    await new Promise((resolve) => chrome.storage.local.set({ dashboardDisplay: 'favoriten' }, resolve))
  }
  if (result.dashboardDisplay === 'favoriten') {
    await new Promise((resolve) => chrome.storage.local.set({ dashboardDisplay: 'meine_kurse' }, resolve))
  }
  location.reload()
}

async function saveTwoClicks() {
  chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 2 })
}

// changeIsEnabledState
async function saveEnabled() {
  // only save, if user data is available. Else forward to settings page
  // Promisified until usage of Manifest V3
  const isEnabled = await new Promise((resolve) => chrome.storage.local.get(['isEnabled'], resolve))
  // Promisified until usage of Manifest V3
  // If there are multiple platforms user data has to be checked for every platform
  const userDataAvail = await new Promise((resolve) => chrome.runtime.sendMessage({ cmd: 'check_user_data' }, resolve))
  if (userDataAvail) {
    // Promisified until usage of Manifest V3
    await new Promise((resolve) => chrome.storage.local.set({ isEnabled: !isEnabled.isEnabled }, resolve))
  } else {
    await new Promise((resolve) =>
      chrome.runtime.sendMessage(
        {
          cmd: 'open_settings_page',
          params: 'AutoLogin'
        },
        resolve
      )
    )
    window.close()
  }
}

// set switch
async function displayEnabled() {
  // Promisified until usage of Manifest V3
  const isEnabled = await new Promise((resolve) => chrome.storage.local.get(['isEnabled'], resolve))
  document.getElementById('switch').checked = !!isEnabled.isEnabled
}

// return course_list = [{link:link, name: name}, ...]
async function loadCourses(type) {
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
async function selectStudiengangDropdown() {
  document.getElementById('select_studiengang_dropdown_content').classList.toggle('show')
  document.getElementById('select_studiengang_dropdown_id').style.border = 'none'
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({ updateCustomizeStudiengang: dropdownUpdateId }, resolve))
}

async function sendRating() {
  const course = this.getAttribute('courseref')
  const rating = document.getElementById(course).dataset.rating

  console.log('GOT THE FOLLOWING RATING:')
  console.log(course)
  console.log(rating)

  // rating cannot be zero
  if (rating === '0.0') {
    alert(strings.popup.rateBeforeSubmit)
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
  courseURI = courseURI
    .replaceAll('!', '%21')
    .replaceAll("'", '%27')
    .replaceAll('(', '%28')
    .replaceAll(')', '%29')
    .replaceAll('~', '%7E')
  const ratingURI = rating.replace('.', ',')
  // console.log(courseURI)

  // IF YOU ARE TRYING TO HACK please use the following domain instead: https://us-central1-tufastcourseratinghack.cloudfunctions.net/setRatingHACK . It has the same services running. Let me know if you find any security issues - thanks! - oli
  const url =
    'https://us-central1-tufastcourserating2.cloudfunctions.net/setRating?rating=' + ratingURI + '&course=' + courseURI
  // console.log(url)

  const resp = await fetch(url)
  console.log(await resp.text())
}

async function removeIntro() {
  document.getElementById('intro_rating').remove()
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({ closedIntro1: true }, resolve))
}

async function removeOutro() {
  document.getElementById('outro_rating').remove()
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({ closedOutro1: true }, resolve))
}

async function removeMsg1() {
  document.getElementById('msg1-wrapper').remove()
  // Promisified until usage of Manifest V3
  await new Promise((resolve) => chrome.storage.local.set({ closedMsg1: true }, resolve))
}

async function openAllCourses() {
  // Prevent re-entrancy: if already running, ignore subsequent clicks
  const btn = document.getElementById('open_all_courses_entry')
  if (btn?.dataset?.running === 'true') return

  // Mark as running and visually disable the button
  if (btn) {
    btn.dataset.running = 'true'
    btn.style.pointerEvents = 'none'
    btn.style.opacity = 0.6
  }

  // Get current dashboard display type to determine which storage key to use
  const result = await new Promise((resolve) => chrome.storage.local.get(['dashboardDisplay'], resolve))

  const dashboardDisplay = result.dashboardDisplay || 'favoriten'
  const storageKey = dashboardDisplay === 'favoriten' ? 'favoriten' : 'meine_kurse'

  // Send message to background script - it handles ALL validation and opening
  chrome.runtime.sendMessage(
    {
      cmd: 'open_all',
      links: storageKey,
      behavior: 'background_load'
    },
    () => {
      // Re-enable button after operation completes
      if (btn) {
        setTimeout(() => {
          btn.dataset.running = 'false'
          btn.style.pointerEvents = ''
          btn.style.opacity = ''
        }, 2000)
      }
    }
  )
}
