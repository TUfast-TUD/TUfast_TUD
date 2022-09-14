<template>
  <div class="main-grid">
    <header class="main-grid__header">
      <h1 class="upper txt-bold main-grid__title">
        Willkommen bei TUFast 🚀
      </h1>
      <h3 class="txt-bold main-grid__subtitle">
        Hier kannst du alle Funktionen entdecken und Einstellungen vornehmen.
      </h3>
    </header>
    <ColorSwitch
      class="main-grid__color-select"
      :anim-state="animState"
      @click="toggleTheme()"
    />
    <div class="main-grid__menues">
      <Dropdown />
      <Statistics />
      <LanguageSelect />
    </div>
    <div class="main-grid__settings">
      <SettingTile
        v-for="(setting, index) in settings"
        :key="index"
        :icon="setting.icon"
        :title="setting.title"
        class="main-grid__tile"
        @click="openSetting(setting)"
      />
    </div>
  </div>
  <Card
    v-if="showCard"
    :title="currentSetting.title"
    @close-me="showCard=false"
  >
    <template #default>
      <component :is="currentSetting.settingsPage" />
    </template>
  </Card>
  <teleport
    v-if="!hideWelcome"
    to="body"
  >
    <Onboarding
      :current-step="onboardingStep"
      :h1="onboardingSteps[onboardingStep - 1].h1"
      :h2="onboardingSteps[onboardingStep - 1].h2"
      @next="forward()"
      @close-me="disableWelcome()"
    >
      <template #default>
        <component
          :is="onboardingSteps[onboardingStep - 1].title"
          @accept="handleSignup($event)"
        />
      </template>
    </Onboarding>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref } from 'vue'

// Components
import ColorSwitch from './components/ColorSwitch.vue'
import LanguageSelect from './components/LanguageSelect.vue'
import Statistics from './components/Statistics.vue'
import Dropdown from './components/Dropdown.vue'
import SettingTile from './components/SettingTile.vue'
import Onboarding from './components/Onboarding.vue'
import Card from './components/Card.vue'
import Toggle from './components/Toggle.vue'

// Settings Data (Names and Icons)
import settings from './settings.json'

// Settings Page Components
import AutoLogin from './settingPages/AutoLogin.vue'
import Email from './settingPages/Email.vue'
import OpalCourses from './settingPages/OpalCourses.vue'
import ImproveOpal from './settingPages/ImproveOpal.vue'
import Shortcuts from './settingPages/Shortcuts.vue'
import SearchEngines from './settingPages/SearchEngines.vue'
import Rockets from './settingPages/Rockets.vue'
import Contact from './settingPages/Contact.vue'

// Onboarding Page Components
import onboardingSteps from './onboarding.json'
import Welcome from './onboardingPages/01_Welcome.vue'
import SearchSetup from './onboardingPages/02_SearchSetup.vue'
import LoginSetup from './onboardingPages/03_LoginSetup.vue'
import LoginAccept from './onboardingPages/04_LoginAccept.vue'
import EMailSetup from './onboardingPages/05_EMailSetup.vue'
import OpalSetup from './onboardingPages/06_OpalSetup.vue'
import DoneSetup from './onboardingPages/07_DoneSetup.vue'

// composables
import { useChrome } from './composables/chrome'
// Temporary fix: We need to import the Components for the icons manually as no global usage is possible
// But we need to do this in SettingsTile.

type setting = {
    title: string,
    icon: string,
    settingsPage: string,
}

export default defineComponent({
  components: {
    ColorSwitch,
    LanguageSelect,
    Statistics,
    Dropdown,
    SettingTile,
    Card,
    Toggle,
    AutoLogin,
    Email,
    OpalCourses,
    ImproveOpal,
    Shortcuts,
    SearchEngines,
    Rockets,
    Contact,
    Onboarding,
    Welcome,
    SearchSetup,
    LoginSetup,
    LoginAccept,
    EMailSetup,
    OpalSetup,
    DoneSetup
  },
  setup () {
    const { getChromeLocalStorage, setChromeLocalStorage } = useChrome()
    const hideWelcome = ref(false)
    const onboardingStep = ref(1)
    const showCard = ref(false)
    const currentSetting = ref(settings[0])
    const stepWidth = ref(1)
    const animState = ref<'dark' | 'light'>('dark')

    onBeforeMount(async () => {
      hideWelcome.value = await getChromeLocalStorage('hideWelcome') as boolean
    })

    const disableWelcome = async () => {
      hideWelcome.value = true
      await setChromeLocalStorage({ hideWelcome: true })
    }

    const forward = () => {
      onboardingStep.value += stepWidth.value
      stepWidth.value = 1
    }

    const handleSignup = (state : { value : boolean }) => {
      stepWidth.value = state.value === true ? 1 : 3
    }

    const html = document.documentElement
    const useLightTheme = window.matchMedia('(prefers-color-scheme: light)').matches
    setChromeLocalStorage({ theme: useLightTheme ? 'light' : 'dark' })

    const openSetting = (setting : setting) => {
      showCard.value = true
      currentSetting.value = setting
    }

    const toggleTheme = async () => {
      const theme = await getChromeLocalStorage('theme') as 'light' | 'dark'
      if (theme === 'dark') { await setChromeLocalStorage({ theme: 'light' }) }
      if (theme === 'light') { await setChromeLocalStorage({ theme: 'dark' }) }

      updateTheme(theme === 'dark' ? 'light' : 'dark')
    }

    const updateTheme = (theme: string) => {
      if (theme === 'dark') {
        animState.value = 'dark'
        html.classList.add('dark')
        html.classList.remove('light')
      } else if (theme === 'light') {
        animState.value = 'light'
        html.classList.add('light')
        html.classList.remove('dark')
      }
    }
    updateTheme(useLightTheme ? 'light' : 'dark')

    return {
      hideWelcome,
      disableWelcome,
      forward,
      handleSignup,
      onboardingSteps,
      onboardingStep,
      showCard,
      settings,
      currentSetting,
      openSetting,
      toggleTheme,
      animState
    }
  }
})

</script>

<style lang="sass" scoped>

.main-grid
    display: grid
    grid-template-columns: 40% 20% 40%
    grid-template-rows: max-content 1fr
    max-height: 100vh
    margin: 20px

    &__subtitle
        max-width: 45ch

    &__menues
        justify-self: end
        display: flex
        justify-content: space-between
        width: 80%

    &__settings
        grid-column: span 3
        display: grid
        grid-template-columns: repeat(4, 1fr)
        grid-template-rows: repeat(2, 1fr)
        column-gap: clamp(.4rem, 4vw, 8rem)
        row-gap: clamp(.6rem, 4vw, 4rem)
        align-self: stretch
        justify-items: center
        align-items: start
        overflow: auto
        padding: 4rem 2rem 4rem

        @media screen and (max-width: 600px)
            grid-template-columns: repeat(2, 1fr)
            grid-template-rows: repeat(4, 1fr)

.light
    & .main-grid__header, & .main-grid__menues, & .main-grid__color-select
        color: hsl(var(--clr-black) )
</style>

<style lang="sass">
body
  scrollbar-color: hsl(var(--clr-primary))
  scrollbar-width: thin

*,
*::before,
*::after
  scrollbar-color: inherit
  scrollbar-width: inherit

::-webkit-scrollbar
  width: .4rem

::-webkit-scrollbar-track
  background-color: none

::-webkit-scrollbar-thumb
  background-color: hsl(var(--clr-primary))
  border-radius: .4rem

  &:hover
    background-color: hsl(var(--clr-primary), .8)
    cursor: pointer
</style>
