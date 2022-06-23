// create notification container
const notificationContainer = document.createElement('div')
notificationContainer.classList.add('notifications')

document.body.append(notificationContainer)

export const notify = (msg: string) => {
  // create a notification element, a close button and TUfast logo
  const notification = document.createElement('div')
  const closeButton = document.createElement('div')
  const logo = document.createElement('img')

  // configure notification
  notification.classList.add('notifications__notification')
  notification.innerHTML = `<span>${msg}</span>`

  // configure close button
  closeButton.classList.add('notifications__close-button')
  closeButton.innerText = 'X'
  closeButton.onclick = () => {
    notification.classList.add('fade-out')
    setTimeout(() => notification.remove(), 500)
  }

  // configure logo
  logo.src = chrome.runtime.getURL('/assets/images/tufast48.png')

  // apend close icon & logo to notification and notification to container
  notification.prepend(logo, closeButton)
  notificationContainer.prepend(notification)

  // set timeout for notification to be removed automatically
  setTimeout(() => {
    notification.classList.add('fade-out')
    // console.log("added fade-out")
    setTimeout(() => notification.remove(), 500)
  }, 50000)
}
