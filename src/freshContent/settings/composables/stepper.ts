import { ref } from "vue"
import steps from '../onboarding.json'

export const useStepper = () => ({
  stepWidth,
  currentOnboardingStep,
  stepsCount,
})

const stepWidth = ref(1)
const currentOnboardingStep = ref(1)
const stepsCount = ref(steps.length)

