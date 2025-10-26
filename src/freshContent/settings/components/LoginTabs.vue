<template>
  <div ref="container" class="container">
    <button
      v-for="(option, i) in options"
      :id="option.id"
      :key="i"
      :class="`${i === 0 ? 'tab--selected' : ''} tab`"
      @click="switchTab(option)"
    >
      {{ option.name }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import type { Login } from '../types/Login'

export default defineComponent({
  components: {},
  props: {
    options: {
      type: [] as PropType<Login[]>,
      required: true
    },
    modelValue: {
      type: {} as PropType<Login>,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup(_, { emit }) {
    const container = ref<HTMLDivElement | null>(null)

    const switchTab = (option: Login) => {
      if (!container.value) return
      const children = container.value.children

      for (const child of [...children]) {
        child.classList.remove('tab--selected')
        if (child.id === option.id) {
          child.classList.add('tab--selected')
        }
      }

      emit('update:modelValue', option)
    }

    return {
      switchTab,
      container
    }
  }
})
</script>

<style lang="sass" scoped>
.container
  display: flex
  align-items: start
  gap: .2rem
  height: 50px
  font-size: 1.4rem

.tab
  border: none
  background-color: hsl(var(--clr-secondary), .8)
  color: hsl(var(--clr-text))
  cursor: pointer
  border-bottom: 1px solid hsl(var(--clr-secondary), .5)
  opacity: .6

  &:hover
    opacity: .8
    background-color: hsl(var(--clr-btnhov))

  &--selected
    border-bottom: 2px solid hsl(var(--clr-accent))
    opacity: 1
</style>
