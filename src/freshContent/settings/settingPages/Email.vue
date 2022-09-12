<template>
  <p
    v-show="!autoLoginActive"
    class="msg p-margin max-line"
  >
    Du musst im Reiter "Automatisches Anmelden" deinen Login hinterlegt haben, um diese Funktion nutzen zu können.
  </p>
  <Setting
    v-model="OWAFetchActive"
    :disabled="!autoLoginActive"
    txt="TUfast zeigt die Anzahl deiner ungelesenen Mails im TU-Dresden-Postfach (OWA) als kleines Icon oben rechts neben der Rakete an."
    @changed-setting="updateOWAFetch()"
  />
  <div class="example-row">
    <img
      class="icon"
      src="../../../assets/images/UnreadMails0.png"
    ><span>keine neuen Mails</span>
  </div>
  <div class="example-row">
    <img
      class="icon"
      src="../../../assets/images/UnreadMails5.png"
    ><span>5 neue Mails</span>
  </div>
  <div class="example-row">
    <img
      class="icon"
      src="../../../assets/images/UnreadMails16.png"
    ><span>16 neue Mails</span>
  </div>

  <p
    class="max-line"
    @click="OWAFetchActive = !OWAFetchActive"
  >
    Das Abrufen der Anzahl deiner ungelesenen Mails kann bis zu 5 Minuten dauern.
    Weil TUfast dafür eine spezielle Berechtigung braucht, drücke bitte auf "Erlauben" im folgenden Pop-Up.
  </p>

  <Setting
    v-model="notificationOnNewEmailActive"
    :disabled="!autoLoginActive || !OWAFetchActive"
    txt="Zusätzlich eine Pop-Up Benachrichtigung beim Eingang einer neuen Mail erhalten."
    @changed-setting="updateAdditionalNotification()"
  />

  <p class="max-line">
    Für diese Funktion ruft TUfast die Anzahl deiner ungelesenen Mails vom Mail-Server der TU Dresden ab.
    Zum Anmelden werden deine Login-Daten verschlüsselt übertragen. Diese Verbindung ist sicher.
    Es funktioniert genauso, als würdest du deine Mails über den Browser abrufen.
  </p>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import Setting from '../components/Setting.vue'

export default defineComponent({
  components: {
    Setting
  },
  setup () {
    const OWAFetchActive = ref(false)
    const notificationOnNewEmailActive = ref(false)
    const autoLoginActive = ref(false)

    chrome.storage.local.get(['enabledOWAFetch', 'additionalNotificationOnNewMail'], (res) => {
      OWAFetchActive.value = res.enabledOWAFetch
      notificationOnNewEmailActive.value = res.additionalNotificationOnNewMail
    })
    chrome.storage.local.get(['isEnabled'], (res) => { autoLoginActive.value = res.isEnabled })

    const updateOWAFetch = () => {
      if (!autoLoginActive.value) return

      if (!OWAFetchActive.value) {
        chrome.runtime.sendMessage({ cmd: 'enable_owa_fetch' })
        chrome.storage.local.set({ enabledOWAFetch: true })
        // reload extension
        // alert("Perfekt! Bitte starte den Browser einmal neu, damit die Einstellungen übernommen werden!")
        // chrome.runtime.sendMessage({ cmd: "reload_extension" }, () => {})
      }
      if (OWAFetchActive.value) {
        chrome.runtime.sendMessage({ cmd: 'disable_owa_fetch' })
        chrome.storage.local.set({ enabledOWAFetch: false })
        chrome.storage.local.set({ additionalNotificationOnNewMail: false })
        OWAFetchActive.value = !OWAFetchActive.value
        notificationOnNewEmailActive.value = false
      }
    }

    const updateAdditionalNotification = () => {
      if (!autoLoginActive.value || !OWAFetchActive.value) return

      if (!notificationOnNewEmailActive.value) {
        chrome.permissions.request({ permissions: ['notifications'] }, (granted) => {
          if (granted) {
            chrome.runtime.sendMessage({ cmd: 'owa_notifications_enabled' })
            chrome.storage.local.set({ additionalNotificationOnNewMail: true })
          } else {
            alert('Du musst die Erlaubnis erteilen, um diese Funktion nutzen zu können!')
          }
        })
      } else {
        chrome.storage.local.remove(['additionalNotificationOnNewMail'])
      }

      notificationOnNewEmailActive.value = !notificationOnNewEmailActive.value
    }

    return {
      OWAFetchActive,
      notificationOnNewEmailActive,
      autoLoginActive,
      updateOWAFetch,
      updateAdditionalNotification
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
