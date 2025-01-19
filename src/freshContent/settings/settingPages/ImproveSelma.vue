<template>
  <p class="max-line p-margin">
    Dieses Feature fügt Graphen für die Notenverteilungen und Versuchstracker in Selma hinzu. Zusätzlich wird das Layout
    und Design angepasst, um benutzerfreundlicher zu sein.
  </p>

  <Setting
    v-model="improveSelma"
    txt="Das verbesserte Layout und die Notenverteilung bei Selma benutzen"
    class="setting"
  />
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref, watch } from 'vue'

// components
import Setting from '../components/Setting.vue'

export default defineComponent({
  components: {
    Setting
  },
  setup() {
    const improveSelma = ref(true)

    onBeforeMount(async () => {
      const { improveSelma: storedValue } = await chrome.storage.local.get(['improveSelma'])

      improveSelma.value = storedValue ?? true
      watch(improveSelma, valueUpdate)
    })

    const valueUpdate = async () => {
      // When we got here, we have the permission
      await chrome.storage.local.set({
        improveSelma: improveSelma.value
      })
    }

    return {
      improveSelma
    }
  }
})
</script>

<style lang="sass" scoped>
.setting
    margin-bottom: .8rem
</style>
