<template>
  <h3 class="card-body-title">{{ strings.settings.pages.contact.title }}</h3>
  <p class="p-margin">
    {{ strings.settings.pages.contact.text }}
    <a class="link" target="_blank" :href="`mailto:frage@tu-fast.de?Subject=${strings.settings.pages.contact.subject}`"
      >frage@tu-fast.de</a
    >!<br />
  </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { strings } from '../../../i18n'

export default defineComponent({
  setup() {
    return { strings }
  }
})
</script>

<style lang="sass" scoped>
.link
    text-decoration: underline !important
    color: inherit
</style>
