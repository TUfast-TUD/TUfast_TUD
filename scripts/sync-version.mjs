import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const buildDir = path.join(rootDir, 'build')

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function escapeReplacement(value) {
  return value.replaceAll('\\', '\\\\').replaceAll('$', '$$$$')
}

function escapeRegExp(value) {
  return value.replaceAll(/[.*+?^${}()|[\\]\\]/g, '\\$&')
}

export function syncManifestVersions({ buildDir: customBuildDir = buildDir, rootDir: customRootDir = rootDir } = {}) {
  const packageJsonPath = path.join(customRootDir, 'package.json')
  const { version } = readJson(packageJsonPath)

  if (typeof version !== 'string' || version.length === 0) {
    throw new Error('package.json must contain a non-empty string version')
  }

  const manifestPaths = [
    path.join(customBuildDir, 'manifest.chrome.json'),
    path.join(customBuildDir, 'manifest.firefox.json'),
    path.join(customBuildDir, 'manifest.json')
  ]

  for (const manifestPath of manifestPaths) {
    if (!fs.existsSync(manifestPath)) continue

    const source = fs.readFileSync(manifestPath, 'utf8')

    // Try parsing JSON and set the version property directly.
    try {
      const obj = JSON.parse(source)
      if (obj._comment) delete obj._comment
      if (obj.version !== version) {
        // Rebuild object to place `version` directly after `name`.
        const entries = Object.entries(obj)
        const newObj = {}
        if ('name' in obj) {
          newObj['name'] = obj['name']
        }
        newObj['version'] = version
        for (const [k, v] of entries) {
          if (k === 'name' || k === 'version' || k === '_comment') continue
          newObj[k] = v
        }
        const nextSource = JSON.stringify(newObj, null, 2) + '\n'
        fs.writeFileSync(manifestPath, nextSource)
        console.log(`Synced ${path.relative(customRootDir, manifestPath)} to ${version}`)
      }
      continue
    } catch (err) {
      // If parsing fails (e.g. due to comments), fall back to regex-based replacement.
    }

    const versionLine = `  "version": "${escapeReplacement(version)}"`
    const versionPattern = /^(\s*"version"\s*:\s*)"[^"]*"/m

    let nextSource = source
    if (versionPattern.test(source)) {
      nextSource = source.replace(versionPattern, `$1"${escapeReplacement(version)}"`)
    } else {
      // Try inserting the version right after the `"name"` property if present.
      const namePattern = /("name"\s*:\s*"[^"]*")(\s*,?)/m
      if (namePattern.test(source)) {
        nextSource = source.replace(namePattern, (match, p1, p2) => {
          const needsComma = p2 && p2.includes(',') ? '' : ','
          return p1 + (needsComma || ',') + '\n' + '  "version": "' + escapeReplacement(version) + '"'
        })
      } else {
        // Fallback: insert after opening brace
        const insertAfter = source.indexOf('{')
        if (insertAfter !== -1) {
          const before = source.slice(0, insertAfter + 1)
          const after = source.slice(insertAfter + 1)
          nextSource = before + '\n' + versionLine + ',\n' + after
        } else {
          throw new Error(`Could not find insertion point for version in ${path.relative(customRootDir, manifestPath)}`)
        }
      }
    }

    if (source !== nextSource) {
      fs.writeFileSync(manifestPath, nextSource)
      console.log(`Synced ${path.relative(customRootDir, manifestPath)} to ${version}`)
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  syncManifestVersions()
}
