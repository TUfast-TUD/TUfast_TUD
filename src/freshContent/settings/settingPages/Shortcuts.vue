<template>
  <p>Öffne OPAL & Co. einfach mit Tastenkombinationen.</p>
  <CustomLink
    txt="Hier kannst du alle Shortcuts sehen und ändern"
    @click="openShortcutSettings()"
  />

  <p class="p-margin">
    Standardmäßig sind aktiv:
  </p>

  <p class="shortcuts">
    Alt+Q → Dashboard öffnen<br>
    Alt+O → OPAL öffnen<br>
    Alt+M → Mail (Outlook-Web-App) öffnen<br>
    Alt+J → jExam öffnen
  </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Link from '../components/Link.vue'

export default defineComponent({
  components: {
    CustomLink: Link
  },
  setup () {
    const openShortcutSettings = () => {
      chrome.runtime.sendMessage({ cmd: 'open_shortcut_settings' }, (result) => { })
    }

    return {
      openShortcutSettings
    }
  }
})
</script>

<style lang="sass" scoped>
.shortcuts
    line-height: 1.75
    margin-left: 1rem
    color: hsl(var(--clr-white), .7)
</style>
