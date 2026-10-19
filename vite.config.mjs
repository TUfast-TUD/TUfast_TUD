import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { syncManifestVersions } from './scripts/sync-version.mjs'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(rootDir, 'src')
const buildDir = path.resolve(rootDir, 'build')
const legacyClassicScript = path.resolve(srcDir, 'freshContent/starRating.js')

function walkFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath]
  })
}

function toPosix(filePath) {
  return filePath.split(path.sep).join('/')
}

function withoutExt(filePath) {
  return filePath.slice(0, -path.extname(filePath).length)
}

function readLocaleMessages() {
  const localeDir = path.join(srcDir, 'i18n', 'locales')
  return Object.fromEntries(
    fs
      .readdirSync(localeDir)
      .filter((fileName) => fileName.endsWith('.json'))
      .map((fileName) => [
        path.basename(fileName, '.json'),
        JSON.parse(fs.readFileSync(path.join(localeDir, fileName), 'utf8'))
      ])
  )
}

function readContentScriptMessages() {
  return Object.fromEntries(
    Object.entries(readLocaleMessages()).map(([locale, localeMessages]) => [locale, localeMessages.content])
  )
}

function contentScriptStringsFallback() {
  const messages = readContentScriptMessages()
  return messages.en || Object.values(messages)[0] || {}
}

function buildInputs() {
  return Object.fromEntries(
    walkFiles(srcDir)
      .filter((file) => {
        if (file.endsWith('.d.ts')) return false
        if (path.resolve(file) === legacyClassicScript) return false
        if (/\.(html|js|scss|ts)$/.test(file)) return true
        return /\.sass$/.test(file) && !path.basename(file).startsWith('_')
      })
      .map((file) => {
        const relativePath = toPosix(path.relative(srcDir, file))
        return [file.endsWith('.html') ? relativePath : withoutExt(relativePath), file]
      })
  )
}

function copyStaticExtensionFiles() {
  return {
    name: 'copy-static-extension-files',
    writeBundle() {
      const manifestNames = new Set(['manifest.json', 'manifest.chrome.json', 'manifest.firefox.json', 'manifest.safari.json'])
      for (const file of walkFiles(srcDir)) {
        const relativePath = path.relative(srcDir, file)
        if (/^i18n[\\/]locales[\\/][^\\/]+\.json$/.test(relativePath)) continue
        if (path.resolve(file) === legacyClassicScript) {
          const target = path.join(buildDir, relativePath)
          fs.mkdirSync(path.dirname(target), { recursive: true })
          fs.copyFileSync(file, target)
          continue
        }
        if (/\.(html|js|sass|scss|ts|vue)$/.test(relativePath) || relativePath.endsWith('.d.ts')) continue

        const target = path.join(buildDir, relativePath)
        fs.mkdirSync(path.dirname(target), { recursive: true })

        if (manifestNames.has(path.basename(relativePath))) {
          const source = fs.readFileSync(file, 'utf8')
          try {
            const obj = JSON.parse(source)
            if (obj._comment) delete obj._comment
            fs.writeFileSync(target, JSON.stringify(obj, null, 2) + '\n')
            continue
          } catch (err) {
            // fallback: copy raw file
            fs.copyFileSync(file, target)
            continue
          }
        }

        fs.copyFileSync(file, target)
      }
    }
  }
}

function injectManifestVersions() {
  return {
    name: 'inject-manifest-versions',
    writeBundle() {
      syncManifestVersions({ buildDir })
    }
  }
}

