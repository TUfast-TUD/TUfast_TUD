<template>
    <Setting txt="Suchmaschinen Superpower aktivieren" />
    <p class="max-line p-margin">Gib z.B. "tumail" in der Google-Suche ein, um direkt zur Outlook-Web-App zu kommen. Es werden die meisten Suchmaschinen unterstützt!</p>

    <p class="search-terms">tumail → Outlook Web App<br />
    OPAL → OPAL<br />
    tucloud → Cloudstore TU Dresden<br />
    hisqis → Hisqis TU Dresden<br />
    selma → selma TU Dresden<br />
    jexam → jExam<br />
    tumatrix → Matrix-Chat TU Dresden<br />
    magma → Magma TU Dresden<br />
    tumed → eportal.med.tu-dresden</p>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Setting from '../components/Setting.vue'

export default defineComponent({
    components: {
        Setting,
    },
    setup() {
        
    },
})
</script>

<style lang="sass" scoped>
.search-terms
    line-height: 1.75
    margin-left: 1rem
    color: hsl(var(--clr-white), .7)
</style>