interface Course {
  name: string;
  link: string;
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

    // Get the current courses
    const favorites: Course[] = []
    const courses: Course[] = []

    const tableRows: NodeList = document.querySelectorAll('.table-panel tbody tr');
    (Array.from(tableRows) as HTMLTableRowElement[]).forEach(row => {
      const link: HTMLAnchorElement = row.children[2]?.children[0] as HTMLAnchorElement
      if (!link || !link.href || !link.textContent) return
      const c = {
        link: link.href,
        name: link.textContent
      }
      courses.push(c)

      if (row.children[0].getElementsByClassName('icon-star-filled').length > 0) {
        favorites.push(c)
      }
    })

    // If the user has no courses and favorites - nothing to do here anymore
    if (courses.length < 1 && favorites.length) return
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
