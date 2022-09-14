<template>
  <div class="title">
    <h1 class="upper">
      AutoLogin
    </h1>
    <h2>in die Onlineportale der TU Dresden</h2>
  </div>
  <div class="inputs">
    <CustomInput
      v-model="username"
      v-model:valid="usernameValid"
      placeholder="Nutzername (selma-Login)"
      :pattern="/^(s{1}\d{7}|[a-z]{4}\d{3}[a-z])$/i"
      error-message="Ohne @mailbox.tu-dresden.de, also z.B. 's3276763' oder 'luka075d'"
      :column="true"
    />
    <CustomInput
      v-model="password"
      v-model:valid="passwordValid"
      placeholder="Password (selma-Login)"
      :pattern="/.{5,}/"
      type="password"
      error-message="Das Passwort muss mindestens 5 Zeichen haben!"
      :column="true"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'

// components
// import Onboarding from '../components/Onboarding.vue'
import Input from '../components/Input.vue'

// composables
import { useUserData } from '../composables/user-data'

export default defineComponent({
  components: {
    //    Onboarding,
    CustomInput: Input
  },
  setup () {
    const { saveUserData } = useUserData()
    const username = ref('')
    const password = ref('')
    const usernameValid = ref(false)
    const passwordValid = ref(false)

    const ready = computed(() => usernameValid.value && passwordValid.value)

    watch(ready, async () => {
      if (ready.value === true) { await saveUserData(username.value, password.value, 'zih') }
    })

    return { username, password, usernameValid, passwordValid }
  }
})

</script>

<style lang="sass" scoped>
.title
    display: flex
    flex-direction: column
    align-items: center
.inputs
    display: flex
    flex-direction: column
    align-items: center
    gap: .8rem
.info
    margin-top: .8rem
    width: 70%
    display: flex
    justify-content: space-between
    align-items: center
</style>
