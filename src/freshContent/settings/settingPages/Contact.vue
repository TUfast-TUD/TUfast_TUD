<template>
  <p class="p-margin">
    Hey, wir sind dein TUfast-Team 🙂<br>
    TUfast ist ein quelloffenes und studentisches Projekt.<br>
    Fragen und Feedback gern an <a
      class="link"
      href="mailto:frage@tu-fast.de?Subject=Feedback TUfast"
    >frage@tu-fast.de</a>
  </p>

  <p class="p-margin">
    Du findest uns auch auf der TUfast <a
      class="link"
      href="https://www.tu-fast.de"
      target="_blank"
    >Website</a>. Der Quelltext ist Open Source auf <a
      class="link"
      href="https://github.com/OliEfr/TUfast_TUD"
      target="_blank"
    >GitHub</a>.<br>
    Wir sind verpflichtet eine <a
      class="link"
      href="https://docs.google.com/document/d/1m3LCzlRMlEUR_TbMgP7Ha7MA7jN9mJ6gfyRhCRfUxuM/edit?usp=sharing"
      target="_blank"
    >Datenschutzerklärung</a> zu veröffentlichen.
  </p>

  <p class="p-margin">
    TUfast wird aktuell hauptsächlich entwickelt von:
    <a
      class="link"
      href="https://github.com/C0ntroller"
      target="_blank"
    >Daniel</a>,
    <a
      class="link"
      href="https://github.com/Noxdor"
      target="_blank"
    >Noxdor</a>,
    <a
      class="link"
      href="https://github.com/FugiMuffi"
      target="_blank"
    >Lucas</a>,
    <a
      class="link"
      href="https://github.com/OliEfr"
      target="_blank"
    >Oli</a>!
  </p>

  <h3 class="heading">
    So berechnen sich die gesparten Klicks:
  </h3>
  <p>
    Ein gesparter Klick = 3 Sekunden<br>
    Einen Shortcut verwenden = 2 gesparte Klicks<br>
    Eine automatische Anmeldung = 3 gesparte Klicks<br>
    Einen Kurs über Dashboard aufrufen = 3 gesparte Klicks<br>
    Eine Weiterleitung der Google-Suche = 2 gesparte Klicks
  </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  setup () {

  }
})
</script>

<style lang="sass" scoped>
.link
    text-decoration: none
    color: hsl(var(--clr-primary))

.heading
    font-weight: 600
    margin-bottom: .3rem
</style>
