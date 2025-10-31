<template>
  <div v-if="!inline" />
  <div tabindex="0" :class="['card', { 'card--inline': inline }]">
    <div class="card__body">
      <slot>Body</slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  components: {},
  props: {
    title: {
      type: String as PropType<string>,
      default: ''
    },
    inline: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  }
})
</script>

<style lang="sass" scoped>
.card
    position: absolute
    background-color: hsl(var(--clr-card))
    border-radius: 0 0 var(--brd-rad) var(--brd-rad)
    display: flex
    flex-direction: column
    outline: none

    // Inline/Dropdown mode styling
    &--inline
        position: relative
        top: -16px
        left: auto
        width: 100%
        height: auto
        grid-column: 1 / -1

    &__header
        height: min-content
        display: flex
        justify-content: space-between
        align-items: center
        margin: 1rem 1rem

    &__body
        margin: 12px 24px
        height: 100%
        overflow: auto
        padding-bottom: 2rem
        overflow-x: hidden
</style>
