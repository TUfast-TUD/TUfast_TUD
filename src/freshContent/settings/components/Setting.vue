<template>
  <div class="setting">
    <Toggle v-model="toggleState" :disabled="disabled" class="setting__toggle" @click="$emit('changed-setting')" />
    <span class="setting-text max-line">{{ txt }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref, watch } from 'vue'

import Toggle from './Toggle.vue'

export default defineComponent({
  components: {
    Toggle
  },
  props: {
    txt: {
      type: String as PropType<string>,
      required: true
    },
    modelValue: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    column: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  },
  emits: ['update:modelValue', 'changed-setting'],
  setup(props, { emit }) {
    const toggleState = ref(props.modelValue)

    watch(props, () => {
      toggleState.value = props.modelValue
    })

    watch(toggleState, () => emit('update:modelValue', toggleState.value))

    onMounted(() => {
      if (props.column) {
        document.querySelectorAll('.setting')?.forEach((el) => el.classList.add('setting--column'))
      }
    })

    return { toggleState }
  }
})
</script>

<style lang="sass" scoped>
.setting
  display: flex
  align-items: center
  gap: 1rem
  margin-top: 8px
  margin-bottom: 8px
  margin-left: 16px

  &--column
    flex-direction: column
    font-size: 1.4rem

  &--column &__toggle
    margin-right: 0
    width: 80px
    height: 80px

  &--column span
    text-align: center

.light
    & .setting--column .setting__toggle
        background-color: hsl(var(--clr-backgr), )
</style>
