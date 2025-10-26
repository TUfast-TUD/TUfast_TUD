import { createApp } from 'vue'
import Settings from './Settings.vue'
import '@lottiefiles/lottie-player'
// Import needed Icons from Tabler Vue
import {
  IconArrowUpRight,
  IconWorld,
  IconShield,
  IconChevronDown,
  IconLock,
  IconNotification,
  IconList,
  IconFileText,
  IconChartBar,
  IconBrandSpeedtest,
  IconSearch,
  IconRocket,
  IconInfoCircle,
  IconMail,
  IconSchool,
  IconLanguage,
  IconCheck,
  IconClick,
  IconStopwatch,
  IconArrowRight,
  IconX,
  IconCircleX,
  IconCircleCheck,
  IconAlertCircle,
  IconPointFilled,
  IconHeartHandshake,
  IconAdjustments,
  IconChevronLeft,
  IconSettings,
  IconLogin2,
  IconConfetti
} from '@tabler/icons-vue'

// Create the app instance
const app = createApp(Settings)

// Register Tabler icons globally
app.component('IconArrowUpRight', IconArrowUpRight)
app.component('IconWorld', IconWorld)
app.component('IconShield', IconShield)
app.component('IconChevronDown', IconChevronDown)
app.component('IconLock', IconLock)
app.component('IconNotification', IconNotification)
app.component('IconList', IconList)
app.component('IconFileText', IconFileText)
app.component('IconChartBar', IconChartBar)
app.component('IconBrandSpeedtest', IconBrandSpeedtest)
app.component('IconSearch', IconSearch)
app.component('IconRocket', IconRocket)
app.component('IconInfoCircle', IconInfoCircle)
app.component('IconMail', IconMail)
app.component('IconSchool', IconSchool)
app.component('IconLanguage', IconLanguage)
app.component('IconCheck', IconCheck)
app.component('IconClick', IconClick)
app.component('IconStopwatch', IconStopwatch)
app.component('IconArrowRight', IconArrowRight)
app.component('IconX', IconX)
app.component('IconCircleX', IconCircleX)
app.component('IconCircleCheck', IconCircleCheck)
app.component('IconAlertCircle', IconAlertCircle)
app.component('IconPointFilled', IconPointFilled)
app.component('IconHeartHandshake', IconHeartHandshake)
app.component('IconAdjustments', IconAdjustments)
app.component('IconChevronLeft', IconChevronLeft)
app.component('IconSettings', IconSettings)
app.component('IconLogin2', IconLogin2)
app.component('IconConfetti', IconConfetti)

// Mount your app
app.mount('#app')
