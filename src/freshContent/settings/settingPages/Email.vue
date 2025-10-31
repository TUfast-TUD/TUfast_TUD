<template>
  <p v-show="!autoLoginActive" class="msg max-line">
    Du musst "Automatisches Anmelden" mit deinem Login einrichten, um diese Funktion nutzen zu können.
  </p>

  <h3 class="card-body-title onboarding-hide">Erhalte Benachrichtigungen, wenn du neue E-Mails erhältst</h3>
  <div style="display: flex; align-items: center; gap: 8px">
    <Setting
      v-model="owaFetchActive"
      :disabled="!autoLoginActive || owaCbDisabled"
      txt="Anzahl ungelesener Mails als Notification Bubble"
    />
    <img class="icon" src="../../../assets/images/UnreadMails16.png" />
  </div>

  <Setting
    v-model="notificationOnNewEmailActive"
    :disabled="!autoLoginActive || !owaFetchActive || notificationsCbDisabled"
    txt="Pop-Up Benachrichtigung beim Erhalt einer neuen Mail"
  />

  <p class="p-margin max-line">
    Das Abrufen der Anzahl deiner ungelesenen Mails kann bis zu 5 Minuten dauern. Weil TUfast dafür eine spezielle
    Berechtigung braucht, drücke bitte auf „Erlauben“ im folgenden Pop-Up.
  </p>

  <p class="p-margin max-line txt-help">
    Für diese Funktion ruft TUfast die Anzahl deiner ungelesenen Mails vom Mail-Server der TU Dresden ab. Zum Anmelden
    werden deine Login-Daten verschlüsselt übertragen. Diese Verbindung ist sicher. Es funktioniert genauso, als würdest
    du deine Mails über den Browser abrufen. Die Benachrichtigungen kommen über die Windows-API. Beachte, dass du unter
    Windows die entsprechende Funktion aktiviert haben musst.
  </p>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref, watch } from 'vue'

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
      autoLoginActive
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
