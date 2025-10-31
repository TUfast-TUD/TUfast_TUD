// Script used for reading storage and displaying indicators
// Can not write or save anything in storage
import { ref, onMounted, onUnmounted } from 'vue'

export interface SettingsStatus {
  otp: boolean
  owa: boolean
  opalPdf: boolean
  userData: boolean
  login: boolean
  selma: boolean
  searchengine: boolean
  faculty: string
}

// Shared state outside the composable
const settings = ref<SettingsStatus>({
  userData: false,
  otp: false,
  owa: false,
  opalPdf: false,
  login: false,
  selma: false,
  searchengine: false,
  faculty: 'general'
})

const loading = ref(true)
const error = ref<string | null>(null)
let listenerCount = 0
let isListenerAttached = false

// Mapping of storage keys to setting types
const storageKeyMap: Record<string, keyof SettingsStatus> = {
  enabledOWAFetch: 'owa',
  additionalNotificationOnNewMail: 'owa',
  pdfInInline: 'opalPdf',
  pdfInNewTab: 'opalPdf',
  improveSelma: 'selma',
  fwdEnabled: 'searchengine',
  studiengang: 'faculty'
}

const checkAllSettings = async (platform: string = 'zih') => {
  try {
    loading.value = true
    error.value = null

    const result = await new Promise<SettingsStatus>((resolve) => {
      chrome.runtime.sendMessage(
        {
          cmd: 'check_all_settings',
          platform: platform
        },
        (response) => {
          resolve(response)
        }
      )
    })

    settings.value = result
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
    console.error('Error checking settings:', err)
  } finally {
    loading.value = false
  }
}

// Check if ANY login method is configured (ZIH userData, OTP, or SLUB userData)
const checkLoginStatus = async () => {
  try {
    const hasZihLogin = await new Promise<boolean>((resolve) => {
      chrome.runtime.sendMessage(
        {
          cmd: 'check_user_data',
          platform: 'zih'
        },
        (response) => resolve(response)
      )
    })

    const hasSlubLogin = await new Promise<boolean>((resolve) => {
      chrome.runtime.sendMessage(
        {
          cmd: 'check_user_data',
          platform: 'slub'
        },
        (response) => resolve(response)
      )
    })

    settings.value.login = hasZihLogin || hasSlubLogin
  } catch (err) {
    console.error('Error checking login status:', err)
  }
}

// Check specific setting based on what changed in storage
const checkSpecificSetting = async (settingType: keyof SettingsStatus, platform: string = 'zih') => {
  try {
    // Check the specific setting based on type
    switch (settingType) {
      case 'owa':
        chrome.storage.local.get(['enabledOWAFetch', 'additionalNotificationOnNewMail'], (result) => {
          settings.value.owa = (result.enabledOWAFetch ?? false) || (result.additionalNotificationOnNewMail ?? false)
        })
        break

      case 'opalPdf':
        chrome.storage.local.get(['pdfInInline', 'pdfInNewTab'], (result) => {
          settings.value.opalPdf = (result.pdfInInline ?? false) || (result.pdfInNewTab ?? false)
        })
        break

      case 'selma':
        chrome.storage.local.get(['improveSelma'], (result) => {
          settings.value.selma = result.improveSelma ?? false
        })
        break

      case 'searchengine':
        chrome.storage.local.get(['fwdEnabled'], (result) => {
          settings.value.searchengine = result.fwdEnabled ?? false
        })
        break

      case 'faculty':
        {
          const { default: studies } = await import('../../studies.json')
          chrome.storage.local.get(['studiengang'], (result) => {
            const studiengangId = result.studiengang ?? 'general'
            const faculty = studies[studiengangId]
            settings.value.faculty = faculty && faculty.name ? faculty.name : studies.general.name
          })
        }
        break

      case 'login':
        await checkLoginStatus()
        break

      case 'otp':
      case 'userData':
        // For credentials-based settings, we still need to check with background
        await checkAllSettings(platform)
        // Also update the combined login status
        await checkLoginStatus()
        break
    }
  } catch (err) {
    console.error('Error checking specific setting:', err)
  }
}

const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, platform: string = 'zih') => {
  // Track which settings need to be updated
  const settingsToUpdate = new Set<keyof SettingsStatus>()

  // Check which settings were affected by the storage changes
  Object.keys(changes).forEach((key) => {
    const settingType = storageKeyMap[key]
    if (settingType) {
      settingsToUpdate.add(settingType)
    }
  })

  // Update only the affected settings
  settingsToUpdate.forEach((settingType) => {
    checkSpecificSetting(settingType, platform)
  })
}

export function useAllSettingsStatus(platform: string = 'zih') {
  const storageChangeHandler = (changes: { [key: string]: chrome.storage.StorageChange }) => {
    handleStorageChange(changes, platform)
  }

  // Handler for credential updates
  const messageHandler = (message: any) => {
    if (message.cmd === 'credentials_updated') {
      checkLoginStatus()

      if (!message.platform || message.platform === platform) {
        checkAllSettings(platform)
      }
    }
  }

  onMounted(() => {
    listenerCount++

    // Only attach listener once
    if (!isListenerAttached) {
      checkAllSettings(platform)
      checkLoginStatus()
      chrome.storage.onChanged.addListener(storageChangeHandler)
      chrome.runtime.onMessage.addListener(messageHandler)
      isListenerAttached = true
    }
  })

  onUnmounted(() => {
    listenerCount--

    // Only remove listener when no components are using it
    if (listenerCount === 0 && isListenerAttached) {
      chrome.storage.onChanged.removeListener(storageChangeHandler)
      chrome.runtime.onMessage.removeListener(messageHandler)
      isListenerAttached = false
    }
  })

  return {
    settings,
    loading,
    error,
    checkAllSettings: () => checkAllSettings(platform)
  }
}
