<template>
    <h2>Werde in alle Online-Portale der TU Dresden automatisch angemeldet.</h2>
    <p class="max-line p-margin">Dafür müssen deine selma Login-Daten sicher auf diesem PC gespeichert werden.
        Die Daten werden nur lokal und verschlüsselt gespeichert.
        Du kannst sie jederzeit löschen.</p>

    <p class="p-margin important">TUfast nimmt dir auch alle Klicks beim Anmelden ab!</p>
    <div class="form">
        <Input placeholder="Input" />
        <Input placeholder="Input" />
        <Button title="Lokal speichern" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

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

.important
    font-weight: 600
    font-size: 1.1em

</style>
