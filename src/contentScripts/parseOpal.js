chrome.storage.local.get(['isEnabled', 'seenInOpalAfterDashbaordUpdate', 'removedOpalBanner', 'saved_click_counter', 'mostLiklySubmittedReview', 'removedReviewBanner', 'neverShowedReviewBanner'], (result) => {
  // decide whether to show dashbaord banner
  const showDashboardBanner = result.seenInOpalAfterDashbaordUpdate < 5 && !result.removedOpalBanner
  chrome.storage.local.set({ seenInOpalAfterDashbaordUpdate: result.seenInOpalAfterDashbaordUpdate + 1 })

  // wait until full page is loaded
  window.addEventListener('load', async () => {
    let oldLocationHref = location.href
    let parsedCourses = false

    // show banner
    if (showDashboardBanner) { showDashboardBannerFunc() }
    //

    // if all courses loaded --> parse
    if (!document.getElementsByClassName('pager-showall')[0]) {
      chrome.runtime.sendMessage({ cmd: 'save_courses', course_list: parseCoursesFromWebPage() })
      parsedCourses = true
      // if not --> load all courses
    } else {
      document.getElementsByClassName('pager-showall')[0].click()
      chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
      parsedCourses = false
    }

    // close banner buttons
    if (this.document.getElementById('closeOpalBanner')) {
      this.document.getElementById('closeOpalBanner').onclick = closeOpalBanner
    }

    // use mutation observer to detect page changes
    const config = { attributes: true, childList: true, subtree: true }
    const callback = (_mutationsList, _observer) => {
      const chrome = this.chrome
      // detect new page
      if (location.href !== oldLocationHref) {
        oldLocationHref = location.href
        // all courses loaded already --> parse directly
        if (!document.getElementsByClassName('pager-showall')[0]) {
          const courseList = parseCoursesFromWebPage()
          chrome.runtime.sendMessage({ cmd: 'save_courses', course_list: courseList })
          parsedCourses = true
        }
        // not all courses loaded already --> load all courses
        if (document.getElementsByClassName('pager-showall')[0]?.innerText === 'alle anzeigen') {
          document.getElementsByClassName('pager-showall')[0].click()
          chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 })
          parsedCourses = false
        }
      }

      // parse courses
      if (document.getElementsByClassName('pager-showall')[0]) {
        if (document.getElementsByClassName('pager-showall')[0].innerText === 'Seiten' && !parsedCourses) {
          chrome.runtime.sendMessage({ cmd: 'save_courses', course_list: parseCoursesFromWebPage() })
          parsedCourses = true
        }
      }
    }
    const observer = new MutationObserver(callback)
    observer.observe(document.body, config)
  }, true)
})

function closeOpalBanner () {
  if (document.getElementById('opalBanner')) {
    document.getElementById('opalBanner').remove()
    chrome.storage.local.set({ removedOpalBanner: true }, () => { })
  }
}

// CSS found in banner.css
function showDashboardBannerFunc () {
  // create banner div
  const banner = document.createElement('div')
  banner.classList.add('banner')
  // create image for rocket
  const img = document.createElement('img')
  img.classList.add('banner__icon')
  img.src = chrome.runtime.getURL('../assets/icons/RocketIcons/default_128px.png')
  // create title
  const title = document.createElement('h2')
  title.classList.add('banner__title')
  title.innerHTML = 'Hier Dashboard öffnen oder <strong>Alt + Q</strong> drücken'
  // create close button
  const button = document.createElement('button')
  button.classList.add('banner__close')
  button.innerHTML = '&#215;'
  button.addEventListener('click', () => {
    banner.remove()
    chrome.storage.local.set({ removedOpalBanner: true })
  })

  banner.appendChild(img)
  banner.appendChild(title)
  banner.appendChild(button)
  document.body.appendChild(banner)
}

function parseCoursesFromWebPage () {
  let courseList = { type: '', list: [] }
  if (location.pathname === '/opal/auth/resource/courses') { courseList.type = 'meine_kurse' }
  if (location.pathname === '/opal/auth/resource/favorites') { courseList.type = 'favoriten' }
  // there are two options, how the coursse-overview table can be build.
  // They are simply tried out
  try {
    const tableEntries = document.querySelector('.table-panel tbody')?.children
    for (const item of tableEntries) {
      const name = item.children[2].children[0].getAttribute('title')
      const link = item.children[2].children[0].getAttribute('href')
      courseList.list.push({ name: name, link: link })
    }
    // There is a reported case, where no error is thrown and course_list has entries, but all of them are empty
    // Of course this is not wanted. So in this case, also throw an error
    const getAllNullEntries = courseList.list.filter(el => !el.link && !el.name) // this contains all entries, where link and name is false (i.e. null)
    if (getAllNullEntries.length > 2) { // when more than two null-entries: most likely unwanted case
      courseList = { type: '', list: [] } // reset course list
      throw new Error('most likely parsing error') // throw error
    }
  } catch {
    const tableEntries = document.querySelectorAll('.table-panel .content-preview-container .list-unstyled .content-preview.content-preview-horizontal')
    for (const item of tableEntries) {
      try {
        const name = item.getElementsByClassName('content-preview-title')[0].innerHTML
        const link = item.children[3].getAttribute('href')
        courseList.list.push({ name: name, link: link })
      } catch (e) { console.log('Error in parsing course list. Could not parse course list: ' + e) }
    }
  }

  // alert, if still null-entries found
  const getAllNullEntriesFinal = courseList.list.filter(el => !el.link && !el.name)
  if (getAllNullEntriesFinal.length > 0) { console.log('Possible Error in parsing courses. Found null entries.') }
  // if present, remove all null entries
  courseList.list = courseList.list.filter(el => !(!el.link && !el.name))

  return courseList
}
