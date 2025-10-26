<template>
  <LoginTabs v-model="currentLogin" :options="logins" class="onboarding-hide onboarding-hide-otp" />
  <h3 class="onboarding-hide onboarding-hide-otp">{{ currentLogin.title }}</h3>
  <h3 class="onboarding-hide onboarding-hide-otp" style="margin-top: 4px">
    <span :class="`state ${currentLogin.state ? 'state--active' : 'state--inactive'}`"
      >{{ currentLogin.state ? 'Aktuell gespeichert' : 'Keine Daten gespeichert' }}
    </span>
  </h3>
  <p class="max-line p-margin onboarding-hide-otp" style="margin-bottom: 16px">
    Dafür müssen deine {{ currentLogin.name }} Login-Daten sicher auf diesem PC gespeichert werden. Die Daten werden nur
    lokal und verschlüsselt gespeichert. Du kannst sie jederzeit löschen.
  </p>

  <div class="form onboarding-hide-otp">
    <div>
      <div class="label-container">
        <p>{{ currentLogin.usernamePlaceholder }}</p>
      </div>
      <CustomInput
        v-model="username"
        v-model:valid="usernameValid"
        :pattern="currentLogin.usernamePattern"
        :placeholder="loginDataSaved ? 'GESPEICHERT' : currentLogin.usernamePlaceholder"
        :error-message="currentLogin.usernameError"
        :disabled="loginDataSaved"
        warn
      />
    </div>
    <div>
      <div class="label-container">
        <p>{{ currentLogin.passwordPlaceholder }}</p>
      </div>
      <CustomInput
        v-model="password"
        v-model:valid="passwordValid"
        :pattern="currentLogin.passwordPattern"
        :placeholder="loginDataSaved ? 'GESPEICHERT' : currentLogin.passwordPlaceholder"
        type="password"
        :error-message="currentLogin.passwordError"
        :disabled="loginDataSaved"
      />
    </div>

    <CustomButton
      title="Login lokal speichern"
      :disabled="!(passwordValid && usernameValid) || loginDataSaved"
      @click="submitSave"
    />
    <CustomButton
      title="Login löschen"
      class="button--warn"
      style="min-width: 300px"
      :disabled="!loginDataSaved"
      @click="submitDeleteLogin"
    />
  </div>

  <div v-if="currentLogin2FA" class="onboarding-hide">
    <h3 class="card-body-title onboarding-hide-otp" style="margin-top: 4rem">Zwei-Faktor-Authentifizierung (2FA)</h3>
    <h3 class="onboarding-hide onboarding-hide-otp" style="margin-top: 4px">
      <span :class="`state ${totpSecretSaved ? 'state--active' : 'state--inactive'}`"
        >{{ totpSecretSaved ? 'Aktuell gespeichert' : 'Keine Daten gespeichert' }}
      </span>
    </h3>

    <p class="max-line p-margin">
      Das Automatische Anmelden unterstützt auch 2FA. Hier kannst du dafür deinen TOTP Secret-Key speichern. Der Key ist
      Base32 enkodiert und sieht zum Beispiel so aus:
      <span
        style="
          margin-top: 8px;
          margin-bottom: 8px;
          padding: 4px;
          border-radius: var(--brd-rad-sm);
          background-color: hsl(var(--clr-btnhov));
        "
        >MHSTKUIKTTHPQAZNVWQBJE5YQ2WACQQP</span
      >
    </p>
    <a href="https://github.com/TUfast-TUD/TUfast_TUD/blob/main/docs/2FA.md" target="_blank"
      >Hier findest du mehr Informationen und eine vollständige Anleitung zur Einrichtung.</a
    ><br /><br />
    <div class="form">
      <div>
        <div class="label-container">
          <p>{{ currentLogin2FA.totpSecretPlaceholder }}</p>
        </div>
      </div>
      <CustomInput
        v-model="totpSecret"
        v-model:valid="totpSecretValid"
        :pattern="currentLogin2FA.totpSecretPattern"
        :placeholder="totpSecretSaved ? 'GESPEICHERT' : currentLogin2FA.totpSecretPlaceholder"
        :error-message="currentLogin2FA.totpSecretError"
        :disabled="totpSecretSaved"
        warn
      />
      <CustomButton
        title="Key lokal speichern"
        :disabled="!totpSecretValid || totpSecretSaved"
        @click="submitSaveTotp"
      />
      <CustomButton
        title="Key löschen"
        class="button--warn"
        style="min-width: 300px"
        :disabled="!totpSecretSaved"
        @click="submitDeleteTotp"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, watchEffect, computed } from 'vue'

