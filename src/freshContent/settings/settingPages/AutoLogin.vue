<template>
    <h2>Werde in alle Online-Portale der TU Dresden automatisch angemeldet.</h2>
    <h2 :class="`state ${autoLoginActive ? 'state--active' : 'state--inactive'}`">{{ autoLoginActive ? "aktiv" : "nicht aktiviert" }}</h2>
    <p class="max-line p-margin">Dafür müssen deine selma Login-Daten sicher auf diesem PC gespeichert werden.
        Die Daten werden nur lokal und verschlüsselt gespeichert.
        Du kannst sie jederzeit löschen.</p>

    <p class="p-margin important">TUfast nimmt dir auch alle Klicks beim Anmelden ab!</p>
    <div class="form">
        <Input
            v-model="username"
            :pattern="/^(([s]{1}\d{6})|([a-z]{2,6}\d{3}[a-z]{1}))$/"
            placeholder="Nutzername (selma-Login)"
            v-model:valid="usernameValid"
            errorMessage="Ohne @mailbox.tu-dresden.de, also z.B. 's3276763' oder 'luka075d'"
        />

        <Input
            v-model="password"
            :pattern="/.{5,}/"
            placeholder="Passwort (selma-Login)"
            type="password"
            v-model:valid="passwordValid"
            errorMessage="Das Passwort muss mindestens 5 Zeichen haben!"
        />

        <Button @click="saveUserData" title="Lokal speichern" :disabled="!(passwordValid && usernameValid)" />
        <Button title="Daten löschen" class="button--secondary" />
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'

import Card from "../components/Card.vue"
import Toggle from "../components/Toggle.vue"
import Input from '../components/Input.vue'
import Button from "../components/Button.vue"

export default defineComponent({
    components: {
        Input,
        Button,
    },
    setup() {
        const username = ref("")
        const password = ref("")
        const usernameValid = ref(false)
        const passwordValid = ref(false)

        const autoLoginActive = ref(false)

        onMounted(() => { chrome.storage.local.get(["isEnabled"], (res) => autoLoginActive.value = res.isEnabled) })

        const saveUserData = ($event : MouseEvent) => {
            const target = $event.target as HTMLButtonElement
            
            if (target.disabled) return

            chrome.storage.local.set({ isEnabled: true }, () => {}) // activate auto login feature
            chrome.runtime.sendMessage({ cmd: "clear_badge" })
            chrome.runtime.sendMessage({ cmd: 'set_user_data', userData: { asdf: username.value, fdsa: password.value } })
            username.value = ""
            password.value = ""
            autoLoginActive.value = true

        }

        return {
            username,
            password,
            usernameValid,
            passwordValid,
            autoLoginActive,
            saveUserData,
        }
        
    },
})
</script>

<style lang="sass" scoped>
.form
    width: 300px
    display: flex
    flex-direction: column
    align-items: stretch
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
</style>
