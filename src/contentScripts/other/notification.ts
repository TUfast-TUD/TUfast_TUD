// create notification container
const notificationContainer = document.createElement('div')
notificationContainer.classList.add('notifications')

document.body.append(notificationContainer)

export const notify = (msg: string) => {
  // create notification element with all components
  const notification = document.createElement('div')
  const closeButton = document.createElement('button')
  const iconContainer = document.createElement('div')
  const textParagraph = document.createElement('p')

  // configure notification
  notification.classList.add('notifications__notification')

  // configure close button
  closeButton.classList.add('notifications__close-button')
  closeButton.innerHTML = '×'
  closeButton.onclick = () => {
    notification.classList.add('fade-out')
    setTimeout(() => notification.remove(), 400)
  }

  // SVG checkmark
  iconContainer.classList.add('notifications__icon')
  iconContainer.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M5 12l5 5l10 -10" />
    </svg>
  `

  // configure text
  textParagraph.innerHTML = msg

  // append elements to notification
  notification.append(closeButton, iconContainer, textParagraph)
  notificationContainer.prepend(notification)

  // set timeout for notification to be removed automatically
  setTimeout(() => {
    notification.classList.add('fade-out')
    setTimeout(() => notification.remove(), 400)
  }, 10000)
}

export interface NotificationNamespace {
  notify: typeof notify
}
