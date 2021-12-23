<template>
    <div class="setting">
        <Toggle class="setting__toggle" /><span class="max-line">{{ txt }}</span>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

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
    },
    setup() {  
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