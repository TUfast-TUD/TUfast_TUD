<template>
    <div class="setting">
        <Toggle
            @click="$emit('changedSetting')"
            v-model="toggleState"
            :disabled="disabled"
            class="setting__toggle" 
        />
            <slot />
            <span class="max-line">{{ txt }}</span>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue'

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
    },
    setup(props, { emit }) {
        const toggleState = ref(false)

        watch(props, () => toggleState.value = props.modelValue)

        watch(toggleState, () => emit("update:modelValue", toggleState.value))

        return { toggleState }
    },
})
</script>


<style lang="sass" scoped>
.setting
    display: flex
    align-items: center
    margin: 1.5rem 0

    &__toggle
      margin-right: 1rem  
</style>