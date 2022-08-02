<template>
    <Setting
        @changedSetting="searchEngine()"
        v-model="searchEngineActive"
        txt="Suchmaschinen Superpower aktivieren"
    />
    <p class="max-line p-margin">Gib z.B. "tumail" in der Google-Suche ein, um direkt zur Outlook-Web-App zu kommen. Es werden die meisten Suchmaschinen unterstützt!</p>

    <p class="search-terms">
        tumail → Outlook Web App<br />
        opal → OPAL<br />
        tucloud → Cloudstore TU Dresden<br />
        hisqis → Hisqis TU Dresden<br />
        selma → selma TU Dresden<br />
        jexam → jExam<br />
        tumatrix → Matrix-Chat TU Dresden<br />
        tumed → eportal.med.tu-dresden<br />
        slub → SLUB Dresden<br />
        videocampus → Videocampus Sachsen
    </p>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

import Setting from '../components/Setting.vue'

export default defineComponent({
    components: {
        Setting,
    },
    setup() {
        const searchEngineActive = ref(false)
        chrome.storage.local.get(['fwdEnabled'], (res) => searchEngineActive.value = res.fwdEnabled)
        const searchEngine = () => chrome.storage.local.set({ fwdEnabled: !searchEngineActive.value }, () => {})

        return {
            searchEngine,
            searchEngineActive,
        }
    },
})
</script>

<style lang="sass" scoped>
.search-terms
    line-height: 1.75
    margin-left: 1rem
    color: hsl(var(--clr-white), .7)

    @media (prefers-color-scheme: light)
        color: hsl(var(--clr-grey), .9)
</style>
