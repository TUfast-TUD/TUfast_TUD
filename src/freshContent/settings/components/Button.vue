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
    border-radius: 12px
    padding: .8rem 2rem
    background-color: hsl(var(--clr-primary) )
    color: hsl(var(--clr-white) )
    cursor: pointer
    transition: all 150ms ease
    font-size: 1.2em
    font-weight: 600

    @media (prefers-color-scheme: light)
        color: hsl(var(--clr-grey) )

        &:hover, &:active
            outline-color: hsl(var(--clr-grey) ) !important

    &:hover
        // transform: scale(1.1)
        outline: 1px solid hsl(var(--clr-white) )
        outline-offset: .5rem

    &:active
        transform: scale(.95)
        outline-offset: .25rem

    &:disabled
        background-color: hsl(var(--clr-primary), .5)
        cursor: not-allowed
        &:hover
            outline: none

    &--secondary
        background-color: hsl(var(--clr-grey), .8)
        &:hover
            outline: none

        &:disabled
          background-color: hsl(var(--clr-grey), .6)

    &--warn
      background-color: hsl(var(--clr-alert), .8)
      &:hover
        outline: none
        background-color: hsl(var(--clr-alert), 1)

      &:disabled
        background-color: hsl(var(--clr-alert), .4)
</style>
