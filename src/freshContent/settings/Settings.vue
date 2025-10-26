<template>
  <div id="starfield" class="starfield"></div>
  <div class="wrapper">
    <header class="tuf-header">
      <div class="tuf-header-left">
        <div class="tuf-logo"></div>
        <span class="tuf-header-location txt-bold">&rarr; Einstellungen</span>
      </div>
      <div class="tuf-header-right"><Statistics /></div>
    </header>
    <div class="tuf-settings-list" style="margin-top: 16px">
      <h2 class="tuf-settings-list__part-title">Personalisierung</h2>
      <div class="tuf-settings-list__part">
        <template v-for="setting in getSettingsByCategory('personalization')" :key="setting.title">
          <SettingTile
            :icon="setting.icon"
            :title="setting.title"
            :is-active="openSettingId === setting.settingsPage"
            :setting-type="setting.settingType"
            :class="[
              'main-grid__tile',
              { 'is-active': openSettingId === setting.settingsPage },
              { soon: setting.title === 'Sprache – Bald! Soon!' }
            ]"
            role="button"
            tabindex="0"
            @click="toggleSetting(setting)"
            @keyup.enter="toggleSetting(setting)"
            @keyup.space="toggleSetting(setting)"
          />

          <transition name="expand">
            <Card
              v-if="openSettingId === setting.settingsPage"
              :title="setting.title"
              :inline="true"
              class="inline-dropdown-card"
              @close-me="closeSetting"
            >
              <template #default>
                <component :is="setting.settingsPage" />
              </template>
            </Card>
          </transition>
        </template>
        <ColorSwitch
          class="main-grid__color-select"
          :anim-state="animState"
          tabindex="0"
          role="button"
          @click="toggleTheme()"
          @keyup.enter="toggleTheme()"
          @keyup.space="toggleTheme()"
        />
      </div>
      <h2 class="tuf-settings-list__part-title">Funktionen</h2>
      <div class="tuf-settings-list__part">
        <template v-for="setting in getSettingsByCategory('function')" :key="setting.title">
          <SettingTile
            :icon="setting.icon"
            :title="setting.title"
            :is-active="openSettingId === setting.settingsPage"
            :setting-type="setting.settingType"
            :class="['main-grid__tile', { 'is-active': openSettingId === setting.settingsPage }]"
            tabindex="0"
            role="button"
            @click="toggleSetting(setting)"
            @keyup.enter="toggleSetting(setting)"
            @keyup.space="toggleSetting(setting)"
          />

          <transition name="expand">
            <Card
              v-if="openSettingId === setting.settingsPage"
              :title="setting.title"
              :inline="true"
              class="inline-dropdown-card"
              @close-me="closeSetting"
            >
              <template #default>
                <component :is="setting.settingsPage" />
              </template>
            </Card>
          </transition>
        </template>
      </div>

      <h2 class="tuf-settings-list__part-title">Informationen</h2>
      <div class="tuf-settings-list__part" style="margin-bottom: 128px">
        <template v-for="setting in getSettingsByCategory('information')" :key="setting.title">
          <SettingTile
            :icon="setting.icon"
            :title="setting.title"
            :is-active="openSettingId === setting.settingsPage"
            :setting-type="setting.settingType"
            :class="['main-grid__tile', { 'is-active': openSettingId === setting.settingsPage }]"
            tabindex="0"
            role="button"
            @click="toggleSetting(setting)"
            @keyup.enter="toggleSetting(setting)"
            @keyup.space="toggleSetting(setting)"
          />

          <transition name="expand">
            <Card
              v-if="openSettingId === setting.settingsPage"
              :title="setting.title"
              :inline="true"
              class="inline-dropdown-card"
              @close-me="closeSetting"
            >
              <template #default>
                <component :is="setting.settingsPage" />
              </template>
            </Card>
          </transition>
        </template>
        <a href="https://tu-fast.de/" target="_blank" tabindex="0">
          <div class="tuf-settings-link">
            <div class="tuf-settings-link__icon"><IconWorld size="48px" /></div>
            <div class="tuf-settings-link__title"><h2>Website</h2></div>
            <div class="tuf-settings-link__type"><IconArrowUpRight size="24px" /></div>
          </div>
        </a>
        <a href="https://buymeacoffee.com/olihausdoerfer" target="_blank" tabindex="0">
          <div class="tuf-settings-link">
            <div class="tuf-settings-link__icon"><IconHeartHandshake size="48px" /></div>
            <div class="tuf-settings-link__title"><h2>Unterstütze uns</h2></div>
            <div class="tuf-settings-link__type"><IconArrowUpRight size="24px" /></div>
          </div>
        </a>
        <a
          href="https://docs.google.com/document/d/1m3LCzlRMlEUR_TbMgP7Ha7MA7jN9mJ6gfyRhCRfUxuM/edit?usp=sharing"
          target="_blank"
          tabindex="0"
        >
          <div class="tuf-settings-link">
            <div class="tuf-settings-link__icon"><IconShield size="48px" /></div>
            <div class="tuf-settings-link__title"><h2>Datenschutz</h2></div>
            <div class="tuf-settings-link__type"><IconArrowUpRight size="24px" /></div>
          </div>
        </a>
      </div>
    </div>
  </div>
  <div class="rocket-start-svg"></div>

  <!-- Welcome Onboarding -->
  <teleport v-if="!hideWelcome" to="body">
    <Onboarding
      :current-step="currentOnboardingStep"
      :h1="onboardingSteps[currentOnboardingStep - 1].h1"
      :icon="onboardingSteps[currentOnboardingStep - 1].icon"
      :btn-text="onboardingSteps[currentOnboardingStep - 1].btnText"
      :skip-text="onboardingSteps[currentOnboardingStep - 1].skipText"
    >
      <template #default>
        <component :is="onboardingSteps[currentOnboardingStep - 1].title" />
      </template>
    </Onboarding>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, onMounted, ref, watch } from 'vue'

