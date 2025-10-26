import { ref } from 'vue'
import steps from '../onboarding.json'

import { useChrome } from '../composables/chrome'

const { setChromeLocalStorage } = useChrome()

export const useStepper = () => ({
  stepWidth,
  currentOnboardingStep,
  stepsCount,
  next,
  prev,
  hideWelcome,
  percentDone,
  close
})

const stepWidth = ref(1)
const currentOnboardingStep = ref(1)
const stepsCount = ref(steps.length)
const percentDone = ref(0)
const hideWelcome = ref(false)

const next = () => {
  if (currentOnboardingStep.value < stepsCount.value) {
    currentOnboardingStep.value += stepWidth.value
    stepWidth.value = 1
    percentDone.value = (currentOnboardingStep.value / stepsCount.value) * 100
  } else {
    close()
  }
}

const prev = () => {
  if (currentOnboardingStep.value > 1) {
    currentOnboardingStep.value -= 1
    percentDone.value = (currentOnboardingStep.value / stepsCount.value) * 100
  }
}

const close = async () => {
  await disableWelcome()
}

// disables the welcome message once the user
// did the onboarding once (or canceled it)
const disableWelcome = async () => {
  await setChromeLocalStorage({ hideWelcome: true })
  hideWelcome.value = true
}
