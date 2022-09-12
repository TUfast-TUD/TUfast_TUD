<template>
  <div ref="container" class="container">
    <button 
      v-for="(option, i) in options"
      @click="switchTab(option)"
      :id="option.id"
      :class="`${i === 0 ? 'tab--selected' : ''} tab`"
    >{{ option.name }}</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import type { Login } from '../types/Login'

export default defineComponent({
  components: {
  },
  props: {
    options: [] as PropType<Login[]>,
    modelValue: {} as PropType<Login>,
  },
  setup(_, { emit }) {
    const container = ref<HTMLDivElement | null>(null)

    const switchTab = (option: Login) => {
      if (!container.value) return
      const children = container.value.children

      for (const child of [...children]) {
        child.classList.remove("tab--selected")
        if (child.id === option.id)
          child.classList.add("tab--selected")
      } 

      emit("update:modelValue", option)
    }

    return {
      switchTab,
      container,
    }

  },
})
</script>

<style lang="sass" scoped>
.container 
  display: flex
  align-items: start
  height: 50px

.tab
  border: none
  background-color: hsl(var(--clr-secondary), 0.8)
  color: white
  cursor: pointer

  &--selected
    border-bottom: 2px solid hsl(var(--clr-primary))
</style>

