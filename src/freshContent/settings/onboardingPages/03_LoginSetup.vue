<template>
  <div class="title">
    <h1 class="upper">
      AutoLogin
    </h1>
    <h2>in die Onlineportale der TU Dresden</h2>
  </div>
  <Setting
    v-model="accept"
    txt="Autologin aktivieren"
    :column="true"
    @click="setStepWidth()"
  />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

// components
import Setting from '../components/Setting.vue'

// composables
import { useStepper } from '../composables/stepper'

export default defineComponent({
  components: {
    //    Onboarding,
    Setting
  },
  emits: ['accept'],
  setup (_) {
    const { stepWidth } = useStepper()

    const accept = ref(true)

    const setStepWidth = () => {
      if (accept.value) { stepWidth.value = 1 } else { stepWidth.value = 3 }
    }

    return { accept, setStepWidth }
  }
})
</script>

<style lang="sass" scoped>
.title
    display: flex
    flex-direction: column
    align-items: center
.info
    margin-top: .8rem
    width: 70%
    display: flex
    justify-content: space-between
    align-items: center
</style>
