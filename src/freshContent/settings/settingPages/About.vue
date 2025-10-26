<template>
  <h3 class="card-body-title">Warum muss Online Studieren so kompliziert sein?</h3>
  <p class="p-margin max-line">
    An der TU Dresden jonglieren wir täglich mit OPAL, Selma, Hisqis oder Outlook und verlieren dabei Zeit und Nerven.
    Also haben wir uns gefragt: Geht das nicht einfacher? Aus dieser Frage entstand TUfast. Zuerst als kleines
    Nebenprojekt im Studium, dann als wachsende Plattform, die schnell immer mehr Studierende erreichte. Was mit ein
    paar Zeilen Code begann, wurde zu einer gemeinsamen Mission: den digitalen Studienalltag an der TU Dresden leichter
    zu machen.
    <br /><br />
    Heute ist TUfast ein Open-Source-Projekt von Studierenden und Alumni der TU Dresden. Es wird von über 4000
    Studierenden an der TU Dresden genutzt. Alle die am Projekt mitwirken, tun das ehrenamtlich und mit dem Wunsch
    anderen Studierenden, die Online Lehre ein Stück leichter zu machen.
    <br /><br />
    Unterstützt wird das Projekt unter anderem vom
    <span class="txt-bold">DigitalAcceleratorProgramm des Stifterverbands</span>, der
    <span class="txt-bold">output.dd Projektschau</span> der Informatik-Fakultät,
    <span class="txt-bold">Fachschaftsräten</span> der TU Dresden sowie netten Sponsoren und Sponsorinnen auf
    <a href="https://www.buymeacoffee.com/olihausdoerfer" target="_blank">BuyMeACoffee</a>. Am Ziel sind wir noch nicht:
    Unser nächster Schritt ist es, TUfast weiter auszubauen – für die TU Dresden, für andere Hochschulen in Sachsen und
    für alle, die in der digitalen Lehre ein bisschen mehr Struktur und Leichtigkeit brauchen. <br /><br />
    <span class="txt-bold">Von Studierenden, für Studierende. Kostenlos und Open Source.</span>
  </p>
  <br />
  <div class="social-section">
    <a href="https://www.tu-fast.de" target="_blank" class="social-section__button">Website</a>
    <a href="https://www.tu-fast.de/team" target="_blank" class="social-section__button">Team</a>
    <a href="https://github.com/OliEfr/TUfast_TUD" target="_blank" class="social-section__button">GitHub</a>
  </div>
  <br />

  <p class="p-margin max-line txt-help">
    <span class="txt-help txt-bold">So berechnen sich die gesparten Klicks:</span><br />
    Ein gesparter Klick = 3 Sekunden<br />
    Einen Shortcut verwenden = 2 gesparte Klicks<br />
    Eine automatische Anmeldung = 3 gesparte Klicks<br />
    Einen Kurs über Dashboard aufrufen = 3 gesparte Klicks<br />
    Eine Weiterleitung der Google-Suche = 2 gesparte Klicks
  </p>

  <p class="p-margin max-line txt-help">
    <span class="txt-help txt-bold">TUfast TU Dresden – {{ version }}</span
    ><br />
    TUfast wird entwickelt von:<br />
    <a class="dev-link" href="https://github.com/A-K-O-R-A" target="_blank">AKORA</a><br />
    <a class="dev-link" href="https://github.com/t0mbrn" target="_blank">Tom Braun</a><br />
    <a class="dev-link" href="https://fugi.dev/" target="_blank">Fugi</a><br />
    <a class="dev-link" href="https://github.com/Noxdor" target="_blank">Lennart Guderian</a><br />
    <a class="dev-link" href="https://github.com/OliEfr" target="_blank">Oliver Hausdörfer</a><br />
    <a class="dev-link" href="https://github.com/C0ntroller" target="_blank">Daniel Kluge</a><br />
    <a style="pointer-events: none" class="dev-link" href="#" target="_blank">Jan Polzer</a><br />
    <a class="dev-link" href="https://github.com/thomsste" target="_blank">Steen Thomsen</a>
  </p>

  <p class="p-margin max-line txt-help">
    <span class="txt-help txt-bold">Open Source & Lizenzen</span><br />
    Font: Space Grotesk, 2020. The Space Grotesk Project Authors, Florian Karsten, SIL Open Font License.<br />
    Icons: Tabler Icons, Copyright (c) 2018-2025 Tabler, MIT License<br />
  </p>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    const manifest = chrome.runtime.getManifest()
    const version = ref(manifest.version)

    return {
      version
    }
  }
})
</script>

<style lang="sass" scoped>
.dev-link
  color: inherit
  text-decoration: underline !important

.social-section
  display: flex
  gap: 12px

.social-section__button
  display: inline-block
  padding: 10px 20px
  background-color: hsl(var(--clr-btnhov))
  border-radius: var(--brd-rad)
  text-decoration: none
  color: hsl(var(--clr-text))
  transition: background-color 200ms ease-in-out

  &:hover
    background-color: hsl(var(--clr-btnhov2))
</style>
