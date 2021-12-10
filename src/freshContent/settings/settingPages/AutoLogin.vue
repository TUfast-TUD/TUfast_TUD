<template>
    <Card>
        <template v-slot:default>
            Auto Login
        </template>
    </Card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Card from "../components/Card.vue"
import Toggle from "../components/Toggle.vue"

export default defineComponent({
    components: {
        Card,
        Toggle,
    },
    setup() {
        
    },
})
</script>

<style lang="sass" scoped>


</style>