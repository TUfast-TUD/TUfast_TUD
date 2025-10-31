<template>
  <p class="txt-help txt-center">
    Wähle deine Fakultät aus. Dein Dashboard wird dann mit allen für dich relevanten Links eingerichtet.
  </p>
  <div class="onboarding-inner-info">
    <ChooseFaculty />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'

// components
import ChooseFaculty from '../settingPages/ChooseFaculty.vue'

// composables
import { useSettingHandler } from '../composables/setting-handler'

export default defineComponent({
  components: {
    ChooseFaculty
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
      ChooseFaculty
    }
  }
})
</script>

<style lang="sass" scoped>
.dropdown-list
    padding-right: 8px
</style>
