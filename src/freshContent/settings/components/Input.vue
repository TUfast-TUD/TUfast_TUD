<template>
  <div class="input-container">
    <div :class="`input ${state}`">
      <input
        :value="modelValue"
        class="input__input"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="emitState"
      />
      <component :is="statusIcon" :class="`input__icon ${modelValue.length > 0 ? 'input__icon--visible' : ''}`" />
    </div>
    <span :class="{ 'error-visible': !correctPattern && modelValue.length > 0 }" class="error-message">{{
      errorMessage
    }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, computed, onMounted, watchEffect } from 'vue'

export default defineComponent({
  props: {
    type: {
      type: String as PropType<string>,
      default: 'text'
    },
    placeholder: {
      type: String as PropType<string>,
      required: true
    },
    pattern: {
      type: Object as PropType<RegExp>,
      default: null
    },
    modelValue: {
      type: String as PropType<string>,
      default: ''
    },
    valid: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    errorMessage: {
      type: String as PropType<string>,
      required: true
    },
    column: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    warn: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  },
  emits: ['update:modelValue', 'update:valid'],
  setup(props, { emit }) {
    const statusIcon = ref('IconCircleCheck')
    const state = ref('')

    const correctPattern = computed(() => props.pattern.test(props.modelValue))

    const emitState = ($event: Event) => {
      const target = $event.target as HTMLInputElement
      emit('update:modelValue', target.value)
      emit('update:valid', correctPattern.value || props.warn)
    }

    watchEffect(() => {
      if (props.modelValue.length > 0) {
        state.value = correctPattern.value ? 'input--correct' : props.warn ? 'input--warn' : 'input--false'
        statusIcon.value = correctPattern.value ? 'IconCircleCheck' : props.warn ? 'IconAlertCircle' : 'IconCircleX'
        emit('update:valid', correctPattern.value || props.warn)
      } else {
        state.value = ''
      }
    })

    onMounted(() => {
      if (props.column) {
        document.querySelectorAll('.input-container')?.forEach((el) => el.classList.add('input-container--column'))
      }
    })

    return {
      statusIcon,
      correctPattern,
      emitState,
      state
    }
  }
})
</script>

<style lang="sass" scoped>
.input-container
    display: flex
    align-items: center
    min-height: 64px
    gap: 8px
    width: 100%
    min-width: 100%

    &--column
        flex-direction: column
        max-width: 100%

    @media screen and (max-width: 650px)
        flex-direction: column

    & span.error-message
        display: block
        min-width: 100%
        height: 0  // Default: no space
        word-wrap: break-word
        overflow-wrap: break-word
        visibility: hidden
        transition: height 200ms ease-in-out
        overflow: hidden

        &.error-visible
            visibility: visible
            height: fit-content  // Reserve space when visible

html:not(.light) .input-container--column
        & .input
            background-color: hsl(var(--clr-white))
            border: 1px solid hsl(var(--clr-backgr), .4)
            &__input
                color: hsl(var(--clr-backgr) )
                &::placeholder
                    color: hsl(var(--clr-backgr), .5)

.input
    display: flex
    justify-content: space-between
    align-items: center
    width: 300px
    height: 64px
    border-radius: var(--brd-rad)
    background-color: hsl(var(--clr-backgr))
    border: 3px solid hsl(var(--clr-state, var(--clr-backgr)))
    transition: all 200ms ease-in-out

    &--correct
        --clr-state: var(--clr-success)
    &--warn
        --clr-state: var(--clr-warning)
    &--false
        --clr-state: var(--clr-alert)

    &:hover, &:focus-within, &:focus
        outline: 3px solid hsl(var(--clr-focus))

    &::before
        content: ""
        width: 3px
        height: 50%
        background-color: hsl(var(--clr-state, var(--clr-text-help)) )
        margin-left: .5rem

    &:has(input:disabled)
        border: 3px solid hsl(var(--clr-success))
        background-color: hsl(var(--clr-success-bg))
        outline: none

    &__input
        color: hsl(var(--clr-text))
        background-color: inherit
        border: none
        margin: 0 .5rem
        height: 100%
        width: 242px

        &:focus
            outline: none

        &::placeholder
            color: (var(--clr-text-help))

        &:disabled
            cursor: not-allowed
            color: hsl(var(--clr-success))
            font-weight: 600
            &::placeholder
                color: hsl(var(--clr-success))

    &__icon
        height: 28px
        width: 28px
        color: hsl(var(--clr-state, var(--clr--grey)) )
        margin-right: .3rem
        opacity: 0
        &--visible
            opacity: 1
</style>
