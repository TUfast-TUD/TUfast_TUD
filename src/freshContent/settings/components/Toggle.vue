<template>
    <div :class="`toggle ${toggled ? 'toggle--toggled' : ''} ${disabled ? 'toggle--disabled' : ''}`" @click="emitState()">
        <ph-check v-show="toggled" class="toggle__icon" />    
    </div>    
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue'

export default defineComponent({
    props: {
        modelValue: {
            type: Boolean as PropType<boolean>,
            default: false,
        },
        disabled: {
            type: Boolean as PropType<boolean>,
            default: false,
        },
    },
    setup(props, { emit }) {
        const toggled = ref(false)

        watch(props, () => toggled.value = props.modelValue)

        const emitState = () => {
            if(!props.disabled) {
                toggled.value = !toggled.value
                emit("update:modelValue", toggled.value)
            }
        }

        return {
            toggled,
            emitState,
        }        
    },
})
</script>

<style lang="sass" scoped>
.toggle
    display: flex
    justify-content: center
    align-items: center
    background-color: hsl(var(--clr-white) )
    width: 40px
    height: 40px
    border-radius: 100%
    cursor: pointer

    &:hover
        background-color: hsl(var(--clr-white), .8)

    &--toggled
        background-color: hsl(var(--clr-primary) )
        &:hover
            background-color: hsl(var(--clr-primary), .8)

    &--disabled
        cursor: not-allowed !important
        &:hover
            background-color: hsl(var(--clr-white) )

    &__icon
        width: 80%
        height: 80%

</style>