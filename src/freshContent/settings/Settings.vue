<template>
    <div class="main-grid">
        <header class="main-grid__title">
            <h1>Willkommen bei TUFast 🚀</h1>
            <h3>Hier kannst du alle Funktionen entdecken und Einstellungen vornehmen.</h3>
        </header>
        <Lottie></Lottie>
        <div class="main-grid__menues">
            <Dropdown />
            <Statistics />
            <LanguageSelect />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Lottie from "./components/Lottie.vue"
import LanguageSelect from './components/LanguageSelect.vue'
import Statistics from "./components/Statistics.vue"
import Dropdown from './components/Dropdown.vue'

export default defineComponent({
    components: {
    Lottie,
    LanguageSelect,
    Statistics,
    Dropdown
},
    setup() {
        const body = document.getElementsByTagName("body")[0]
        body.style.backgroundImage = "url('/assets/settings/background_dark.svg')"

        return { }
    }
})

</script>

<style lang="sass" scoped>

.main-grid
    display: grid
    grid-template-columns: 40% 20% 40%
    margin: 20px

    &__menues
        justify-self: end
        display: flex
        justify-content: space-between
        width: 80%
</style>

<style lang="sass">
body
    background-repeat: no-repeat
    background-size: cover
</style>