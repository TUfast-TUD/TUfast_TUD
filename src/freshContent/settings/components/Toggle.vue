<template>
  <div
    :class="`toggle ${toggled ? 'toggle--toggled' : ''} ${disabled ? 'toggle--disabled' : ''}`"
    @click="emitState()"
  >
    <PhCheck
      v-show="toggled"
      class="toggle__icon"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue'
import { PhCheck } from '@dnlsndr/vue-phosphor-icons'

export default defineComponent({
  components: {
    PhCheck
  },
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
  setup (props, { emit }) {
    const toggled = ref(props.modelValue)

    watch(props, () => { toggled.value = props.modelValue })

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
    background-color: hsl(var(--clr-white) )
    width: 40px
    height: 40px
    border-radius: 100%
    cursor: pointer

    &::before
        position: absolute
        transform: translate(50%)
        content: ""
        width: 5%
        height: 5%
        opacity: 0
        border-radius: 100%
        transition: transform 200ms ease, opacity 200ms ease
        transform-origin: center
        background-color: hsl(var(--clr-primary), .8)

    &:hover:not(&--toggled)::before
        opacity: 1
        transform: scale(1000%)

    &--toggled
        background-color: hsl(var(--clr-primary) ) !important
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
