<template>
    <lottie-player
        src="../../assets/settings/rocket_lottie.json"
        loop
        autoplay
    />
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
