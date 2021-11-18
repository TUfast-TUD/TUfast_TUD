<template>
    <h1>{{ x }}</h1>
    <button v-if="toggle" @click="toggle = !toggle">Toggle Text</button>
</template>

<script lang="ts" setup>
import { ref } from '@vue/reactivity'

const x = ref<string>("Hello World!")
const toggle = ref<boolean>(true)
</script>

<style lang="sass" scoped>
.message
    font-size: 10rem
</style>