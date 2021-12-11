<template>
    <button class="button">{{ title }}</button>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
    props: {
        title: {
            type: String as PropType<string>,
            required: true,
        },
    },
    setup() {

    },
})
</script>

<style lang="sass" scoped>
.button
    border-radius: 12px
    padding: .8rem 2rem
    background-color: hsl(var(--clr-primary) )
    color: hsl(var(--clr-white) )
    cursor: pointer
    transition: all 150ms ease
    font-size: 1.2em
    font-weight: 600

    &:hover
        transform: scale(1.1)
</style>