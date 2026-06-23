<template>
  <p class="txt-help txt-center">{{ t('onboarding.pages.emailHelp') }}</p>
  <div class="onboarding-inner-info">
    <Email />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { t } from '../../../i18n'

// components
import Email from '../settingPages/Email.vue'

// composables
import { useSettingHandler } from '../composables/setting-handler'

export default defineComponent({
  components: {
    Email
  },
  setup() {
    const { owa } = useSettingHandler()
    const messagesActive = ref(false)
    const messageCbDisabled = ref(false)
    const notificationsActive = ref(false)
    const notificationsCbDisabled = ref(false)

    const messages = async () => {
      if (messagesActive.value) {
        messageCbDisabled.value = true
        notificationsCbDisabled.value = true
        messagesActive.value = (await owa('enable', 'fetch')) as boolean
        messageCbDisabled.value = false
        notificationsCbDisabled.value = false
      } else {
        await owa('disable', 'fetch')
        notificationsActive.value = false
      }
    }

    const notifications = async () => {
      if (notificationsActive.value) {
        messageCbDisabled.value = true
        notificationsCbDisabled.value = true
        notificationsActive.value = (await owa('enable', 'notification')) as boolean
        messageCbDisabled.value = false
        notificationsCbDisabled.value = false
      } else {
        await owa('disable', 'notification')
      }
    }

    watch(messagesActive, messages, { immediate: true })
    watch(notificationsActive, notifications, { immediate: true })

    return {
      messagesActive,
      messageCbDisabled,
      notificationsActive,
      notificationsCbDisabled,
      messages,
      notifications,
      Email,
      t
    }
  }
})
</script>

<style lang="sass" scoped>
:deep(.onboarding-hide)
    display: none !important
</style>
