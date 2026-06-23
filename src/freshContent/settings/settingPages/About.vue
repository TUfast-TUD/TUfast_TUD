<template>
  <h3 class="card-body-title">{{ strings.settings.pages.about.title }}</h3>
  <p class="p-margin max-line">
    {{ strings.settings.pages.about.intro1 }}
    <br /><br />
    {{ strings.settings.pages.about.intro2 }}
    <br /><br />
    {{ strings.settings.pages.about.supportersStart }}
    <a href="https://www.stifterverband.org/digitalchangemaker-accelerator" target="_blank" class="txt-link"
      >DigitalAcceleratorProgramm des Stifterverbands</a
    >,
    <a href="https://output-dd.de/blog/project-post/tufast-tu-dresden-2/" target="_blank" class="txt-link"
      >output.dd Projektschau</a
    >
    {{ strings.settings.pages.about.supportersEnd }}
    <a href="https://www.buymeacoffee.com/olihausdoerfer" target="_blank" class="txt-link">BuyMeACoffee</a>.
    {{ strings.settings.pages.about.nextStep }} <br /><br />
    <span class="txt-bold">{{ strings.settings.pages.about.claim }}</span>
  </p>
  <br />
  <div class="social-section">
    <a href="https://www.tu-fast.de" target="_blank" class="social-section__button">{{ strings.common.website }}</a>
    <a href="https://www.tu-fast.de/#team" target="_blank" class="social-section__button">{{ strings.common.team }}</a>
    <a href="https://github.com/OliEfr/TUfast_TUD" target="_blank" class="social-section__button">{{
      strings.common.github
    }}</a>
  </div>
  <br />

  <p class="p-margin max-line txt-help">
    <span class="txt-help txt-bold">{{ strings.settings.pages.about.clickCalcTitle }}</span
    ><br />
    {{ strings.settings.pages.about.clickCalcClick }}<br />
    {{ strings.settings.pages.about.clickCalcShortcut }}<br />
    {{ strings.settings.pages.about.clickCalcLogin }}<br />
    {{ strings.settings.pages.about.clickCalcCourse }}<br />
    {{ strings.settings.pages.about.clickCalcSearch }}
  </p>

  <p class="p-margin max-line txt-help">
    <span class="txt-help txt-bold">TUfast TU Dresden – {{ version }}</span
    ><br />
    {{ strings.settings.pages.about.developedBy }}<br />
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
    <span class="txt-help txt-bold">{{ strings.settings.pages.about.licenses }}</span
    ><br />
    {{ strings.settings.pages.about.fontLicense }}<br />
    {{ strings.settings.pages.about.iconLicense }}<br />
  </p>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { strings } from '../../../i18n'

export default defineComponent({
  setup() {
    const manifest = chrome.runtime.getManifest()
    const version = ref(manifest.version)

    return {
      version,
      strings
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
