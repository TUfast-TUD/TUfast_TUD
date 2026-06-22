<template>
  <p v-show="!autoLoginActive" class="msg max-line">{{ t('settings.pages.email.needsLogin') }}</p>

  <h3 class="card-body-title onboarding-hide">{{ t('settings.pages.email.title') }}</h3>
  <div style="display: flex; align-items: center; gap: 8px">
    <Setting
      v-model="owaFetchActive"
      :disabled="!autoLoginActive || owaCbDisabled"
      :txt="t('settings.pages.email.fetchToggle')"
    />
    <img class="icon" src="../../../assets/images/UnreadMails16.png" />
  </div>

  <Setting
    v-model="notificationOnNewEmailActive"
    :disabled="!autoLoginActive || !owaFetchActive || notificationsCbDisabled"
    :txt="t('settings.pages.email.notificationToggle')"
  />

  <p class="p-margin max-line">{{ t('settings.pages.email.permission') }}</p>

  <p class="p-margin max-line txt-help">{{ t('settings.pages.email.help') }}</p>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref, watch } from 'vue'
import { t } from '../../../i18n'

// types
import type { ResponseOWA } from '../types/SettingHandler'

// components
import Setting from '../components/Setting.vue'

// composables
import { useChrome } from '../composables/chrome'
import { useSettingHandler } from '../composables/setting-handler'

export default defineComponent({
  components: {
    Setting
  },
  setup() {
    const { sendChromeRuntimeMessage } = useChrome()
    const { owa } = useSettingHandler()
    const owaFetchActive = ref(false)
    const owaCbDisabled = ref(false)
    const notificationOnNewEmailActive = ref(false)
    const notificationsCbDisabled = ref(false)
    const autoLoginActive = ref(false)

    onBeforeMount(async () => {
      const { fetch, notification } = (await owa('check')) as ResponseOWA

      owaFetchActive.value = fetch
      notificationOnNewEmailActive.value = notification

      watch(owaFetchActive, fetchUpdate)
      watch(notificationOnNewEmailActive, notificationsUpdate)

      autoLoginActive.value = (await sendChromeRuntimeMessage({ cmd: 'check_user_data', platform: 'zih' })) as boolean
    })

    const fetchUpdate = async () => {
      if (owaFetchActive.value) {
        owaCbDisabled.value = true
        notificationsCbDisabled.value = true
        owaFetchActive.value = (await owa('enable', 'fetch')) as boolean
        owaCbDisabled.value = false
        notificationsCbDisabled.value = false
      } else {
        await owa('disable', 'fetch')
        notificationOnNewEmailActive.value = false
      }
    }

    const notificationsUpdate = async () => {
      if (notificationOnNewEmailActive.value) {
        owaCbDisabled.value = true
        notificationsCbDisabled.value = true
        notificationOnNewEmailActive.value = (await owa('enable', 'notification')) as boolean
        owaCbDisabled.value = false
        notificationsCbDisabled.value = false
      } else {
        await owa('disable', 'notification')
      }
    }

    return {
      owaFetchActive,
      owaCbDisabled,
      notificationOnNewEmailActive,
      notificationsCbDisabled,
      autoLoginActive,
      t
    }
  }
})
</script>

<style lang="sass" scoped>
.icon
    filter: invert(100%)
    display: inline-block

    .light &
        filter: invert(0%)
</style>
