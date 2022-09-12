<template>
  <p class="max-line">
    Finde alle deine OPAL-Kurse direkt im Dashboard. Öffne das Dashboard oben rechts oder mit Alt+Q.
  </p>

  <CustomLink
    txt="Hier kannst du die Shortcuts ändern"
    @click="openShortcutSettings()"
  />

  <img
    class="image p-margin"
    src="../../../assets/images/DashboardTutorialBigDark.png"
    alt="Zeigt wo man klicken muss, um verschiedene Funktionen des Popups zu nutzen."
  >

  <p class="p-margin max-line">
    Für Power-User ⚡⚡⚡<br>
    Öffne dein Dashboard mit Alt+Q und beginne direkt zu tippen. Wenn du dann Enter drückst, wird der erste Kurs aus der Liste geöffnet.
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
.image
    max-width: 45%

</style>
