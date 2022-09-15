<template>
  <h1 class="upper">
    Suchmaschinen-Superkräfte
  </h1>
  <div class="info">
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
    <Setting
      v-model="searchEngineActive"
      txt="Abkürzungen aktivieren"
      :column="true"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'

// components
import Setting from '../components/Setting.vue'

// composables
import { useSettingHandler } from '../composables/setting-handler'

export default defineComponent({
  components: {
    //    Onboarding,
    Setting
  },
  setup () {
    const { se } = useSettingHandler()

    const searchEngineActive = ref(true)

    const seUpdate = async () => {
      if (searchEngineActive.value)
        searchEngineActive.value = await se('enable', 'redirect') as boolean
      else
        se('disable', 'redirect')
    }

    watch(searchEngineActive, seUpdate, { immediate: true })


    return { searchEngineActive }
  }
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
