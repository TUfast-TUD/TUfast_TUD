<template>
    <div class="title">
        <h1 class="upper">AutoLogin</h1>
        <h2>in die Onlineportale der TU Dresden</h2>
    </div>
    <div class="inputs">
        <Input
            v-model="username"
            placeholder="Nutzername (selma-Login)"
            :pattern="/^(([s]{1}\d{6})|([a-z]{2,6}\d{3}[a-z]{1}))$/"
            errorMessage="Ohne @mailbox.tu-dresden.de, also z.B. 's3276763' oder 'luka075d'"
            v-model:valid="usernameValid"
            :column="true"
        />
        <Input
            v-model="password"
            placeholder="Password (selma-Login)"
            :pattern="/.{5,}/"
            type="password"
            errorMessage="Das Passwort muss mindestens 5 Zeichen haben!"
            v-model:valid="passwordValid"
            :column="true"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/runtime-core'
import Onboarding from '../components/Onboarding.vue'
import Input from '../components/Input.vue'

export default defineComponent({
    components: {
    Onboarding,
    Input,
},
    setup() {
        const username = ref("")
        const password = ref("")
        const usernameValid = ref(false)
        const passwordValid = ref(false)

        return { username, password, usernameValid, passwordValid }
    },
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