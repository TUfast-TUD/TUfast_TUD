<template>
  <h1 class="upper">
    OPAL verbessern
  </h1>
  <div class="info">
    <Setting
      v-model="inlineActive"
      txt="Dokumente im Browser öffnen"
      :column="true"
    />
    <Setting
      v-model="newTabActive"
      :disabled="!inlineActive"
      txt="Dokumente in neuem Tab öffnen"
      :column="true"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'

// components
import Setting from '../components/Setting.vue'

// composables
import { useSettingHandler } from '../composables/setting-handler'

export default defineComponent({
  components: {
    Setting
  },
  setup () {
    const { opalPdf } = useSettingHandler()
    const inlineActive = ref(false)
    const newTabActive = ref(false)

    const inline = async () => {
      if (inlineActive.value) {
        inlineActive.value = await opalPdf('enable', 'inline') as boolean
      } else {
        await opalPdf('disable', 'inline')
        newTabActive.value = false
      }
    }

    const newtab = async () => {
      if (newTabActive.value) {
        newTabActive.value = await opalPdf('enable', 'newtab') as boolean
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
      newtab
    }
  }
})

</script>

<style lang="sass" scoped>
.info
    margin-top: .8rem
    width: 70%
    display: flex
    justify-content: space-between
    align-items: center
    gap: .8rem
</style>
