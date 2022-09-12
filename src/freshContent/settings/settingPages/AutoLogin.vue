<template>
    <LoginTabs v-model="currentLogin" :options="logins" />
    <h2>{{ currentLogin.title }}</h2>
    <h2 :class="`state ${currentLogin.state ? 'state--active' : 'state--inactive'}`">{{ currentLogin.state ? "aktiv" : "nicht aktiviert" }}</h2>
    <p class="max-line p-margin">Dafür müssen deine {{ currentLogin.name }} Login-Daten sicher auf diesem PC gespeichert werden.
        Die Daten werden nur lokal und verschlüsselt gespeichert.
        Du kannst sie jederzeit löschen.</p>

    <p class="p-margin important">TUfast nimmt dir auch alle Klicks beim Anmelden ab!</p>
    <div class="form">
        <Input
            v-model="username"
            :pattern="currentLogin.usernamePattern"
            :placeholder="currentLogin.usernamePlaceholder"
            v-model:valid="usernameValid"
            :error-message="currentLogin.usernameError"
        />

        <Input
            v-model="password"
            :pattern="currentLogin.passwordPattern"
            :placeholder="currentLogin.passwordPlaceholder"
            type="password"
            v-model:valid="passwordValid"
            :error-message="currentLogin.passwordError"
        />

        <Button @click="saveUserData" title="Lokal speichern" :disabled="!(passwordValid && usernameValid)" />
        <Button @click="deleteUserData" title="Daten löschen" class="button--secondary" />
    </div>
</template>

<script lang="ts">
import { ref, defineComponent, watchEffect } from 'vue'

import Input from '../components/Input.vue'
import Button from "../components/Button.vue"
import LoginTabs from '../components/LoginTabs.vue'

import { useLogins } from '../composables/logins'
import { useChrome } from '../composables/chrome'

export default defineComponent({
    components: {
        Input,
        Button,
        LoginTabs,
    },
    setup() {
        const { logins } = useLogins()
        const {
            setChromeLocalStorage,
            sendChromeRuntimeMessage,
        } = useChrome()
        const currentLogin = ref(logins[0])

        const username = ref("")
        const password = ref("")
        const usernameValid = ref(false)
        const passwordValid = ref(false)

        const autoLoginActive = ref(false)

        // get state of login
        watchEffect(async () =>
            currentLogin.value.state = await sendChromeRuntimeMessage({
                cmd: "check_user_data",
                platform: currentLogin.value.id
            }) as boolean
        )

        const saveUserData = ($event : MouseEvent) => {
            const target = $event.target as HTMLButtonElement
            
            if (target.disabled) return

            setChromeLocalStorage({ isEnabled: true }) // activate auto login feature
            sendChromeRuntimeMessage({
                cmd: "set_user_data",
                userData: { user: username.value, pass: password.value },
                platform: currentLogin.value.id
            })
            username.value = ""
            password.value = ""
            currentLogin.value.state = true

        }

        const deleteUserData = () => {
            sendChromeRuntimeMessage({ cmd: "clear_badge" })
            sendChromeRuntimeMessage({ cmd: "delete_user_data", platform: currentLogin.value.id })

            // deactivate owa fetch
            if (currentLogin.value.id === 'zih') {
                sendChromeRuntimeMessage({ cmd: "disable_owa_fetch" })
                setChromeLocalStorage({ enabledOWAFetch: false })
                setChromeLocalStorage({ additionalNotificationOnNewMail: false })
            }
            currentLogin.value.state = false
        }

        return {
            logins, 
            currentLogin,
            username,
            password,
            usernameValid,
            passwordValid,
            autoLoginActive,
            saveUserData, 
            deleteUserData,
        }
        
    },
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
