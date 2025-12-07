;(async () => {
  // Warte auf den Container
  const waitForContainer = () => {
    return new Promise<HTMLElement>((resolve) => {
      const check = () => {
        const div = document.querySelector('.tufast-opal-header')
        if (div) {
          resolve(div as HTMLElement)
        } else {
          setTimeout(check, 100)
        }
      }
      check()
    })
  }

  const div = await waitForContainer()

  const closeAllCourseTabsButton = document.createElement('span')
  closeAllCourseTabsButton.id = 'closeAllCourseTabsButton'
  closeAllCourseTabsButton.title = 'Alle Kurse schließen. Ein TUfast-Feature.'
  closeAllCourseTabsButton.textContent = 'Alle Kurse schließen'

  function closeAllTabs() {
    function clickNextCloseButton() {
      const closeButtons = document.querySelectorAll('.btn-close.icon.only')
      if (closeButtons.length > 0) {
        ;(closeButtons[0] as HTMLElement).click()
        setTimeout(clickNextCloseButton, 1000)
      }
    }
    clickNextCloseButton()
  }

  closeAllCourseTabsButton.addEventListener('click', (e) => {
    e.preventDefault()
    closeAllTabs()
  })

  div.appendChild(closeAllCourseTabsButton)
})()
