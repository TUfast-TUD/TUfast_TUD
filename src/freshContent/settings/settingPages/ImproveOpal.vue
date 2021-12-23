<template>
    <p class="max-line">Damit die Einstellungen wirksam werden, musst du OPAL einmal aktualisieren. Für Firefox funktioniert dieses Feature leider nicht stabil.</p>
    <p class="max-line p-margin">Möglicherweise braucht TUfast eine spezielle Berechtigung. Drücke bitte auf "Erlauben" im folgenden Pop-Up.</p>

    <Setting txt="PDF-Dokumente aus OPAL direkt im Browser öffnen, anstatt sie herunterzuladen." />
    <Setting txt="PDF-Dokumente in neuem Tab öffnen (empfohlen!)" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Toggle from '../components/Toggle.vue'
import Setting from '../components/Setting.vue'

export default defineComponent({
    components: { Setting, Toggle },
    setup() {
    },
})
</script>
