<template>
  <a class="link">
    <span class="link__text rocket-select__text">{{ txt }} <IconArrowRight class="link__arrow" /></span>
  </a>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  props: {
    txt: {
      type: String as PropType<string>,
      required: true
    }
  },
  setup() {}
})
</script>

<style lang="sass" scoped>
.link
    display: flex
    align-items: center
    color: hsl(var(--clr-accent))
    font-weight: 600
    user-select: none
    cursor: pointer
    width: 100%
    max-width: 100%
    text-decoration: none
    flex: 1
    min-width: 0

    &__text
        word-wrap: break-word
        overflow-wrap: break-word
        width: 100%
        max-width: 100%

    &__arrow
        width: 16px
        height: 16px
        margin-left: .25rem
        transition: all 200ms ease-in-out
        flex-shrink: 0

        svg
            top: 2px

    &:hover &__arrow
        margin-left: .5rem

.link__text:hover
    text-decoration: underline
</style>
