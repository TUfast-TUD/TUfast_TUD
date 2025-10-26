<template>
  <p class="txt-help txt-center">
    TUfast ist jetzt vollständig für dich eingerichtet.<br />Hier noch ein paar Tipps für dich:
  </p>
  <div class="onboarding-inner-info">
    <div class="done-tips__list">
      <div class="done-tips__list-item">
        <IconSettings class="done-tips__icons" size="32px" /><span class="done-tips__text"
          >Du kannst die getroffenen Einstellungen jederzeit ändern</span
        >
      </div>
      <div class="done-tips__list-item">
        <IconList class="done-tips__icons" size="32px" /><span class="done-tips__text"
          >Füge deine OPAL Kurse im Dashboard hinzu</span
        >
      </div>
      <div class="done-tips__list-item">
        <IconMail class="done-tips__icons" size="32px" /><span class="done-tips__text"
          >Bei Fragen oder Ideen zu TUfast, kontaktiere uns gerne! Unsere Kontaktdaten findest du auf der nächsten Seite
          unten.</span
        >
      </div>
      <div class="done-tips__list-item">
        <IconConfetti class="done-tips__icons" size="32px" /><span class="done-tips__text"
          >Viel Erfolg im Studium!</span
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="sass" scoped>
.onboarding-inner-info
    justify-content: center !important
    align-items: center !important
    display: flex !important
    margin-top: 16px

:deep(.onboarding-hide)
    display: none !important

.done-tips
  &__list
    display: flex
    flex-direction: column
    gap: 16px
    width: 80%

  &__list-item
    display: flex
    align-items: center
    gap: 8px

  &__icons
    flex-shrink: 0
    color: hsl(var(--clr-accent))

  &__text
    flex: 1
    // Add any text styling here if needed

a
    color: hsl(var(--clr-text))
    text-decoration: underline
</style>
