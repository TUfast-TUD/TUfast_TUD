<template>
  <p v-show="!autoLoginActive" class="msg p-margin max-line">
    Du musst im Reiter "Automatisches Anmelden" deinen Login hinterlegt haben, um diese Funktion nutzen zu können.
  </p>
  <Setting
    v-model="owaFetchActive"
    :disabled="!autoLoginActive || owaCbDisabled"
    txt="TUfast zeigt die Anzahl deiner ungelesenen Mails im TU-Dresden-Postfach (OWA) als kleines Icon oben rechts neben der Rakete an."
  />
  <div class="example-row">
    <img class="icon" src="../../../assets/images/UnreadMails0.png" /><span>keine neuen Mails</span>
  </div>
  <div class="example-row">
    <img class="icon" src="../../../assets/images/UnreadMails5.png" /><span>5 neue Mails</span>
  </div>
  <div class="example-row">
    <img class="icon" src="../../../assets/images/UnreadMails16.png" /><span>16 neue Mails</span>
  </div>

  <p class="max-line">
    Das Abrufen der Anzahl deiner ungelesenen Mails kann bis zu 5 Minuten dauern. Weil TUfast dafür eine spezielle
    Berechtigung braucht, drücke bitte auf "Erlauben" im folgenden Pop-Up.
  </p>

  <Setting
    v-model="notificationOnNewEmailActive"
    :disabled="!autoLoginActive || !owaFetchActive || notificationsCbDisabled"
    txt="Zusätzlich eine Pop-Up Benachrichtigung beim Eingang einer neuen Mail erhalten."
  />

  <p class="max-line">
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

.example-row
    display: flex
    align-items: center
    margin: .5rem 0

.setting
    display: flex
    align-items: center
    margin: 1.5rem 0

    &__toggle
      margin-right: 1rem

.msg
    font-weight: 600
    color: hsl(var(--clr-alert) )
</style>
