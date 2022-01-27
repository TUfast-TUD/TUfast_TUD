<template>
        <h1 class="upper">E-Mail</h1>
        <div class="info">
            <Setting txt="Anzeigen Anzahl Nachrichten" :column="true" />
            <Setting txt="E-Mail-Benachrichtigungen" :column="true" />
        </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core'
import Onboarding from '../components/Onboarding.vue'
import Setting from '../components/Setting.vue'

export default defineComponent({
    components: {
    Onboarding,
    Setting,
},
    setup() {

    },
})

</script>

<style lang="sass" scoped>
.info
    margin-top: .8rem
    width: 70%
    display: flex
    justify-content: space-between
    align-items: center
</style>