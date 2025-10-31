<template>
  <h3 class="card-body-title">Öffne OPAL und weitere Tools mit Tastenkombinationen</h3>
  <p class="max-line p-margin">Standardmäßig sind aktiv:</p>

  <p class="shortcuts">
    <span class="shortcuts__bg">Alt</span> + <span class="shortcuts__bg">Q</span> &rarr; Dashboard öffnen
    <a class="shortcuts__edit txt-help" href="#" @click.prevent="openShortcutSettings()">Bearbeiten</a><br />
    <span class="shortcuts__bg">Alt</span> + <span class="shortcuts__bg">O</span> &rarr; OPAL öffnen
    <a class="shortcuts__edit txt-help" href="#" @click.prevent="openShortcutSettings()">Bearbeiten</a><br />
    <span class="shortcuts__bg">Alt</span> + <span class="shortcuts__bg">M</span> &rarr; Mail (OWA) öffnen
    <a class="shortcuts__edit txt-help" href="#" @click.prevent="openShortcutSettings()">Bearbeiten</a><br />
    <span class="shortcuts__bg">Alt</span> + <span class="shortcuts__bg">J</span> &rarr; jExam öffnen
    <a class="shortcuts__edit txt-help" href="#" @click.prevent="openShortcutSettings()">Bearbeiten</a><br />
  </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

// components

// composables
import { useChrome } from '../composables/chrome'

export default defineComponent({
  components: {},
  setup() {
    const { sendChromeRuntimeMessage } = useChrome()
    const openShortcutSettings = () => sendChromeRuntimeMessage({ cmd: 'open_shortcut_settings' })

    return {
      openShortcutSettings
    }
  }
})
</script>

<style lang="sass" scoped>
.shortcuts
    line-height: 2.5
    margin-left: 1rem

    &__bg
        margin-top: 4px
        margin-bottom: 4px
        padding: 4px
        border-radius: var(--brd-rad-sm)
        background-color: hsl(var(--clr-backgr))
</style>
