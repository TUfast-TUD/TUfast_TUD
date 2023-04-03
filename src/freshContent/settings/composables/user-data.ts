import { useChrome } from './chrome'

const {
  setChromeLocalStorage,
  sendChromeRuntimeMessage
} = useChrome()

export const useUserData = () => ({
  saveUserData,
  deleteUserData
})

const saveUserData = async (uname: string, pwd: string, platform: string) => {
  await setChromeLocalStorage({ isEnabled: true }) // activate auto login feature
  await sendChromeRuntimeMessage({
    cmd: 'set_user_data',
    userData: { user: uname, pass: pwd },
    platform: platform
  })
}

const deleteUserData = async (platform: string) => {
  await sendChromeRuntimeMessage({ cmd: 'clear_badge' })
  await sendChromeRuntimeMessage({ cmd: 'delete_user_data', platform: platform })
  await setChromeLocalStorage({ isEnabled: false }) // deactivate auto login feature

  // deactivate owa fetch
  if (platform === 'zih') {
    await sendChromeRuntimeMessage({ cmd: 'disable_owa_fetch' })
    await setChromeLocalStorage({ enabledOWAFetch: false })
    await setChromeLocalStorage({ additionalNotificationOnNewMail: false })
  }
}
