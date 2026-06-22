type OnboardingStep = {
  title: string
  icon: string
  h1Key: string
  btnTextKey: string
  skipTextKey: string
}

export default [
  {
    title: 'Welcome',
    icon: '',
    h1Key: 'onboarding.steps.welcome',
    btnTextKey: 'onboarding.start',
    skipTextKey: 'onboarding.skip'
  },
  {
    title: 'FacultySetup',
    icon: 'IconSchool',
    h1Key: 'onboarding.steps.faculty',
    btnTextKey: 'onboarding.next',
    skipTextKey: 'onboarding.skip'
  },
  {
    title: 'LoginSetup',
    icon: 'IconLock',
    h1Key: 'onboarding.steps.login',
    btnTextKey: 'onboarding.next',
    skipTextKey: 'onboarding.skip'
  },
  {
    title: 'OtpSetup',
    icon: 'IconLock',
    h1Key: 'onboarding.steps.otp',
    btnTextKey: 'onboarding.next',
    skipTextKey: 'onboarding.skip'
  },
  {
    title: 'EMailSetup',
    icon: 'IconNotification',
    h1Key: 'onboarding.steps.email',
    btnTextKey: 'onboarding.next',
    skipTextKey: 'onboarding.skip'
  },
  {
    title: 'OpalSelmaSetup',
    icon: 'IconAdjustments',
    h1Key: 'onboarding.steps.opalSelma',
    btnTextKey: 'onboarding.next',
    skipTextKey: 'onboarding.skip'
  },
  {
    title: 'SearchengineSetup',
    icon: 'IconSearch',
    h1Key: 'onboarding.steps.searchEngines',
    btnTextKey: 'onboarding.next',
    skipTextKey: 'onboarding.skip'
  },
  {
    title: 'DoneSetup',
    icon: 'IconRocket',
    h1Key: 'onboarding.steps.done',
    btnTextKey: 'onboarding.finish',
    skipTextKey: ''
  }
] as const satisfies readonly OnboardingStep[]
