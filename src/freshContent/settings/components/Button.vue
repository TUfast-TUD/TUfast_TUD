<template>
  <button class="button">
    {{ title }}
  </button>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  props: {
    title: {
      type: String as PropType<string>,
      required: true
    }
  },
  setup() {}
})
</script>

<style lang="sass" scoped>
.button
    border: none
    border-radius: var(--brd-rad)
    padding: .8rem 2rem
    background-color: hsl(var(--clr-accent) )
    color: hsl(var(--clr-white) )
    cursor: pointer
    transition: all 200ms ease-in-out
    font-size: 1.2em
    font-weight: 600

    &:hover, &:active
        outline: 3px solid hsl(var(--clr-focus))

    &:disabled
        opacity: 0.4
        cursor: not-allowed
        &:hover
            outline: none

    &--warn
      background-color: hsl(var(--clr-alert))

      &:disabled:hover
        background-color: hsl(var(--clr-alert))
</style>
