<template>
  <h3 class="card-body-title">{{ strings.settings.pages.improveOpal.title }}</h3>
  <Setting v-model="pdfInlineActive" :txt="strings.settings.pages.improveOpal.inline" class="setting" />
  <Setting
    v-model="pdfNewTabActive"
    :disabled="!pdfInlineActive"
    :txt="strings.settings.pages.improveOpal.newTab"
    class="setting"
  />
  <p class="max-line p-margin">{{ strings.settings.pages.improveOpal.permission }}</p>
  <p class="max-line p-margin txt-help">{{ strings.settings.pages.improveOpal.firefoxWarning }}</p>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref, watch } from 'vue'
import { strings } from '../../../i18n'

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
      pdfNewTabActive,
      strings
    }
  }
})
</script>
