<template>
    <div class="title">
        <h1 class="upper">AutoLogin</h1>
        <h2>in die Onlineportale der TU Dresden</h2>
    </div>
    <Setting @click="emitAccept()" v-model="accept" txt="Dafür Login zu Opal und co. verschlüsselt & lokal speichern?" :column="true" />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from '@vue/runtime-core'
import Onboarding from '../components/Onboarding.vue'
import Setting from '../components/Setting.vue'

export default defineComponent({
    components: {
    Onboarding,
    Setting,
},
    setup(_, { emit }) {
      const accept = ref(false)

      const emitAccept = () => {
          console.log(accept.value)
          emit("accept", { value: accept.value })
      }

      onMounted(() => {
          emit("accept", { value: accept.value })
        })

      return { accept, emitAccept }
    },
})

</script>

<style lang="sass" scoped>
.title
    display: flex
    flex-direction: column
    align-items: center
.info
    margin-top: .8rem
    width: 70%
    display: flex
    justify-content: space-between
    align-items: center
</style>
