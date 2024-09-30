<template>
  <p class="max-line p-margin">
    Dieses feature fügt Graphen für die Notenverteilungen und Versuchstracker in
    selma hinzu. Zusätzlich wird das layout und design angepasst
    um allgemein benutzerfreundlicher zu sein.
  </p>

  <Setting
    v-model="selmajExamTheme"
    txt="Das verbesserte layout und die Notenverteilung bei Selma benutzen"
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
  setup () {
    const selmajExamTheme = ref(true)

    onBeforeMount(async () => {
      const { selmajExamTheme: storedValue } = await chrome.storage.local.get([
        'selmajExamTheme'
      ])

      selmajExamTheme.value = storedValue ?? true
      watch(selmajExamTheme, valueUpdate)
    })

    const valueUpdate = async () => {
      // When we got here, we have the permission
      await chrome.storage.local.set({
        selmajExamTheme: selmajExamTheme.value
      })
    }

    return {
      selmajExamTheme
    }
  }
})
</script>

<style lang="sass" scoped>
.setting
    margin-bottom: .8rem
</style>
