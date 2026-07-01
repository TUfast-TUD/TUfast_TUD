<template>
  <h3 class="card-body-title">{{ t('settings.pages.shortcuts.title') }}</h3>
  <p class="max-line p-margin">{{ t('settings.pages.shortcuts.activeByDefault') }}</p>

  <p class="shortcuts">
    <span class="shortcuts__bg">Alt</span> + <span class="shortcuts__bg">Q</span> &rarr;
    {{ t('settings.pages.shortcuts.dashboard') }}
    <a class="shortcuts__edit txt-help" href="#" @click.prevent="openShortcutSettings()">{{ t('common.edit') }}</a
    ><br />
    <span class="shortcuts__bg">Alt</span> + <span class="shortcuts__bg">O</span> &rarr;
    {{ t('settings.pages.shortcuts.opal') }}
    <a class="shortcuts__edit txt-help" href="#" @click.prevent="openShortcutSettings()">{{ t('common.edit') }}</a
    ><br />
    <span class="shortcuts__bg">Alt</span> + <span class="shortcuts__bg">M</span> &rarr;
    {{ t('settings.pages.shortcuts.mail') }}
    <a class="shortcuts__edit txt-help" href="#" @click.prevent="openShortcutSettings()">{{ t('common.edit') }}</a
    ><br />
  </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { t } from '../../../i18n'

// components

// composables
import { useChrome } from '../composables/chrome'

export default defineComponent({
  components: {},
  setup() {
    const { sendChromeRuntimeMessage } = useChrome()
    const openShortcutSettings = () => sendChromeRuntimeMessage({ cmd: 'open_shortcut_settings' })

    return {
      openShortcutSettings,
      t
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
