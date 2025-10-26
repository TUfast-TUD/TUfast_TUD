<template>
  <div
    :class="`toggle ${toggled ? 'toggle--toggled' : ''} ${disabled ? 'toggle--disabled' : ''}`"
    tabindex="0"
    @click="emitState()"
    @keyup.enter="emitState()"
    @keyup.space="emitState()"
  >
    <IconCheck v-show="toggled" class="toggle__icon" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue'

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const toggled = ref(props.modelValue)

    watch(props, () => {
      toggled.value = props.modelValue
    })

    const emitState = () => {
      if (!props.disabled) {
        toggled.value = !toggled.value
        emit('update:modelValue', toggled.value)
      }
    }

    return {
      toggled,
      emitState
    }
  }
})
</script>

<style lang="sass" scoped>
.toggle
    position: relative
    display: flex
    justify-content: center
    align-items: center
    background-color: (var(--clr-toggle))
    min-width: 40px
    width: 40px
    height: 40px
    border-radius: var(--brd-rad)
    cursor: pointer

    &::before
        position: absolute
        transform: translate(50%)
        content: ""
        width: 5%
        height: 5%
        opacity: 0
        border-radius: var(--brd-rad)
        transition: transform 200ms ease-in-out, opacity 200ms ease-in-out
        transform-origin: center
        background-color: hsl(var(--clr-accent), .8)

    &:hover:not(&--toggled)::before
        opacity: 1
        transform: scale(1000%)

    &--toggled
        background-color: hsl(var(--clr-accent) ) !important
        &:hover
            background-color: hsl(var(--clr-accent), .8)

    &--disabled
        background-color: var(--clr-toggle-disabled)
        cursor: not-allowed !important
        &:hover
            &::before
              opacity: 0 !important
              transform: none !important

    &__icon
        width: 80%
        height: 80%
</style>
