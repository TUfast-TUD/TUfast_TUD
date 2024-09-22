<template>
  <p class="max-line p-margin">
    Dieses feature fügt Graphen für die Notenverteilungen und Versuchstracker in
    selma hinzu. Zusätzlich wird das layout und design angepasst
    um benutzerfreundlicher zu sein.
    Zusätzlich kann man sich seine Note in der Notenverteilung anzeigen lassen.
  </p>

  <Setting
    v-model="selmajExamTheme"
    txt="Das jExam theme bei Selma benutzen"
    class="setting"
  />
  <Setting
    v-model="selmajExamThemeWG"
    txt="Anzeigen der eigenen Note"
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
    const selmajExamTheme = ref(false)
    const selmajExamThemeWG = ref(false)

    onBeforeMount(async () => {
      const { selmajExamTheme: storedValue } = await chrome.storage.local.get([
        'selmajExamTheme'
      ])

      selmajExamTheme.value = storedValue ?? false
      watch(selmajExamTheme, valueUpdate)

      const { selmajExamThemeWG: storedValueWG } = await chrome.storage.local.get(
        ['selmajExamThemeWG'])
      selmajExamThemeWG.value = storedValueWG ?? false
      watch(selmajExamThemeWG, valueUpdateWG)
    })

    const valueUpdate = async () => {
      // When we got here, we have the permission
      await chrome.storage.local.set({
        selmajExamTheme: selmajExamTheme.value
      })
    }
    const valueUpdateWG = async () => {
      await chrome.storage.local.set({
        selmajExamThemeWG: selmajExamThemeWG.value
      })
    }

    return {
      selmajExamTheme,
      selmajExamThemeWG
    }
  }
})
</script>

<style lang="sass" scoped>
.setting
    margin-bottom: .8rem
</style>
