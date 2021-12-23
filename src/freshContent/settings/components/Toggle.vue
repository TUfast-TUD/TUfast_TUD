<template>
    <div :class="`toggle ${toggled ? 'toggle--toggled' : ''}`" @click="toggled = !toggled">
        <ph-check v-show="toggled" class="toggle__icon" />    
    </div>    
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
    setup() {
        const toggled = ref(false)

        return {
            toggled,
        }
        
    },
})
</script>

<style lang="sass" scoped>
.toggle
    display: flex
    justify-content: center
    align-items: center
    background-color: hsl(var(--clr-white) )
    width: 40px
    height: 40px
    border-radius: 100%

    &:hover
        background-color: hsl(var(--clr-white), .8)
        cursor: pointer
        

    &--toggled
        background-color: hsl(var(--clr-primary) )
        &:hover
            background-color: hsl(var(--clr-primary), .8)

    &__icon
        width: 80%
        height: 80%



</style>