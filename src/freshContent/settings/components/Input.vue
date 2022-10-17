<template>
  <div class="input-container">
    <div :class="`input ${state}`">
      <input
        :value="modelValue"
        class="input__input"
        :type="type"
        :placeholder="placeholder"
        @input="emitState"
      >
      <component
        :is="statusIcon"
        :class="`input__icon ${
          modelValue.length > 0 ? 'input__icon--visible' : ''
        }`"
      />
    </div>
    <span
      :style="`opacity: ${!correctPattern && modelValue.length > 0 ? 1 : 0}`"
    >{{ errorMessage }}</span>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  PropType,
  computed,
  onMounted,
  watchEffect
} from 'vue'
import {
  PhXCircle,
  PhCheckCircle,
  PhWarningCircle
} from '@dnlsndr/vue-phosphor-icons'

export default defineComponent({
  components: {
    PhXCircle,
    PhCheckCircle,
    PhWarningCircle
  },
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
    }
  },
  emits: ['update:modelValue', 'update:valid'],
  setup (props, { emit }) {
    const statusIcon = ref('PhCheckCircle')
    const state = ref('')

    const correctPattern = computed(() => props.pattern.test(props.modelValue))

    const emitState = ($event: Event) => {
      const target = $event.target as HTMLInputElement
      emit('update:modelValue', target.value)
      emit('update:valid', correctPattern.value || props.warn)
    }

    watchEffect(() => {
      if (props.modelValue.length > 0) {
        state.value = correctPattern.value
          ? 'input--correct'
          : props.warn
            ? 'input--warn'
            : 'input--false'
        statusIcon.value = correctPattern.value
          ? 'PhCheckCircle'
          : props.warn
            ? 'PhWarningCircle'
            : 'PhXCircle'
        emit('update:valid', correctPattern.value || props.warn)
      } else {
        state.value = ''
      }
    })

    onMounted(() => {
      if (props.column) {
        document
          .querySelectorAll('.input-container')
          ?.forEach((el) => el.classList.add('input-container--column'))
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
    width: max-content
    gap: .8rem

    &--column
        flex-direction: column
        max-width: 100%

html:not(.light) .input-container--column
        & .input
            background-color: hsl(var(--clr-white))
            border: 1px solid hsl(var(--clr-black), .4)
            &__input
                color: hsl(var(--clr-black) )
                &::placeholder
                    color: hsl(var(--clr-black), .5)

.input
    display: flex
    justify-content: space-between
    align-items: center
    width: 300px
    height: 60px
    border-radius: 12px
    background-color: hsl(var(--clr-grey) )
    border: 1px solid hsl(var(--clr-state, var(--clr-grey)), .4)

    &--correct
        --clr-state: var(--clr-primary)
    &--warn
        --clr-state: var(--clr-warning)
    &--false
        --clr-state: var(--clr-alert)

    &:hover, &:focus-within
        border: 1px solid hsl(var(--clr-state, var(--clr-white)), .8)

    &::before
        content: ""
        width: 1px
        height: 50%
        background-color: hsl(var(--clr-state, var(--clr-grey)) )
        margin-left: .5rem

    &__input
        color: hsl(var(--clr-white) )
        background-color: inherit
        border: none
        margin: 0 .5rem
        height: 100%

        &:focus
            outline: none

        &::placeholder
            color: hsl(var(--clr-white), .5)

    &__icon
        height: 28px
        width: 28px
        color: hsl(var(--clr-state, var(--clr--grey)) )
        margin-right: .3rem
        opacity: 0
        &--visible
            opacity: 1

.light .input
    background-color: hsl(var(--clr-black) )
    color: hsl(var(--clr-white))
</style>
