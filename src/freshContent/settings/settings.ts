import type { Setting } from './types/Setting'

export default [
  {
    titleKey: 'settings.tiles.autoLogin',
    icon: 'IconLock',
    settingsPage: 'AutoLogin',
    category: 'function',
    settingType: 'login'
  },
  {
    titleKey: 'settings.tiles.email',
    icon: 'IconNotification',
    settingsPage: 'Email',
    category: 'function',
    settingType: 'owa'
  },
  {
    titleKey: 'settings.tiles.improveOpal',
    icon: 'IconFileText',
    settingsPage: 'ImproveOpal',
    category: 'function',
    settingType: 'opalPdf'
  },
  {
    titleKey: 'settings.tiles.improveSelma',
    icon: 'IconChartBar',
    settingsPage: 'ImproveSelma',
    category: 'function',
    settingType: 'selma'
  },
  {
    titleKey: 'settings.tiles.searchEngines',
    icon: 'IconSearch',
    settingsPage: 'SearchEngines',
    category: 'function',
    settingType: 'searchengine'
  },
  {
    titleKey: 'settings.tiles.shortcuts',
    icon: 'IconBrandSpeedtest',
    settingsPage: 'Shortcuts',
    category: 'function',
    settingType: ''
  },
  {
    titleKey: 'settings.tiles.rockets',
    icon: 'IconRocket',
    settingsPage: 'Rockets',
    category: 'function',
    settingType: ''
  },
  {
    titleKey: 'settings.tiles.about',
    icon: 'IconInfoCircle',
    settingsPage: 'About',
    category: 'information',
    settingType: ''
  },
  {
    titleKey: 'settings.tiles.contact',
    icon: 'IconMail',
    settingsPage: 'Contact',
    category: 'information',
    settingType: ''
  },
  {
    titleKey: 'settings.tiles.faculty',
    icon: 'IconSchool',
    settingsPage: 'ChooseFaculty',
    category: 'personalization',
    settingType: 'faculty'
  },
  {
    titleKey: 'settings.tiles.language',
    icon: 'IconLanguage',
    settingsPage: 'LanguageSelect',
    category: 'personalization',
    settingType: ''
  }
] as const satisfies readonly Setting[]
