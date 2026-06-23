<template>
  <h3 class="card-body-title">{{ t('settings.pages.contact.title') }}</h3>
  <p class="p-margin">
    {{ t('settings.pages.contact.text') }}
    <a class="link" target="_blank" :href="`mailto:frage@tu-fast.de?Subject=${t('settings.pages.contact.subject')}`"
      >frage@tu-fast.de</a
    >!<br />
  </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { t } from '../../../i18n'

export default defineComponent({
  setup() {
    return { t }
  }
})
</script>

<style lang="sass" scoped>
.link
    text-decoration: underline !important
    color: inherit
</style>
