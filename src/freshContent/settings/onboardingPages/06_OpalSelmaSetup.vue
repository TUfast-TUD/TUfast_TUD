<template>
  <p class="txt-help txt-center"></p>
  <div class="onboarding-inner-info">
    <ImproveOpal />
    <ImproveSelma />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'

// components
import ImproveOpal from '../settingPages/ImproveOpal.vue'
import ImproveSelma from '../settingPages/ImproveSelma.vue'

// composables
import { useSettingHandler } from '../composables/setting-handler'

export default defineComponent({
  components: {
    ImproveOpal,
    ImproveSelma
  },
  setup() {
    const { opalPdf } = useSettingHandler()
    const inlineActive = ref(false)
    const newTabActive = ref(false)

    const inline = async () => {
      if (inlineActive.value) {
        inlineActive.value = (await opalPdf('enable', 'inline')) as boolean
      } else {
        await opalPdf('disable', 'inline')
        newTabActive.value = false
      }
    }

    const newtab = async () => {
      if (newTabActive.value) {
        newTabActive.value = (await opalPdf('enable', 'newtab')) as boolean
      } else {
        await opalPdf('disable', 'newtab')
      }
    }

    watch(inlineActive, inline, { immediate: true })
    watch(newTabActive, newtab, { immediate: true })

    return {
      inlineActive,
      newTabActive,
      inline,
      newtab,
      ImproveOpal,
      ImproveSelma
    }
  }
})
</script>

<style lang="sass" scoped>
:deep(.onboarding-hide)
    display: none !important

:deep(.onboarding-margin)
    margin-top: 32px
</style>
