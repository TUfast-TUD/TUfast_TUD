<template>
  <a class="link">
    <span class="link__text">{{ txt }}</span>
    <PhArrowRight class="link__arrow" />
  </a>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { PhArrowRight } from '@dnlsndr/vue-phosphor-icons'

export default defineComponent({
  components: {
    PhArrowRight
  },
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
    color: hsl(var(--clr-primary) )
    font-weight: 600
    user-select: none
    cursor: pointer
    width: max-content
    text-decoration: none

    &__arrow
        width: 28px
        height: 28px
        margin-left: .25rem
        transition: all 250ms ease

    &:hover &__text
        border-bottom: 1px solid
        border-color: currentColor

    &:hover &__arrow
        margin-left: .5rem
</style>
