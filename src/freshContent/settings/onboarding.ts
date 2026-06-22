import { strings } from '../../i18n'

export default [
  {
    title: 'Welcome',
    icon: '',
    h1: strings.onboarding.steps.welcome,
    btnText: strings.onboarding.start,
    skipText: strings.onboarding.skip
  },
  {
    title: 'FacultySetup',
    icon: 'IconSchool',
    h1: strings.onboarding.steps.faculty,
    btnText: strings.onboarding.next,
    skipText: strings.onboarding.skip
  },
  {
    title: 'LoginSetup',
    icon: 'IconLock',
    h1: strings.onboarding.steps.login,
    btnText: strings.onboarding.next,
    skipText: strings.onboarding.skip
  },
  {
    title: 'OtpSetup',
    icon: 'IconLock',
    h1: strings.onboarding.steps.otp,
    btnText: strings.onboarding.next,
    skipText: strings.onboarding.skip
  },
  {
    title: 'EMailSetup',
    icon: 'IconNotification',
    h1: strings.onboarding.steps.email,
    btnText: strings.onboarding.next,
    skipText: strings.onboarding.skip
  },
  {
    title: 'OpalSelmaSetup',
    icon: 'IconAdjustments',
    h1: strings.onboarding.steps.opalSelma,
    btnText: strings.onboarding.next,
    skipText: strings.onboarding.skip
  },
  {
    title: 'SearchengineSetup',
    icon: 'IconSearch',
    h1: strings.onboarding.steps.searchEngines,
    btnText: strings.onboarding.next,
    skipText: strings.onboarding.skip
  },
  {
    title: 'DoneSetup',
    icon: 'IconRocket',
    h1: strings.onboarding.steps.done,
    btnText: strings.onboarding.finish,
    skipText: ''
  }
]
