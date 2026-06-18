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
      const manifestNames = new Set(['manifest.json', 'manifest.chrome.json', 'manifest.firefox.json'])
      for (const file of walkFiles(srcDir)) {
        const relativePath = path.relative(srcDir, file)
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
  const shouldRewrite = (fileName) =>
    fileName.startsWith('contentScripts/') &&
    !fileName.startsWith('contentScripts/other/hisqis/gradeChart') &&
    !fileName.startsWith('contentScripts/other/hisqis/newTable')

  const rewrite = (code) => {
    const helperMatch = code.match(/^import\{t as ([\w$]+)\}from"[^"]*vite\/pkg\/preload-helper\.js";/)
    const withoutHelperImport = helperMatch ? code.slice(helperMatch[0].length) : code
    return withoutHelperImport.replace(
      /\b[\w$]+\(\(\)=>import\((chrome\.runtime\.getURL\([^)]*\))\),\[\]\)/g,
      'import($1)'
    )
  }

  return {
    name: 'keep-content-scripts-classic',
    renderChunk(code, chunk) {
      if (!shouldRewrite(chunk.fileName)) return null
      return { code: rewrite(code), map: null }
    },
    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk' && shouldRewrite(chunk.fileName)) chunk.code = rewrite(chunk.code)
      }
    },
    writeBundle() {
      for (const file of walkFiles(path.join(buildDir, 'contentScripts'))) {
        const relativePath = toPosix(path.relative(buildDir, file))
        if (!shouldRewrite(relativePath)) continue

        const code = fs.readFileSync(file, 'utf8')
        const rewritten = rewrite(code)
        if (rewritten !== code) fs.writeFileSync(file, rewritten)
      }
    }
  }
}

export default defineConfig({
  root: srcDir,
  publicDir: false,
  plugins: [vue(), copyStaticExtensionFiles(), injectManifestVersions(), keepContentScriptsClassic()],
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
