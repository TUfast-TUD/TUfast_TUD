<template>
  <p class="txt-help txt-center">{{ smartSearchStrings.onboardingIntro }}</p>
  <p class="txt-help txt-center">{{ smartSearchStrings.onboardingPrivacy }}</p>
  <div class="onboarding-inner-info">
    <OpalSmartSearch onboarding />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

// components
import OpalSmartSearch from '../settingPages/OpalSmartSearch.vue'

// configurations
import { OPAL_SMART_SEARCH_STRINGS } from '../../../modules/opalSmartSearch/strings'

export default defineComponent({
  components: {
    OpalSmartSearch
  },
  setup() {
    return {
      smartSearchStrings: OPAL_SMART_SEARCH_STRINGS
    }
  }
})
</script>

<style lang="sass" scoped>
:deep(.onboarding-hide)
    display: none !important

.onboarding-inner-info
    margin-top: 8px
</style>
