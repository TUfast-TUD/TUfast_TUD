<template>
  <h1 class="upper">
    Opal verbessern
  </h1>
  <div class="info">
    <Setting
      txt="PDF-Dokumente im Browser öffnen"
      :column="true"
    />
    <Setting
      txt="PDF-Dokumente in neuem Tab öffnen"
      :column="true"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
// import Onboarding from '../components/Onboarding.vue'
import Setting from '../components/Setting.vue'

export default defineComponent({
  components: {
    //    Onboarding,
    Setting
  },
  setup () {

  }
})

</script>

<style lang="sass" scoped>
.info
    margin-top: .8rem
    width: 70%
    display: flex
    justify-content: space-between
    align-items: center
    gap: .8rem
</style>
