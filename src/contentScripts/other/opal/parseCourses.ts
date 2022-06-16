interface Course {
  name: string;
  link: string;
}

interface ParseResult {
  courses: Course[];
  favorites: Course[];
}

function parseTable (tbody: HTMLTableSectionElement): ParseResult {
  if (!tbody) throw new Error('Cannot parse table')

  // Get the current courses
  const favorites: Course[] = []
  const courses: Course[] = []

  const tableRows: HTMLCollection = tbody.getElementsByTagName('tr')
  for (const row of tableRows) {
    const linkElement: HTMLAnchorElement = row.getElementsByTagName('a')[0] as HTMLAnchorElement

    if (!linkElement || !linkElement.href || !linkElement.textContent) continue
    if (linkElement.textContent.trim().endsWith('[beendet]') || linkElement.textContent.trim().endsWith('[finished]')) continue // Course is finished

    const c = {
      link: linkElement.href,
      name: linkElement.textContent
    }
    courses.push(c)

    if (row.getElementsByClassName('icon-star-filled').length > 0) favorites.push(c)
  }

  return { courses, favorites }
}

function parseList (previewContainer: HTMLDivElement): ParseResult {
  const courses: Course[] = []
  const favorites: Course[] = []

  const listItems: HTMLCollection = previewContainer.getElementsByClassName('content-preview')

  for (const item of listItems) {
    const linkElement: HTMLAnchorElement = item.querySelector('.content-preview > a') as HTMLAnchorElement
    const titleElement = item.querySelector('.content-preview-main .content-preview-title') as HTMLHeadingElement

    if (!linkElement || !linkElement.href || !titleElement || !titleElement.textContent) continue
    if (titleElement.textContent.trim().endsWith('[beendet]') || titleElement.textContent.trim().endsWith('[finished]')) continue // Course is finished

    const c = {
      link: linkElement.href,
      name: titleElement.textContent
    }
    courses.push(c)

    if (item.getElementsByClassName('icon-star-filled').length > 0) favorites.push(c)
  }

  return { courses, favorites }
}

(async () => {
  const mainFunction = async () => {
    // We are only interested in these two pages
    if (window.location.pathname !== '/opal/auth/resource/courses' && window.location.pathname !== '/opal/auth/resource/favorites') return

    // We know one of the two pages is loaded so we only need to check which of those two
    const currentPage = window.location.pathname === '/opal/auth/resource/courses' ? 'meine_kurse' : 'favoriten'

    // Show all courses
    // If this is possible we don't need to do anything else because the MutationObserver will fire again
    const pages = document.querySelectorAll('li.page').length
    if (pages > 1) {
      (document.getElementsByClassName('pager-showall')[0] as HTMLAnchorElement | undefined)?.click()
      return
    }

    const tablePanel = document.getElementsByClassName('table-panel')[0]
    if (!tablePanel) return

    const previewContainer = tablePanel.getElementsByClassName('content-preview-container')[0]

    const { courses, favorites } = previewContainer ? parseList(previewContainer as HTMLDivElement) : parseTable(tablePanel.getElementsByTagName('tbody')[0])

    // If the user has no courses - nothing to do here anymore (favorites can only be a subset of courses, so no check needed)
    if (courses.length === 0) return

    // Sort them by name
    courses.sort((a, b) => a.name.localeCompare(b.name))

    // Get the old data to check if something changed
    const { meine_kurse: currentCoursesStr, favoriten: currentFavouritesStr } = await new Promise<any>((resolve) => chrome.storage.local.get(['meine_kurse', 'favoriten'], resolve))
    // Make an object out of it but in a scoped function so we can handle the error better
    const parseJson = (input: string) => {
      try {
        return JSON.parse(input)
      } catch {
        return undefined
      }
    }

    const currentCourses: Course[] = parseJson(currentCoursesStr)
    const currentFavourites: Course[] = parseJson(currentFavouritesStr)

    const firstTime = currentCourses === undefined

    // Compare those lists:
    // If they are the same we don't need to do anything
    const arraysAreSame = (array1: any[], array2: any[]) => {
      // When lengths are different we know something changed
      if (array1.length !== array2.length) return false

      // We need to match every course from one list to another
      // We only need one way because we know the lists are the same size.
      return array1.every((course) => {
        return !!array2.find(c => c.name === course.name && c.link === course.link)
      })
    }

    // We don't want to update the course list on the favorites only page
    const coursesChanged = currentPage === 'meine_kurse' && !arraysAreSame(currentCourses || [], courses)
    const favouritesChanged = !arraysAreSame(currentFavourites || [], favorites)

    // eslint-disable-next-line camelcase
    const updateObj: {meine_kurse?: string, favoriten?: string} = {}
    if (coursesChanged) updateObj.meine_kurse = JSON.stringify(courses)
    if (favouritesChanged) updateObj.favoriten = JSON.stringify(favorites)

    if (Object.keys(updateObj).length > 0) {
      await new Promise<void>((resolve) => chrome.storage.local.set(updateObj, resolve))
    }

    if (firstTime && updateObj.meine_kurse) {
      // TODO
      // Show banner
    } else if (coursesChanged || favouritesChanged) {
      // TODO
      // Show other banner
    }
  }

  // When the content changes we need to rerun as the tab is not getting reloaded
  const content = document.getElementsByClassName('content-container')[0]
  if (!content) return

  new MutationObserver(mainFunction).observe(content, { subtree: true, childList: true })

  // Run the function a first time
  mainFunction()
})()
