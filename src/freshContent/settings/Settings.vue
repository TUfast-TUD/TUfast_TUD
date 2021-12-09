<template>
    <div class="main-grid">
        <header class="main-grid__header">
            <h1 class="upper txt-bold main-grid__title">Willkommen bei TUFast 🚀</h1>
            <h3 class="txt-bold main-grid__subtitle">Hier kannst du alle Funktionen entdecken und Einstellungen vornehmen.</h3>
        </header>
        <Lottie></Lottie>
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
                class="main-grid__tile" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

// Components
import Lottie from "./components/Lottie.vue"
import LanguageSelect from './components/LanguageSelect.vue'
import Statistics from "./components/Statistics.vue"
import Dropdown from './components/Dropdown.vue'
import SettingTile from './components/SettingTile.vue'

// Settings Data (Names and Icons)
import settings from "./settings.json"

export default defineComponent({
    components: {
    Lottie,
    LanguageSelect,
    Statistics,
    Dropdown,
    SettingTile
},
    setup() {
        const body = document.getElementsByTagName("body")[0]
        body.style.backgroundImage = "url('/assets/settings/background_dark.svg')"

        return {
            settings,
        }
    }
})

</script>

<style lang="sass" scoped>

.main-grid
    display: grid
    grid-template-columns: 40% 20% 40%
    grid-template-rows: 1fr auto
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
        justify-items: center
        align-items: space-between
        gap: 2rem
</style>

<style lang="sass">
body
    background-repeat: no-repeat
    background-size: cover
    overflow: hidden
</style>