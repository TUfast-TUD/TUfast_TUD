<template>
    <p class="max-line">Damit die Einstellungen wirksam werden, musst du OPAL einmal aktualisieren. Für Firefox funktioniert dieses Feature leider nicht stabil.</p>
    <p class="max-line p-margin">Möglicherweise braucht TUfast eine spezielle Berechtigung. Drücke bitte auf "Erlauben" im folgenden Pop-Up.</p>

    <Setting
        @changedSetting="pdfInline()"
        v-model="pdfInlineActive"
        txt="PDF-Dokumente aus OPAL direkt im Browser öffnen, anstatt sie herunterzuladen."
    />
    <Setting
        :disabled="!pdfInlineActive"
        @changedSetting="pdfNewTab()"
        v-model="pdfNewTabActive"
        txt="PDF-Dokumente in neuem Tab öffnen (empfohlen!)"
    />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import Toggle from '../components/Toggle.vue'
import Setting from '../components/Setting.vue'

export default defineComponent({
    components: { Setting, Toggle },
    setup() {
        const pdfInlineActive = ref(false)
        const pdfNewTabActive = ref(false)

        chrome.storage.local.get(["pdfInInline", "pdfInNewTab"], (res) => {
            pdfInlineActive.value = res.pdfInInline
            pdfNewTabActive.value = res.pdfInNewTab
        })

        const pdfInline = () => {
            chrome.storage.local.set({ pdfInInline: !pdfInlineActive.value }, () => {})
            if (!pdfInlineActive.value) {
                chrome.permissions.request({ permissions: ["webRequest", "webRequestBlocking"], origins: ["https://bildungsportal.sachsen.de/opal/*"] }, (granted) => {
                    if (granted) {
                        chrome.runtime.sendMessage({ cmd: "toggle_pdf_inline_setting", enabled: true })
                        if (navigator.userAgent.includes("Firefox/")) {
                            alert('Perfekt! Bitte starte den Browser einmal neu, damit die Einstellungen übernommen werden!')
                            chrome.storage.local.set({ openSettingsPageParam: 'opalCustomize', openSettingsOnReload: true }, () => {})
                            chrome.runtime.sendMessage({ cmd: 'reload_extension' }, () => {})
                        }
                    } else {
                        // permission granting failed :( -> revert checkbox settings
                        chrome.storage.local.set({ pdfInInline: false })
                        pdfInlineActive.value = false
                        alert("TUfast braucht diese Berechtigung, um die PDFs im Browser anzeigen zu können. Versuche es erneut.")
                    }
                })
            }
            if (pdfInlineActive.value) {
                // disable "pdf in new tab" setting since it doesn't make any sense without inline pdf
                chrome.storage.local.set({ pdfInNewTab: false })
                chrome.runtime.sendMessage({ cmd: 'toggle_pdf_inline_setting', enabled: false })
                pdfNewTabActive.value = false
            }
        }

        const pdfNewTab = () => {
            chrome.storage.local.set({ pdfInNewTab: !pdfNewTabActive.value }, () => {})
        }

        return {
            pdfInlineActive,
            pdfNewTabActive,
            pdfInline,
            pdfNewTab,
        }
    },
})
</script>
