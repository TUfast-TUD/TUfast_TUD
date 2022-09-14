<template>
  <h1 class="upper">
    TU Dresden E-Mail
  </h1>
  <div class="info">
    <Setting
      v-model="messagesActive"
      txt="Anzahl neuer Nachrichten anzeigen"
      :column="true"
    />
    <Setting
      v-model="notificationsActive"
      :disabled="!messagesActive"
      txt="Benachrichtigung bei neuer E-Mail"
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
    const { owa } = useSettingHandler()
    const messagesActive = ref(false)
    const notificationsActive = ref(false)

    const messages = async () => {
      if (messagesActive.value) { messagesActive.value = await owa('enable', 'fetch') as boolean } else {
        owa('disable', 'fetch')
        notificationsActive.value = false
      }
    }

    const notifications = async () => {
      if (notificationsActive.value) { messagesActive.value = await owa('enable', 'notification') as boolean } else { owa('disable', 'notification') }
    }

    watch(messagesActive, messages, { immediate: true })
    watch(notificationsActive, notifications, { immediate: true })

    return {
      messagesActive,
      notificationsActive,
      messages,
      notifications
    }
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
