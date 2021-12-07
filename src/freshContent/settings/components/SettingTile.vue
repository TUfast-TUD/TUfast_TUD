<template>
    <div class="settings-tile">
        <component :is="icon" color="hsl(var(--clr-primary) )" size="2rem" />
        <h2 class="title">{{ title }}</h2>    
    </div>    
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
    props: {
        icon: {
            type: String as PropType<string>,
            required: true,
        },
        title: {
            type: String as PropType<string>,
            required: true,
        },
    },
    setup() {

    },
})
</script>

<style lang="sass" scoped>
.settings-tile
    background-color: hsl(var(--clr-black) )
    border-radius: 40px

    display: flex
    flex-direction: column
    justify-content: center
    align-items: center
    text-align: center

    min-height: 250px
    min-width: 250px
    height: 280px
    width: 280px

</style>