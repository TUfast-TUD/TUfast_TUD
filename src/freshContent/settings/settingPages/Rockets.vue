<template>
  <h3 class="card-body-title">{{ strings.settings.pages.rockets.title }}</h3>
  <p class="p-margin">{{ strings.settings.pages.rockets.help }}</p>

  <RocketSelect />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { strings } from '../../../i18n'

// import Setting from '../components/Setting.vue'
import RocketSelect from '../components/RocketSelect.vue'

export default defineComponent({
  components: {
    //    Setting,
    RocketSelect
  },
  setup() {
    return { strings }
  }
})
</script>

<style lang="sass" scoped>
.rocket
    height: 48px
    filter: invert(100%)
    margin-right: .8rem

    .light &
        filter: invert(0%)
</style>
