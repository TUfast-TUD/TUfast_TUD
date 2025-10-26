<template>
  <div class="tuf-settings-link">
    <div class="tuf-settings-link__icon">
      <Transition name="icon-fade" mode="out-in">
        <IconSun v-if="!isDark" key="sun" size="48px" />
        <IconMoon v-else key="moon" size="48px" />
      </Transition>
    </div>
    <div class="tuf-settings-link__title"><h2>Darstellung</h2></div>
    <div class="tuf-settings-link__toggle"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { IconSun, IconMoon } from '@tabler/icons-vue'

export default defineComponent({
  components: {
    IconSun,
    IconMoon
  },
  props: {
    animState: {
      type: String,
      default: 'light'
    }
  },
  setup(props) {
    const isDark = computed(() => props.animState === 'dark')

    return {
      isDark
    }
  }
})
</script>

<style lang="sass" scoped>


// Icon transition animations
.icon-fade-enter-active,
.icon-fade-leave-active
    transition: all 200ms ease

.icon-fade-enter-from
    opacity: 0
    transform: rotate(-90deg) scale(0.8)

.icon-fade-leave-to
    opacity: 0
    transform: rotate(90deg) scale(0.8)

.icon-fade-enter-to,
.icon-fade-leave-from
    opacity: 1
    transform: rotate(0deg) scale(1)
</style>
