import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const localeDir = path.join(rootDir, 'src', 'i18n', 'locales')
const fallbackLocale = 'de'

class LocaleCheckError extends Error {
  constructor(message) {
    super(`Locale check: ${message}`)
    this.name = 'LocaleCheckError'
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function valueKind(value) {
  if (Array.isArray(value)) return 'array'
  if (value && typeof value === 'object') return 'object'
  return typeof value
}

function placeholders(value) {
  return [...value.matchAll(/\{([^{}]+)\}/g)].map((match) => match[1]).sort()
}

function assertSameList(label, pathName, actual, expected) {
  if (actual.join('\0') !== expected.join('\0')) {
    throw new LocaleCheckError(`${pathName} has ${label} [${actual.join(', ')}], expected [${expected.join(', ')}]`)
  }
}

function compareValue(locale, pathName, actual, expected) {
  const actualKind = valueKind(actual)
  const expectedKind = valueKind(expected)
  if (actualKind !== expectedKind) {
    throw new LocaleCheckError(`${locale}.${pathName} is ${actualKind}, expected ${expectedKind}`)
  }

  if (expectedKind === 'string') {
    if (actual.trim().length === 0) throw new LocaleCheckError(`${locale}.${pathName} is empty`)
    assertSameList('placeholders', `${locale}.${pathName}`, placeholders(actual), placeholders(expected))
    const actualPluralCount = actual.split('|').length
    const expectedPluralCount = expected.split('|').length
    if (actualPluralCount !== expectedPluralCount) {
      throw new LocaleCheckError(
        `${locale}.${pathName} has ${actualPluralCount} plural segment(s), expected ${expectedPluralCount}`
      )
    }
    return
  }

  if (expectedKind === 'array') {
    if (actual.length !== expected.length) {
      throw new LocaleCheckError(`${locale}.${pathName} has ${actual.length} item(s), expected ${expected.length}`)
    }
    for (let index = 0; index < expected.length; index += 1) {
      compareValue(locale, `${pathName}[${index}]`, actual[index], expected[index])
    }
    return
  }

  if (expectedKind !== 'object') return

  const actualKeys = Object.keys(actual).sort()
  const expectedKeys = Object.keys(expected).sort()
  assertSameList('keys', `${locale}.${pathName}`, actualKeys, expectedKeys)

  for (const key of expectedKeys) {
    compareValue(locale, pathName ? `${pathName}.${key}` : key, actual[key], expected[key])
  }
}

const localeFiles = fs
  .readdirSync(localeDir)
  .filter((fileName) => fileName.endsWith('.json'))
  .sort()

if (!localeFiles.includes(`${fallbackLocale}.json`)) {
  throw new LocaleCheckError(`${fallbackLocale}.json is required`)
}

const locales = Object.fromEntries(
  localeFiles.map((fileName) => [path.basename(fileName, '.json'), readJson(path.join(localeDir, fileName))])
)
const fallbackMessages = locales[fallbackLocale]

for (const [locale, messages] of Object.entries(locales)) {
  compareValue(locale, '', messages, fallbackMessages)
}

console.log(`Locale check passed for ${Object.keys(locales).join(', ')}.`)