// components
import Input from '../components/Input.vue'
import Button from '../components/Button.vue'
import LoginTabs from '../components/LoginTabs.vue'

// composables
import { useLogins } from '../composables/logins'
import { useChrome } from '../composables/chrome'
import { useUserData } from '../composables/user-data'

import type { Login, Login2FA } from '../types/Login'

function isLogin2FA(login: Login | Login2FA): login is Login2FA {
  return 'totpSecretPattern' in login
}

export default defineComponent({
  components: {
    CustomInput: Input,
    CustomButton: Button,
    LoginTabs
  },
  setup() {
    const { logins } = useLogins()
    const { sendChromeRuntimeMessage } = useChrome()
    const { saveUserData, deleteUserData } = useUserData()

    const currentLogin = ref(logins[0])

    const username = ref('')
    const password = ref('')
    const usernameValid = ref(false)
    const passwordValid = ref(false)
    const totpSecret = ref('')
    const totpSecretValid = ref(false)

    const totpSecretSaved = ref(false)
    const loginDataSaved = ref(false)

    const autoLoginActive = ref(false)

    // get state of login
    watchEffect(async () => {
      currentLogin.value.state = (await sendChromeRuntimeMessage({
        cmd: 'check_user_data',
        platform: currentLogin.value.id
      })) as boolean

      loginDataSaved.value = currentLogin.value.state

      // Check if TOTP is saved
      const totpExists = (await sendChromeRuntimeMessage({
        cmd: 'check_otp',
        platform: currentLogin.value.id
      })) as boolean

      totpSecretSaved.value = totpExists
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
      loginDataSaved.value = true
      currentLogin.value.state = (await sendChromeRuntimeMessage({
        cmd: 'check_user_data',
        platform: currentLogin.value.id
      })) as boolean
    }

    const submitSaveTotp = async () => {
      const secret = totpSecret.value
      await sendChromeRuntimeMessage({
        cmd: 'set_otp',
        otpType: 'totp',
        secret,
        platform: currentLogin.value.id
      })
      totpSecret.value = ''
      totpSecretValid.value = false
      totpSecretSaved.value = true
      totpSecretSaved.value = (await sendChromeRuntimeMessage({
        cmd: 'check_otp',
        platform: currentLogin.value.id
      })) as boolean
    }

    const currentLogin2FA = computed(() => {
      return isLogin2FA(currentLogin.value) ? (currentLogin.value as Login2FA) : null
    })

    const submitDeleteLogin = async () => {
      await deleteUserData(currentLogin.value.id)
      username.value = ''
      password.value = ''
      loginDataSaved.value = false
      currentLogin.value.state = (await sendChromeRuntimeMessage({
        cmd: 'check_user_data',
        platform: currentLogin.value.id
      })) as boolean
    }

    const submitDeleteTotp = async () => {
      await sendChromeRuntimeMessage({
        cmd: 'delete_otp',
        platform: currentLogin.value.id
      })
      totpSecret.value = ''
      totpSecretSaved.value = false
      currentLogin.value.state = (await sendChromeRuntimeMessage({
        cmd: 'check_otp',
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
      currentLogin2FA,
      totpSecret,
      totpSecretSaved,
      totpSecretValid,
      loginDataSaved,
      submitSave,
      submitSaveTotp,
      submitDeleteLogin,
      submitDeleteTotp
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

.important
    font-weight: 600
    font-size: 1.1em

.state
    font-size: inherit
    font-weight: 600
    &--active
        color: hsl(var(--clr-success))
        background-color: hsl(var(--clr-success-bg))
        text-wrap: auto
        border-radius: var(--brd-rad)
        padding: 4px 8px
    &--inactive
        color: hsl(var(--clr-alert))
        background-color: hsl(var(--clr-alert-bg))
        text-wrap: auto
        border-radius: var(--brd-rad)
        padding: 4px 8px

.tabs
    display: flex

a
    color: hsla(var(--clr-text), 0.6)
    text-decoration: underline

.label-container
    display: flex
    align-items: center
    justify-content: space-between
    gap: 0.5rem
</style>
