<template>
    <h2 class="max-line">TUfast zeigt die Anzahl deiner ungelesenen Mails im TU-Dresden-Postfach (OWA) als kleines Icon oben rechts neben der Rakete an.</h2>
    <div class="example-row"><img class="icon" src="../../../assets/images/UnreadMails0.png"><span>keine neuen Mails</span></div>
    <div class="example-row"><img class="icon" src="../../../assets/images/UnreadMails5.png"><span>5 neue Mails</span></div>
    <div class="example-row"><img class="icon" src="../../../assets/images/UnreadMails16.png"><span>16 neue Mails</span></div>

    <p>Das Abrufen der Anzahl deiner ungelesenen Mails kann bis zu 5 Minuten dauern.
    Weil TUfast dafür eine spezielle Berechtigung braucht, drücke bitte auf "Erlauben" im folgenden Pop-Up.</p>

Aus  Ein

 Zusätzlich eine Pop-Up Benachrichtigung beim Eingang einer neuen Mail erhalten.

Für diese Funktion ruft TUfast die Anzahl deiner ungelesenen Mails vom Mail-Server der TU Dresden ab. Zum Anmelden werden deine Login-Daten verschlüsselt übertragen. Diese Verbindung ist sicher. Es funktioniert genauso, als würdest du deine Mails über den Browser abrufen.    
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    setup() {
        
    },
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
</style>