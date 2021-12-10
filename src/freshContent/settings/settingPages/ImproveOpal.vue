<template>
    <p>Damit die Einstellungen wirksam werden, musst du OPAL einmal aktualisieren. Für Firefox funktioniert dieses Feature leider nicht stabil.</p>
    <p>Möglicherweise braucht TUfast eine spezielle Berechtigung. Drücke bitte auf "Erlauben" im folgenden Pop-Up.</p>

    <div class="setting">
        <Toggle class="setting__toggle" /> <span>PDF-Dokumente aus OPAL direkt im Browser öffnen, anstatt sie herunterzuladen.</span>
    </div>
    <div class="setting">
        <Toggle class="setting__toggle" /> <span>PDF-Dokumente in neuem Tab öffnen (empfohlen!)</span>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Toggle from '../components/Toggle.vue'

export default defineComponent({
    components: { Toggle },
    setup() {
    },
})
</script>

<style lang="sass" scoped>
.setting
    display: flex
    align-items: center
    margin: 1.5rem 0

    &__toggle
      margin-right: 1rem    
</style>