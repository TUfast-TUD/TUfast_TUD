import { ref } from "vue";
import steps from "../onboarding.json";

import { useChrome } from "../composables/chrome";

const { setChromeLocalStorage } = useChrome();

export const useStepper = () => ({
  stepWidth,
  currentOnboardingStep,
  stepsCount,
  next,
  hideWelcome,
  percentDone,
});

const stepWidth = ref(1);
const currentOnboardingStep = ref(1);
const stepsCount = ref(steps.length);
const percentDone = ref(0);
const hideWelcome = ref(false);

const next = () => {
  if (currentOnboardingStep.value < stepsCount.value) {
    currentOnboardingStep.value += stepWidth.value;
    stepWidth.value = 1;
    percentDone.value = (currentOnboardingStep.value / stepsCount.value) * 100;
  } else {
    close();
  }
};

const close = () => {
  document.querySelector(".onboarding")?.classList.add("onboarding--closing");
  setTimeout(disableWelcome, 650);
};

// disables the welcome message once the user
// did the onboarding once (or canceled it)
const disableWelcome = async () => {
  await setChromeLocalStorage({ hideWelcome: true });
  hideWelcome.value = true;
};
