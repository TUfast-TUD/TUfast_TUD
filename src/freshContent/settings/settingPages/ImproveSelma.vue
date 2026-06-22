<template>
  <h3 class="card-body-title onboarding-margin">{{ strings.settings.pages.improveSelma.title }}</h3>

  <Setting v-model="improveSelma" :txt="strings.settings.pages.improveSelma.toggle" class="setting" />

  <p class="max-line p-margin">{{ strings.settings.pages.improveSelma.help }}</p>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref, watch } from 'vue'
import { strings } from '../../../i18n'

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
      improveSelma,
      strings
    }
  }
})
</script>
