<template>
  <p class="txt-help txt-center">Wirklich sofort anmelden? Dann richte die Zwei-Faktor-Authentifizierung ein</p>
  <div class="onboarding-inner-info">
    <AutoLogin />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'

// components
import AutoLogin from '../settingPages/AutoLogin.vue'

// composables
import { useUserData } from '../composables/user-data'
import { useStepper } from '../composables/stepper'
import { useLogins } from '../composables/logins'

export default defineComponent({
  components: {
    AutoLogin
  },
  emits: ['accept'],
  setup(_) {
    const { stepWidth } = useStepper()
    const { saveUserData } = useUserData()
    const { logins } = useLogins()

    const zihLogin = logins[0]
    const accept = ref(true)
    const username = ref('')
    const password = ref('')
    const usernameValid = ref(false)
    const passwordValid = ref(false)

    const setStepWidth = () => {
      if (accept.value) {
        stepWidth.value = 1
      } else {
        stepWidth.value = 3
      }
    }

    const ready = computed(() => usernameValid.value && passwordValid.value)

    watch(ready, async () => {
      if (ready.value === true) {
        await saveUserData(username.value, password.value, 'zih')
        stepWidth.value = 1
      } else {
        stepWidth.value = 2
      }
    })

    return {
      accept,
      setStepWidth,
      username,
      password,
      usernameValid,
      passwordValid,
      zihLogin,
      AutoLogin
    }
  }
})
</script>

<style lang="sass" scoped>
:deep(.onboarding-hide-otp)
    display: none !important
</style>
