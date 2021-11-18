<template>
    <div>
        <h1 v-if="toggle" class="message">{{ x }} From TUFast</h1>
        <button class="pos-me test" @click="toggle = !toggle">Toggle Text</button>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
    setup() {
        const x = ref<string>("Hello World!")
        const toggle = ref<boolean>(true)
        console.log(x.value)

        return { x, toggle }
    }
})

</script>

<style lang="sass" scoped>
.message
    font-size: 5rem

.pos-me
    position: fixed
    left: 10px
    top: 45vh
    font-size: 3rem

.test
    color: red
</style>