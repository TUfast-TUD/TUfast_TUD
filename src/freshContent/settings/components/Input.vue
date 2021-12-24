<template>
    <div class="input-container">
        <div :class="`input ${state}`">
            <input @input="emitState('update:modelValue', $event)" :value="modelValue" class="input__input" :type="type" :placeholder="placeholder">
            <component :class="`input__icon ${modelValue.length > 0 ? 'input__icon--visible' : ''}`" :is="statusIcon" />
        </div>
        <span v-if="!valid && modelValue.length > 0" class="error-message">{{ errorMessage }}</span>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, computed, watchEffect } from 'vue'

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
        },
        modelValue: {
            type: String as PropType<string>,
            default: "",
        },
        valid: {
            type: Boolean as PropType<boolean>,
            default: false,
        },
        errorMessage: {
            type: String as PropType<string>,
            required: true,
        },
    },
    setup(props, { emit }) {
        const statusIcon = ref("ph-check-circle")
        const state = ref("")

        const emitState = (eventName : string, $event : Event) => {
            const target = <HTMLInputElement>$event.target
            emit(eventName, target.value)
        }

        const correctPattern = computed(() => props.pattern.test(props.modelValue))
    
        watchEffect(() => {
            if (props.modelValue.length > 0) {
                state.value = correctPattern.value ? "input--correct" : "input--false"
                statusIcon.value = correctPattern.value ? "ph-check-circle" : "ph-x-circle"
                emit("update:valid", correctPattern.value)
            }
            else
                state.value = ""
        })

        return {
            statusIcon,
            correctPattern,
            emitState,
            state
        }
        
    },
})
</script>

<style lang="sass" scoped>
.input-container
    display: flex
    align-items: center
    width: max-content

.error-message
    margin-left: .8rem

.input
    display: flex
    justify-content: space-between
    align-items: center
    width: min-content
    height: 60px
    border-radius: 12px
    background-color: hsl(var(--clr-grey) )
    border: 1px solid hsl(var(--clr-state, var(--clr-grey)), .4)

    &--correct
        --clr-state: var(--clr-primary)
    &--false
        --clr-state: var(--clr-alert)

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
        opacity: 0
        &--visible
            opacity: 1
</style>