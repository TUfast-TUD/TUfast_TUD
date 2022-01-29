<template>
    <div class="main-grid">
        <header class="main-grid__header">
            <h1 class="upper txt-bold main-grid__title">Willkommen bei TUFast 🚀</h1>
            <h3 class="txt-bold main-grid__subtitle">Hier kannst du alle Funktionen entdecken und Einstellungen vornehmen.</h3>
        </header>
        <ColorSwitch class="main-grid__color-select" @click="toggleTheme()" :animState="animState" />
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
                @click="openSetting(setting)"/>
        </div>
    </div>
    <Card v-if="showCard" @close-me="showCard=false" :title="currentSetting.title" >
        <template v-slot:default>
            <component :is="currentSetting.settingsPage" />
        </template>
    </Card>
    <teleport v-if="showWelcome" to="body">
        <Onboarding @next="onboardingStep++" @close-me="showWelcome=false"  :h1="onboardingSteps[onboardingStep].h1" :h2="onboardingSteps[onboardingStep].h2">
            <template v-slot:default>
                <component :is="onboardingSteps[onboardingStep].title" />
            </template>
        </Onboarding>
    </teleport>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

// Components
import ColorSwitch from "./components/ColorSwitch.vue"
import LanguageSelect from './components/LanguageSelect.vue'
import Statistics from "./components/Statistics.vue"
import Dropdown from './components/Dropdown.vue'
import SettingTile from './components/SettingTile.vue'
import Onboarding from "./components/Onboarding.vue"
import Card from './components/Card.vue'
import Toggle from './components/Toggle.vue'

// Settings Data (Names and Icons)
import settings from "./settings.json"

type setting = {
    title: string,
    icon: string,
    settingsPage: string,
}

// Settings Page Components
import AutoLogin from "./settingPages/AutoLogin.vue"
import Email from "./settingPages/Email.vue"
import OpalCourses from "./settingPages/OpalCourses.vue"
import ImproveOpal from './settingPages/ImproveOpal.vue'
import Shortcuts from './settingPages/Shortcuts.vue'
import SearchEngines from './settingPages/SearchEngines.vue'
import Rockets from './settingPages/Rockets.vue'
import Contact from './settingPages/Contact.vue'

// Onboarding Page Components
import onboardingSteps from "./onboarding.json"
import Welcome from "./onboardingPages/Welcome.vue"
import SearchSetup from "./onboardingPages/SearchSetup.vue"
import LoginSetup from './onboardingPages/LoginSetup.vue'
import LoginAccept from './onboardingPages/LoginAccept.vue'
import EMailSetup from './onboardingPages/EMailSetup.vue'
import OpalSetup from './onboardingPages/OpalSetup.vue'
import DoneSetup from './onboardingPages/DoneSetup.vue'

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
        DoneSetup,
    },
    setup() {
        const showWelcome = ref(true)
        const onboardingStep = ref(0)
        const showCard = ref(false)
        const currentSetting = ref(settings[0])
        const animState = ref<"dark" | "light">("dark")

        const html = document.documentElement
        if (window.matchMedia("(prefers-color-scheme: light").matches)
            animState.value = "light"

        const openSetting = (setting : setting) => {
            showCard.value = true
            currentSetting.value = setting
        }

        const toggleTheme = () => {
            if (animState.value === "dark")
                html.classList.toggle("light")
            if(animState.value === "light")
                html.classList.toggle("dark")

            if(html.classList.contains("dark"))
                chrome.storage.local.set({ theme: "dark" })
            if(html.classList.contains("light"))
                chrome.storage.local.set({ theme: "light" })
            else
                chrome.storage.local.remove("theme")
        }

        return {
            showWelcome,
            onboardingSteps,
            onboardingStep,
            showCard,
            settings,
            currentSetting,
            openSetting,
            toggleTheme,
            animState,
        }
    }
})

</script>

<style lang="sass" scoped>

.main-grid
    display: grid
    grid-template-columns: 40% 20% 40%
    grid-template-rows: max-content auto
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
        margin-top: 4rem
        grid-column: span 3
        display: grid
        grid-template-columns: repeat(4, 1fr)
        grid-template-rows: repeat(2, 1fr)
        column-gap: clamp(.4rem, 4vw, 8rem)
        row-gap: clamp(.6rem, 4vw, 4rem)
        align-self: stretch
        justify-items: center
        align-items: start

        @media screen and (max-width: 600px)
            grid-template-columns: repeat(2, 1fr)
            grid-template-rows: repeat(4, 1fr)

.light
    & .main-grid__header, & .main-grid__menues, & .main-grid__color-select
        color: hsl(var(--clr-black) )
</style>
