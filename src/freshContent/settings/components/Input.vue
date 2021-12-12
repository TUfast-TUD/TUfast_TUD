<template>
    <div class="input">
        <input class="input__input" :type="type" :placeholder="placeholder" v-model="inputText">
        <component class="input__icon" :is="statusIcon" />
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, computed } from 'vue'

export default defineComponent({
    props: {
        type: {
            type: String as PropType<string>,
            default: "text"
        },
        placeholder: {
            type: String as PropType<string>,
            required: true,
        },
        pattern: {
            type: Object as PropType<RegExp>,
            default: null,
        }
    },
    setup(props) {
        const statusIcon = ref("ph-check-circle")
        const inputText = ref("")
        const regexPatternSelmaLogin = /([s]\d{6})|(\w+\d{3}\w)/gm

        const state = computed(() => {
            return regexPatternSelmaLogin.test(inputText.value)
        })

        

        return {
            statusIcon,
            inputText,
            state,
        }
        
    },
})
</script>

<style lang="sass" scoped>
.input
    display: flex
    justify-content: space-between
    align-items: center
    width: min-content
    height: 60px
    border-radius: 12px
    background-color: hsl(var(--clr-grey) )
    border: 1px solid hsl(var(--clr-state, var(--clr-grey)), .4)

    &:hover, &:focus-within
        border: 1px solid hsl(var(--clr-state, var(--clr-white)), .8)

    &::before
        content: ""
        width: 1px
        height: 50%
        background-color: hsl(var(--clr-state, var(--clr-grey)) )
        margin-left: .5rem

    &__input
        color: hsl(var(--clr-white) )
        background-color: inherit
        border: none
        margin: 0 .5rem
        height: 100%

        &:focus
            outline: none

        &::placeholder
            color: hsl(var(--clr-white), .5)

    &__icon
        height: 28px
        width: 28px
        color: hsl(var(--clr-state, var(--clr--grey)) )
        margin-right: .3rem
</style>