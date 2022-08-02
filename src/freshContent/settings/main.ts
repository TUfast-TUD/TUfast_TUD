import { createApp } from "vue"
import Settings from "./Settings.vue"
import PhosphorVue from "phosphor-vue"


createApp(Settings)
    .use(PhosphorVue)
    .mount("#app")