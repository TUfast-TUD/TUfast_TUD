<template>
  <h1 class="upper">
    E-Mail
  </h1>
  <div class="info">
    <Setting
      v-model="messagesActive"
      txt="Anzeigen Anzahl Nachrichten"
      :column="true"
      @changed-setting="messages()"
    />
    <Setting
      v-model="notificationsActive"
      txt="E-Mail-Benachrichtigungen"
      :column="true"
      @changed-setting="notifications()"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'

// components
// import Onboarding from '../components/Onboarding.vue'
import Setting from '../components/Setting.vue'

// composables
// import { useUserData } from '../composables/user-data'
import { useChrome } from '../composables/chrome'

export default defineComponent({
  components: {
    //    Onboarding,
    Setting
  },
  setup () {
    // const { saveUserData } = useUserData()
    const { sendChromeRuntimeMessage } = useChrome()
    const messagesActive = ref(false)
    const notificationsActive = ref(false)

    onMounted(async () => {
      if (await sendChromeRuntimeMessage({ cmd: 'check_user_data', platform: 'zih' })) {
        messagesActive.value = true
        notificationsActive.value = true
      }
    })
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
