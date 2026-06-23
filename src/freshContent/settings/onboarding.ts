import { t } from '../../i18n'

type OnboardingStep = {
  title: string
  icon: string
  h1: string
  btnText: string
  skipText: string
}

export default [
  {
    title: 'Welcome',
    icon: '',
    h1: t('onboarding.steps.welcome'),
    btnText: t('onboarding.start'),
    skipText: t('onboarding.skip')
  },
  {
    title: 'FacultySetup',
    icon: 'IconSchool',
    h1: t('onboarding.steps.faculty'),
    btnText: t('onboarding.next'),
    skipText: t('onboarding.skip')
  },
  {
    title: 'LoginSetup',
    icon: 'IconLock',
    h1: t('onboarding.steps.login'),
    btnText: t('onboarding.next'),
    skipText: t('onboarding.skip')
  },
  {
    title: 'OtpSetup',
    icon: 'IconLock',
    h1: t('onboarding.steps.otp'),
    btnText: t('onboarding.next'),
    skipText: t('onboarding.skip')
  },
  {
    title: 'EMailSetup',
    icon: 'IconNotification',
    h1: t('onboarding.steps.email'),
    btnText: t('onboarding.next'),
    skipText: t('onboarding.skip')
  },
  {
    title: 'OpalSelmaSetup',
    icon: 'IconAdjustments',
    h1: t('onboarding.steps.opalSelma'),
    btnText: t('onboarding.next'),
    skipText: t('onboarding.skip')
  },
  {
    title: 'SearchengineSetup',
    icon: 'IconSearch',
    h1: t('onboarding.steps.searchEngines'),
    btnText: t('onboarding.next'),
    skipText: t('onboarding.skip')
  },
  {
    title: 'DoneSetup',
    icon: 'IconRocket',
    h1: t('onboarding.steps.done'),
    btnText: t('onboarding.finish'),
    skipText: ''
  }
] as const satisfies readonly OnboardingStep[]
