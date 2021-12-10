<template>
    <div>
        <lottie-player
            ref="anim"
            src="../../assets/settings/theme_lottie.json"
            background="transparent"
            speed="1"
            style="width: 150px; height: 150px;"
            loop
            :direction="direction"
            @click="play()"
            ></lottie-player>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue"
import "@lottiefiles/lottie-player"
import animation from "../../../assets/settings/theme_lottie.json"

export default defineComponent({
    setup() {
        const anim : any = ref(null)

        const direction = ref(-1)

        onMounted(() => {
            setTimeout(() => {
                anim.value.seek("98%")
            }, 0);
        })

        const play = () => anim.value.play()

        return {
            anim,
            animation,
            direction,
            play,
        }
    },
})
</script>
