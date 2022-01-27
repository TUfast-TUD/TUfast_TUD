<template>
    <Onboarding>
        <template v-slot:main>
            <h1>Studiengang</h1>
        </template>
        <template v-slot:footer>
            <div class="footer-text">
                <h1 class="footer-text__welcome">Herzlich Willkommen bei TUfast</h1>
                <h2 class="footer-text__subtitle">Dein Produktivitätstool für alles rund um die TU Dresden</h2>
            </div>
        </template>
    </Onboarding>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core'
import Onboarding from '../components/Onboarding.vue'

export default defineComponent({
    components: {
        Onboarding,
    },
    setup() {

    },
})

</script>

<style lang="sass">
.footer-text
    &__welcome
        text-transform: uppercase
    
</style>
