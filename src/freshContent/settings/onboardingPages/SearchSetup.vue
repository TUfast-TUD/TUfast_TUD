<template>
        <h1 class="upper">Abkürzungen</h1>
        <div class="info">
            <p class="search-terms">tumail → Outlook Web App<br />
                OPAL → OPAL<br />
                tucloud → Cloudstore TU Dresden<br />
                hisqis → Hisqis TU Dresden<br />
                selma → selma TU Dresden<br />
                jexam → jExam<br />
                tumatrix → Matrix-Chat TU Dresden<br />
                magma → Magma TU Dresden<br />
                tumed → eportal.med.tu-dresden
            </p>
            <Setting
                txt="Abkürzungen aktivieren"
                :column="true"
                @changedSetting="searchEngine()"
                v-model="searchEngineActive"
            />
        </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/runtime-core'
import Onboarding from '../components/Onboarding.vue'
import Setting from '../components/Setting.vue'

export default defineComponent({
    components: {
    Onboarding,
    Setting,
},
    setup() {
        const searchEngineActive = ref(true)
        // chrome.storage.local.get(['fwdEnabled'], (res) => searchEngineActive.value = res.fwdEnabled)
        const searchEngine = () => chrome.storage.local.set({ fwdEnabled: !searchEngineActive.value }, () => {})
        searchEngine()
        console.log(searchEngineActive.value)

        return { searchEngine, searchEngineActive }

    },
})

</script>

<style lang="sass" scoped>
.info
    margin-top: .8rem
    width: 70%
    display: flex
    justify-content: space-between
    align-items: center
</style>