// types
import type { Setting } from './types/Setting'

// Components
import ColorSwitch from './components/ColorSwitch.vue'
import Statistics from './components/Statistics.vue'
import SettingTile from './components/SettingTile.vue'
import Onboarding from './components/Onboarding.vue'
import Card from './components/Card.vue'
import Toggle from './components/Toggle.vue'

// Settings Page Components
import AutoLogin from './settingPages/AutoLogin.vue'
import Email from './settingPages/Email.vue'
import ImproveOpal from './settingPages/ImproveOpal.vue'
import ImproveSelma from './settingPages/ImproveSelma.vue'
import Shortcuts from './settingPages/Shortcuts.vue'
import SearchEngines from './settingPages/SearchEngines.vue'
import Rockets from './settingPages/Rockets.vue'
import About from './settingPages/About.vue'
import Contact from './settingPages/Contact.vue'
import LanguageSelect from './settingPages/LanguageSelect.vue'
import ChooseFaculty from './settingPages/ChooseFaculty.vue'

// Onboarding Page Components
import Welcome from './onboardingPages/01_Welcome.vue'
import FacultySetup from './onboardingPages/02_FacultySetup.vue'
import LoginSetup from './onboardingPages/03_LoginSetup.vue'
import OtpSetup from './onboardingPages/04_OtpSetup.vue'
import EMailSetup from './onboardingPages/05_EMailSetup.vue'
import OpalSelmaSetup from './onboardingPages/06_OpalSelmaSetup.vue'
import SearchengineSetup from './onboardingPages/07_SearchengineSetup.vue'
import DoneSetup from './onboardingPages/08_DoneSetup.vue'

// configurations
import settings from './settings.json'
import onboardingSteps from './onboarding.json'

// composables
import { useChrome } from './composables/chrome'
import { useStepper } from './composables/stepper'

