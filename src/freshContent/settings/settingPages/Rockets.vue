<template>
  <h2>Schalte neue Raketen frei und gestalte damit OPAL und deinen Browser!</h2>
  <p>Damit unterstützt du auch das TUfast-Projekt und das hilft uns sehr 🙂</p>

  <RocketSelect />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

// import Setting from '../components/Setting.vue'
import RocketSelect from '../components/RocketSelect.vue'

export default defineComponent({
  components: {
    //    Setting,
    RocketSelect
  },
  setup () {
    return {
    }
  }
})
</script>

<style lang="sass" scoped>
.rocket
    height: 50px
    filter: invert(100%)
    margin-right: .8rem
</style>
