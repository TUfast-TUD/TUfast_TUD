import { t } from '../../i18n'
import type { Setting } from './types/Setting'

export default [
  {
    title: t('settings.tiles.autoLogin'),
    icon: 'IconLock',
    settingsPage: 'AutoLogin',
    category: 'function',
    settingType: 'login'
  },
  {
    title: t('settings.tiles.email'),
    icon: 'IconNotification',
    settingsPage: 'Email',
    category: 'function',
    settingType: 'owa'
  },
  {
    title: t('settings.tiles.improveOpal'),
    icon: 'IconFileText',
    settingsPage: 'ImproveOpal',
    category: 'function',
    settingType: 'opalPdf'
  },
  {
    title: t('settings.tiles.improveSelma'),
    icon: 'IconChartBar',
    settingsPage: 'ImproveSelma',
    category: 'function',
    settingType: 'selma'
  },
  {
    title: t('settings.tiles.searchEngines'),
    icon: 'IconSearch',
    settingsPage: 'SearchEngines',
    category: 'function',
    settingType: 'searchengine'
  },
  {
    title: t('settings.tiles.shortcuts'),
    icon: 'IconBrandSpeedtest',
    settingsPage: 'Shortcuts',
    category: 'function',
    settingType: ''
  },
  {
    title: t('settings.tiles.rockets'),
    icon: 'IconRocket',
    settingsPage: 'Rockets',
    category: 'function',
    settingType: ''
  },
  {
    title: t('settings.tiles.about'),
    icon: 'IconInfoCircle',
    settingsPage: 'About',
    category: 'information',
    settingType: ''
  },
  {
    title: t('settings.tiles.contact'),
    icon: 'IconMail',
    settingsPage: 'Contact',
    category: 'information',
    settingType: ''
  },
  {
    title: t('settings.tiles.faculty'),
    icon: 'IconSchool',
    settingsPage: 'ChooseFaculty',
    category: 'personalization',
    settingType: 'faculty'
  },
  {
    title: `${t('settings.tiles.language')} (Beta)`,
    icon: 'IconLanguage',
    settingsPage: 'LanguageSelect',
    category: 'personalization',
    settingType: ''
  }
] as const satisfies readonly Setting[]
