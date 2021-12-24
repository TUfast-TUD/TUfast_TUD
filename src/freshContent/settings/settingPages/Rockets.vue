<template>
    <h2>Schalte neue Raketen frei und gestalte damit OPAL und deinen Browser!</h2>
    <p>Damit unterstützt du auch das TUfast-Projekt und das hilft uns sehr 🙂</p>
    <Setting txt="Standard. Hat jeder.">
        <img class="rocket" src="../../../assets/icons/RocketIcons/default_128px.png">
    </Setting>
    <Setting txt="Mehr als 250 Klicks gespart. TUfast scheint nützlich!">
        <img class="rocket" src="../../../assets/icons/RocketIcons/4_103px.png">
    </Setting>
    <Setting txt="Spare mehr als 2500 Klicks. Du bist Profi!">
        <img class="rocket" src="../../../assets/icons/RocketIcons/13_grey_128px.png">
    </Setting>
    <Setting txt="Easteregg gefunden :)">
        <img class="rocket" src="../../../assets/icons/RocketIcons/7_128px.png">
    </Setting>
    <Setting txt="Diese Rakete hast du dir verdient! Mit E-Mail empfohlen.">
        <img class="rocket" src="../../../assets/icons/RocketIcons/2_128px.png">
    </Setting>
    <Setting txt="Danke für deine Bewertung im Webstore!">
        <img class="rocket" src="../../../assets/icons/RocketIcons/6_128px.png">
    </Setting>
    <Setting txt="Danke für deine Unterstützung! Mit WhatsApp empfohlen.">
        <img class="rocket" src="../../../assets/icons/RocketIcons/1_128px.png">
    </Setting>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Setting from '../components/Setting.vue'

export default defineComponent({
    components: {
        Setting,
    },
    setup() {
        
    },
})
</script>

<style lang="sass" scoped>
.rocket
    height: 50px
    filter: invert(100%)
    margin-right: .8rem
</style>