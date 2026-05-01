import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const packageJsonPath = path.join(rootDir, 'package.json')
const manifestPaths = [
  path.join(rootDir, 'src', 'manifest.chrome.json'),
  path.join(rootDir, 'src', 'manifest.firefox.json'),
  path.join(rootDir, 'src', 'manifest.json')
]

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function escapeReplacement(value) {
  return value.replaceAll('\\', '\\\\').replaceAll('$', '$$$$')
}

const { version } = readJson(packageJsonPath)
if (typeof version !== 'string' || version.length === 0) {
  throw new Error('package.json must contain a non-empty string version')
}

for (const manifestPath of manifestPaths) {
  if (!fs.existsSync(manifestPath)) continue

  const manifest = readJson(manifestPath)
  if (manifest.version === version) continue

  const source = fs.readFileSync(manifestPath, 'utf8')
  const nextSource = source.replace(
    /^(\s*"version"\s*:\s*)"[^"]*"/m,
    `$1"${escapeReplacement(version)}"`
  )

  if (source === nextSource) {
    throw new Error(`Could not find a version field in ${path.relative(rootDir, manifestPath)}`)
  }

  fs.writeFileSync(manifestPath, nextSource)
  console.log(`Synced ${path.relative(rootDir, manifestPath)} to ${version}`)
}
