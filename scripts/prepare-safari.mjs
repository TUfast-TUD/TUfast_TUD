import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const build = path.join(root, 'build')
const target = path.join(root, 'safari', 'Resources')
const manifest = JSON.parse(fs.readFileSync(path.join(build, 'manifest.json'), 'utf8'))
if (!manifest.permissions.includes('nativeMessaging') || manifest.permissions.includes('system.cpu')) {
  throw new Error('Select the Safari manifest and rebuild before packaging: npm run build:safari')
}
fs.rmSync(target, { recursive: true, force: true })
fs.mkdirSync(target, { recursive: true })
fs.cpSync(build, target, { recursive: true })
for (const name of fs.readdirSync(target)) {
  if (/^manifest\..+\.json$/.test(name)) fs.rmSync(path.join(target, name))
}
fs.copyFileSync(path.join(root, 'LICENSE'), path.join(target, 'LICENSE'))
const appResources = path.join(root, 'safari/TUfast Safari/Shared (App)/Resources')
if (fs.existsSync(appResources)) {
  const locales = Object.fromEntries(['de', 'en'].map((locale) => [locale, JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/locales', locale + '.json'), 'utf8')).safari.app]))
  const script = fs.readFileSync(path.join(root, 'safari/App.js'), 'utf8')
  fs.writeFileSync(path.join(appResources, 'Script.js'), `const translations = ${JSON.stringify(locales)};\n${script}`)
}
console.log('Safari resources prepared in safari/Resources.')
