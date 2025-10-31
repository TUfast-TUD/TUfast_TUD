<template>
  <h3 class="card-body-title">Optimiere den Umgang mit PDF und Textdokumenten in OPAL</h3>
  <Setting
    v-model="pdfInlineActive"
    txt="PDF- und Textdokumente direkt im Browser öffnen, anstatt sie herunterzuladen"
    class="setting"
  />
  <Setting
    v-model="pdfNewTabActive"
    :disabled="!pdfInlineActive"
    txt="PDF- und Textdokumente in einem neuen Tab öffnen (empfohlen)"
    class="setting"
  />
  <p class="max-line p-margin">
    Damit die Einstellungen wirksam werden, musst du OPAL einmal aktualisieren. Möglicherweise braucht TUfast eine
    spezielle Berechtigung. Drücke bitte auf „Erlauben“ im folgenden Pop-Up.
  </p>
  <p class="max-line p-margin txt-help">Diese Funktion funktioniert im Firefox Browser leider nicht stabil.</p>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref, watch } from 'vue'

// types
import type { ResponseOpalPdf } from '../types/SettingHandler'

// components
import Setting from '../components/Setting.vue'

// composables
import { useSettingHandler } from '../composables/setting-handler'

export default defineComponent({
  components: {
    Setting
  },
  setup() {
    const { opalPdf } = useSettingHandler()
    const pdfInlineActive = ref(false)
    const pdfNewTabActive = ref(false)

    // Watch pdfInlineActive and deactivate pdfNewTabActive when it's turned off
    watch(pdfInlineActive, (newValue) => {
      if (!newValue) {
        pdfNewTabActive.value = false
      }
    })

    onBeforeMount(async () => {
      const { inline, newtab } = (await opalPdf('check')) as ResponseOpalPdf

      pdfInlineActive.value = inline
      pdfNewTabActive.value = newtab

      watch(pdfInlineActive, inlineUpdate)
      watch(pdfNewTabActive, newtabUpdate)
    })

    const inlineUpdate = async () => {
      if (pdfInlineActive.value) {
        pdfInlineActive.value = (await opalPdf('enable', 'inline')) as boolean
      } else {
        await opalPdf('disable', 'inline')
        pdfNewTabActive.value = false
      }
    }

    const newtabUpdate = async () => {
      if (pdfNewTabActive.value) {
        pdfNewTabActive.value = (await opalPdf('enable', 'newtab')) as boolean
      } else {
        await opalPdf('disable', 'newtab')
      }
    }

    return {
      pdfInlineActive,
      pdfNewTabActive
    }
  }
})
</script>
