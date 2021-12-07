<template>
    <div class="dropdown">
        <span class="dropdown__title txt-bold">Studiengang</span>
        <ph-caret-down
            color="hsl(var(--clr-primary) )"
            size="2rem" />
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
    props: {
        title: {
            type: String as PropType<string>,
            default: "Platzhalter"
        }
    },
    setup() {
        
    },
})
</script>

<style lang="sass" scoped>
.dropdown
    display: flex
    align-items: center
    height: min-content
    cursor: pointer

    &:hover &__title
        text-decoration: underline

</style>