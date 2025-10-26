<template>
  <h3 class="card-body-title onboarding-margin">Optimiere Layout und Notenverteilungen in Selma</h3>

  <Setting
    v-model="improveSelma"
    txt="Verbessertes Layout, Notenverteilung, Versuchstracker hinzufügen"
    class="setting"
  />

  <p class="max-line p-margin">
    Dieses Feature fügt Graphen für die Notenverteilungen und Versuchstracker in selma hinzu. Zusätzlich wird das Layout
    und Design angepasst, um benutzerfreundlicher zu sein.
  </p>
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
