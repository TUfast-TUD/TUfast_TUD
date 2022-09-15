<template>
  <Setting
    v-model="searchEngineActive"
    txt="Suchmaschinen Superpower aktivieren"
  />
  <p class="max-line p-margin">
    Gib z.B. "tumail" in der Google-Suche ein, um direkt zur Outlook-Web-App zu kommen. Es werden die meisten Suchmaschinen unterstützt!
  </p>

  <p class="search-terms">
    tumail → Outlook Web App<br>
    opal → OPAL<br>
    tucloud → Cloudstore TU Dresden<br>
    hisqis → Hisqis TU Dresden<br>
    selma → selma TU Dresden<br>
    jexam → jExam<br>
    tumatrix → Matrix-Chat TU Dresden<br>
    tumed → eportal.med.tu-dresden<br>
    slub → SLUB Dresden<br>
    magma → Magma TU Dresden<br>
    videocampus → Videocampus Sachsen
  </p>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref, watch } from 'vue'

// types
import type { ResponseSE } from '../types/SettingHandler'

// components
import Setting from '../components/Setting.vue'

// composables
import { useSettingHandler } from '../composables/setting-handler'

export default defineComponent({
  components: {
    Setting
  },
  setup () {
    const { se } = useSettingHandler()
    const searchEngineActive = ref(false)

    onBeforeMount(async () => {
      const { redirect } = await se("check", "redirect") as ResponseSE

      searchEngineActive.value = redirect

      watch(searchEngineActive, seUpdate)
    })

    const seUpdate = async () => {
      if (searchEngineActive.value)
        searchEngineActive.value = await se('enable', 'redirect') as boolean
      else
        se('disable', 'redirect')
    }

    return {
      searchEngineActive,
    }
  }
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