export default defineComponent({
  components: {
    ColorSwitch,
    LanguageSelect,
    Statistics,
    SettingTile,
    Card,
    Toggle,
    AutoLogin,
    Email,
    ImproveOpal,
    ImproveSelma,
    Shortcuts,
    SearchEngines,
    Rockets,
    Contact,
    About,
    Onboarding,
    Welcome,
    FacultySetup,
    LoginSetup,
    EMailSetup,
    OpalSelmaSetup,
    DoneSetup,
    ChooseFaculty,
    OtpSetup,
    SearchengineSetup
  },
  setup() {
    const { getChromeLocalStorage, setChromeLocalStorage } = useChrome()
    const { hideWelcome, currentOnboardingStep } = useStepper()
    const openSettingId = ref<string | null>(null)
    const animState = ref<'dark' | 'light'>('dark')

    // Filter settings by category
    const getSettingsByCategory = (category: string) => {
      return settings.filter((setting) => setting.category === category)
    }

    // toggles the setting dropdown
    const toggleSetting = (setting: Setting) => {
      openSettingId.value = openSettingId.value === setting.settingsPage ? null : setting.settingsPage
    }

    // closes any open setting
    const closeSetting = () => {
      openSettingId.value = null
    }

    // toggles the theme setting inside local storage
    const toggleTheme = async () => {
      const theme = (await getChromeLocalStorage('theme')) as 'light' | 'dark'
      if (animState.value === 'dark') {
        await setChromeLocalStorage({ theme: 'light' })
      }
      if (animState.value === 'light') {
        await setChromeLocalStorage({ theme: 'dark' })
      }

      updateTheme(theme === 'dark' ? 'light' : 'dark')
    }

    // updates the theme classes on the <html> element
    const updateTheme = (theme: string) => {
      const setClass = (className: string) => document.documentElement.classList.add(className)
      const unsetClass = (className: string) => document.documentElement.classList.remove(className)
      if (theme === 'dark') {
        animState.value = 'dark'
        setClass('dark')
        unsetClass('light')
      } else if (theme === 'light') {
        animState.value = 'light'
        setClass('light')
        unsetClass('dark')
      }
    }

    // sets the right theme on initial load
    const themeSetup = async () => {
      let selectedTheme = (await getChromeLocalStorage('theme')) as 'dark' | 'light' | 'system'
      if (selectedTheme === 'system') {
        // check if user prefers some color theme
        selectedTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
        await setChromeLocalStorage({ theme: selectedTheme })
      }
      updateTheme(selectedTheme)
    }

    onBeforeMount(async () => {
      hideWelcome.value = (await getChromeLocalStorage('hideWelcome')) as boolean
      themeSetup()
    })

    // Watch hideWelcome to control body overflow - only allow scrolling if welcome is hidden
    watch(
      hideWelcome,
      (newValue) => {
        if (newValue) {
          // Welcome is hidden, allow scrolling
          document.body.style.setProperty('overflow-y', 'visible', 'important')
        } else {
          // Welcome is visible, prevent scrolling
          document.body.style.setProperty('overflow-y', 'hidden', 'important')
        }
      },
      { immediate: true }
    )

    onMounted(() => {
      // Starfield Background
      const starfield = document.getElementById('starfield')
      if (!starfield) return

      const numStars = 200

      for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div')
        star.className = 'star'

        const x = Math.random() * 100
        const y = Math.random() * 100
        const densityFactor = 1 - (y / 100) * 0.7

        if (Math.random() > densityFactor) continue

        const size = Math.random() < 0.7 ? Math.random() * 3 + 1 : Math.random() * 5 + 3
        const baseOpacity = (Math.random() * 0.5 + 0.3) * densityFactor
        const opacityMin = baseOpacity * 0.3
        const opacityMax = Math.min(baseOpacity * 1.5, 1)
        const duration = Math.random() * 4 + 4

        star.style.left = x + '%'
        star.style.top = y + '%'
        star.style.width = size + 'px'
        star.style.height = size + 'px'
        star.style.setProperty('--opacity-min', opacityMin.toString())
        star.style.setProperty('--opacity-max', opacityMax.toString())
        star.style.setProperty('--duration', duration + 's')
        star.style.animationDelay = Math.random() * 5 + 's'

        starfield.appendChild(star)
      }
    })

    return {
      hideWelcome,
      onboardingSteps,
      currentOnboardingStep,
      openSettingId,
      toggleSetting,
      closeSetting,
      settings,
      getSettingsByCategory,
      toggleTheme,
      animState
    }
  }
})
</script>

<style lang="sass" scoped>
.txt-bold
    font-weight: 600

.tuf-header-location
    color: var(--clr-text-help)

    @media screen and (max-width: 800px)
        display: none

.is-active
    border-radius: var(--brd-rad) var(--brd-rad) 0 0 !important

.tuf-settings-list__part
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))
  gap: 1rem

.inline-dropdown-card
  grid-column: 1 / -1
  margin: 0.5rem 0
  border-radius: var(--brd-rad)
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)
  background: white
  overflow: hidden

