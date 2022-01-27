<template>
    <div class="setting">
        <Toggle
            @click="$emit('changedSetting')"
            v-model="toggleState"
            :disabled="disabled"
            class="setting__toggle" 
        />
            <span class="max-line">{{ txt }}</span>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref, watch } from 'vue'

import Toggle from './Toggle.vue'

export default defineComponent({
    components: {
        Toggle,
    },
    props: {
        txt: {
            type: String as PropType<string>,
            required: true,
        },
        modelValue: {
            type: Boolean as PropType<boolean>,
            default: false,
        },
        disabled: {
            type: Boolean as PropType<boolean>,
            default: false,
        },
        column: {
            type: Boolean as PropType<boolean>,
            default: false,
        }
    },
    setup(props, { emit }) {
        const toggleState = ref(false)
        const setting = ref

        watch(props, () => toggleState.value = props.modelValue)

        watch(toggleState, () => emit("update:modelValue", toggleState.value))

        onMounted(() => {
            if (props.column)
                document.querySelectorAll(".setting")?.forEach((el) => el.classList.add("setting--column"))
        })


        return { toggleState }
    },
})
</script>


<style lang="sass" scoped>
.setting
    display: flex
    align-items: center
    gap: 1.5rem

    &__toggle
      margin-right: 1rem 

    &--column
        flex-direction: column
        font-size: 1.4rem

    &--column &__toggle
        width: 80px
        height: 80px
</style>