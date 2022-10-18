<template>
  <LoginTabs
    v-model="currentLogin"
    :options="logins"
  />
  <h2>{{ currentLogin.title }}</h2>
  <h2
    :class="`state ${currentLogin.state ? 'state--active' : 'state--inactive'}`"
  >
    {{ currentLogin.state ? "Aktuell gespeichert" : "Nicht gespeichert" }}
  </h2>
  <p class="max-line p-margin">
    Dafür müssen deine {{ currentLogin.name }} Login-Daten sicher auf diesem PC
    gespeichert werden. Die Daten werden nur lokal und verschlüsselt
    gespeichert. Du kannst sie jederzeit löschen.
  </p>

  <p class="p-margin important">
    TUfast nimmt dir auch alle Klicks beim Anmelden ab!
  </p>
  <div class="form">
    <CustomInput
      v-model="username"
      v-model:valid="usernameValid"
      :pattern="currentLogin.usernamePattern"
      :placeholder="currentLogin.usernamePlaceholder"
      :error-message="currentLogin.usernameError"
      warn
    />

    <CustomInput
      v-model="password"
      v-model:valid="passwordValid"
      :pattern="currentLogin.passwordPattern"
      :placeholder="currentLogin.passwordPlaceholder"
      type="password"
      :error-message="currentLogin.passwordError"
    />

    <CustomButton
      title="Lokal speichern"
      :disabled="!(passwordValid && usernameValid)"
      @click="submitSave"
    />
    <CustomButton
      title="Daten löschen"
      class="button--warn"
      :disabled="!currentLogin.state"
      @click="submitDelete"
    />
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, watchEffect } from 'vue'

// components
import Input from '../components/Input.vue'
import Button from '../components/Button.vue'
import LoginTabs from '../components/LoginTabs.vue'

// composables
import { useLogins } from '../composables/logins'
import { useChrome } from '../composables/chrome'
import { useUserData } from '../composables/user-data'

export default defineComponent({
  components: {
    CustomInput: Input,
    CustomButton: Button,
    LoginTabs
  },
  setup () {
    const { logins } = useLogins()
    const { sendChromeRuntimeMessage } = useChrome()
    const { saveUserData, deleteUserData } = useUserData()

    const currentLogin = ref(logins[0])

    const username = ref('')
    const password = ref('')
    const usernameValid = ref(false)
    const passwordValid = ref(false)

    const autoLoginActive = ref(false)

    // get state of login
    watchEffect(async () => {
      currentLogin.value.state = (await sendChromeRuntimeMessage({
        cmd: 'check_user_data',
        platform: currentLogin.value.id
      })) as boolean
    })

    const submitSave = async ($event: MouseEvent) => {
      const target = $event.target as HTMLButtonElement

      if (target.disabled) return

      // await this one to get back the new value in last line, otherwise could run too late
      await saveUserData(username.value, password.value, currentLogin.value.id)

      // reset values
      username.value = ''
      password.value = ''
      usernameValid.value = false
      passwordValid.value = false
      currentLogin.value.state = (await sendChromeRuntimeMessage({
        cmd: 'check_user_data',
        platform: currentLogin.value.id
      })) as boolean
    }

    const submitDelete = async () => {
      // await this one to get back the new value in last line, otherwise could run too late
      await deleteUserData(currentLogin.value.id)
      currentLogin.value.state = (await sendChromeRuntimeMessage({
        cmd: 'check_user_data',
        platform: currentLogin.value.id
      })) as boolean
    }

    return {
      logins,
      currentLogin,
      username,
      password,
      usernameValid,
      passwordValid,
      autoLoginActive,
      submitSave,
      submitDelete
    }
  }
})
</script>

<style lang="sass" scoped>
.form
    width: 300px
    display: flex
    flex-direction: column
    justify-content: space-between
    gap: 1rem
    margin-left: 1rem

.important
    font-weight: 600
    font-size: 1.1em

.state
    font-weight: 600
    &--active
        color: hsl(var(--clr-primary))
    &--inactive
        color: hsl(var(--clr-alert))

.tabs
    display: flex
</style>