.wrapper
    margin: 0 auto
    max-width: 1000px
    align-items: center
    position: relative
    z-index: 1
    overflow-x: hidden

.tuf-settings-list
    padding: 20px 32px

    @media screen and (max-width: 800px)
        padding: 20px 16px

    &__part
        display: flex
        flex-direction: column
        gap: 16px
        margin-bottom: 32px

    &__part-title
        padding-left: 16px
        padding-bottom: 8px

.tuf-header
    display: flex
    justify-content: space-between
    align-items: center
    padding: 20px 32px
    border-bottom: 4px solid hsl(var(--clr-text))
    gap: 16px
    min-width: 0
    overflow-x: hidden

    @media screen and (max-width: 800px)
        padding: 20px 16px
        gap: 8px

    @media screen and (max-width: 650px)
        flex-wrap: wrap
        padding: 16px 12px

.tuf-header-left
    display: flex
    align-items: center
    gap: 0.5rem
    min-width: 0
    flex-shrink: 1

    @media screen and (max-width: 650px)
        gap: 0.25rem

.tuf-header-left h1
    margin: 0
    font-weight: 600

.tuf-header-left span
    font-size: 1rem
    vertical-align: middle

.tuf-header-right
    flex-shrink: 0
    min-width: 0
    overflow: hidden

    @media screen and (max-width: 650px)
        display: flex
        justify-content: center

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
        scrollbar-gutter: stable

        &--no-overflow
          overflow: hidden
</style>

<style lang="sass">
.tuf-logo
    position: relative
    height: 32px
    width: 148px
    background-image: url(/assets/logo/tufast_logo_fordark.svg)
    background-repeat: no-repeat
    background-position: center bottom
    background-size: contain

    .light &
        background-image: url(/assets/logo/tufast_logo_forlight.svg)

.rocket-start-svg
    position: relative
    width: 100%
    min-height: 600px
    max-height: 600px
    margin-top: 80px
    background-image: url(/assets/settings/steenthomsen_rocketstart_fordark.svg)
    background-repeat: no-repeat
    background-position: center center
    background-size: cover

    .light &
        background-image: url(/assets/settings/steenthomsen_rocketstart_forlight.svg)

.starfield
    position: absolute
    top: 0
    left: 0
    width: 100%
    height: 100%
    pointer-events: none
    z-index: 0

.star
    position: absolute
    background: hsl(var(--clr-accent))
    border-radius: 50%
    opacity: var(--opacity-max)
    animation: twinkle var(--duration) ease-in-out infinite
    transition: transform 200ms ease, box-shadow 200ms ease
    pointer-events: auto
    cursor: pointer

.star:hover
    transform: scale(1.5)
    box-shadow: 0 0 10px hsla(var(--clr-accent), 0.8)

@keyframes twinkle
    0%
        opacity: var(--opacity-max)
    50%
        opacity: var(--opacity-min)
    100%
        opacity: var(--opacity-max)

a
  text-decoration: none !important
  color: inherit

.soon
  opacity: 0.4
  pointer-events: none

body
  background-color: hsl(var(--clr-backgr) )
  overflow-y: visible
  overflow-x: hidden !important

  .light &
    background-color: hsl(var(--clr-backgr) )

// used in settings.vue and colorswitch.vue
.tuf-settings-link
    background-color: hsl(var(--clr-btn))
    border-radius: var(--brd-rad)
    display: flex
    flex-direction: row
    justify-content: space-between
    align-items: center
    text-align: center
    width: 100%
    height: 64px
    padding: 0 .8rem
    user-select: none
    cursor: pointer
    position: relative
    transition: all 200ms ease-in-out
    text-decoration: none

    &__title
        flex: 1
        text-align: left
        text-decoration: none !important

    &__icon
        width: 48px
        height: 48px
        margin-right: 16px
        flex-shrink: 0
        color: hsl(var(--clr-accent))
        position: relative

        @media screen and (max-width: 650px)
            width: 32px
            height: 32px

        svg
            width: 48px
            height: 48px

            @media screen and (max-width: 650px)
                width: 32px
                height: 32px

    &__type
        flex-shrink: 0
        margin-left: 16px
        display: flex
        justify-content: center
        align-items: center
        padding-right: 8px
        color: hsl(var(--clr-text))

    &:hover
      background-color: hsl(var(--clr-btnhov))
</style>