function keepContentScriptsClassic() {
  const stringsFile = 'i18n/contentScriptStrings.js'
  const shouldRewrite = (fileName, classicScripts) => classicScripts.has(fileName) || fileName === stringsFile
  const stringsFallbackPrefix = 'globalThis.TUFAST_STRINGS_READY=Promise.resolve(globalThis.TUFAST_STRINGS_READY).then('
  // Manifest-loaded content scripts are classic scripts and share one isolated-world
  // global scope per page. Keep top-level minified names from different files apart.
  const iifePrefix = '(()=>{\n'
  const iifeSuffix = '\n})();'

  const unwrapIife = (code) => {
    const trimmed = code.trimEnd()
    return trimmed.startsWith(iifePrefix) && trimmed.endsWith(iifeSuffix)
      ? trimmed.slice(iifePrefix.length, -iifeSuffix.length)
      : code
  }

  const wrapIife = (code) => `${iifePrefix}${unwrapIife(code)}${iifeSuffix}`

  const rewrite = (code, fileName) => {
    // Vite may add this static helper import for dynamic imports. Static imports
    // are a SyntaxError in classic content scripts, so keep the native import().
    const withoutHelperImport = unwrapIife(code).replace(
      /import\{t as [\w$]+\}from"[^"]*vite\/pkg\/preload-helper\.js";/g,
      ''
    )
    const rewritten = unwrapIife(withoutHelperImport).replace(
      /\b[\w$]+\(\(\)=>import\((chrome\.runtime\.getURL\([^)]*\))\),\[\]\)/g,
      'import($1)'
    )
    if (fileName === stringsFile) return wrapIife(rewritten)
    if (!rewritten.includes('TUFAST_STRINGS_READY') || rewritten.startsWith(stringsFallbackPrefix)) return wrapIife(rewritten)
    const fallback = JSON.stringify(contentScriptStringsFallback())
    return wrapIife(
      `globalThis.TUFAST_STRINGS_READY=Promise.resolve(globalThis.TUFAST_STRINGS_READY).then(s=>s||globalThis.TUFAST_STRINGS||${fallback},()=>globalThis.TUFAST_STRINGS||${fallback});\n${rewritten}`
    )
  }

  return {
    name: 'keep-content-scripts-classic',
    writeBundle() {
      // Run once on final files. Earlier Vite hooks can run before import analysis
      // has added the helper import, and some contentScripts/ files are real modules.
      const manifest = JSON.parse(fs.readFileSync(path.join(buildDir, 'manifest.json'), 'utf8'))
      const classicScripts = new Set(manifest.content_scripts.flatMap((entry) => entry.js ?? []))
      const files = [...classicScripts, stringsFile]

      for (const relativePath of files) {
        if (!shouldRewrite(relativePath, classicScripts)) continue
        const file = path.join(buildDir, ...relativePath.split('/'))

        const code = fs.readFileSync(file, 'utf8')
        const rewritten = rewrite(code, relativePath)
        if (rewritten !== code) fs.writeFileSync(file, rewritten)
      }
    }
  }
}

function inlineContentScriptStrings() {
  return {
    name: 'inline-content-script-strings',
    generateBundle(_options, bundle) {
      const stringsChunk = bundle['i18n/contentScriptStrings.js']
      if (!stringsChunk || stringsChunk.type !== 'chunk') return

      const marker = /\b__TUFAST_CONTENT_LOCALES__\b/
      if (!marker.test(stringsChunk.code)) throw new Error(`__TUFAST_CONTENT_LOCALES__ not found in ${stringsChunk.fileName}`)
      stringsChunk.code = stringsChunk.code.replace(marker, JSON.stringify(readContentScriptMessages()))
    }
  }
}

function writeManifestLocales() {
  return {
    name: 'write-manifest-locales',
    generateBundle(_options, bundle) {
      for (const [locale, localeMessages] of Object.entries(readLocaleMessages())) {
        const manifest = localeMessages.manifest
        if (!manifest) continue
        const browserMessages = Object.fromEntries(
          Object.entries(manifest).map(([key, message]) => [key, { message }])
        )

        this.emitFile({
          type: 'asset',
          fileName: `_locales/${locale}/messages.json`,
          source: JSON.stringify(browserMessages, null, 2) + '\n'
        })
      }
    }
  }
}

export default defineConfig({
  root: srcDir,
  publicDir: false,
  plugins: [
    vue(),
    copyStaticExtensionFiles(),
    injectManifestVersions(),
    keepContentScriptsClassic(),
    inlineContentScriptStrings(),
    writeManifestLocales()
  ],
  build: {
    outDir: buildDir,
    emptyOutDir: true,
    modulePreload: false,
    rollupOptions: {
      input: buildInputs(),
      preserveEntrySignatures: 'strict',
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'vite/pkg/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) return '[name][extname]'
          return 'assets/[name][extname]'
        }
      }
    }
  }
})
