<template>
    <div class="title">
        <h1 class="upper">AutoLogin</h1>
        <h2>in die Onlineportale der TU Dresden</h2>
    </div>
    <Setting txt="Dafür Login zu Opal und co. verschlüsselt & lokal speichern?" :column="true" />
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
.title
    display: flex
    flex-direction: column
    align-items: center
.info
    margin-top: .8rem
    width: 70%
    display: flex
    justify-content: space-between
    align-items: center
</style>