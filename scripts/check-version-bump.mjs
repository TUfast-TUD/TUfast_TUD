import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

class TUfastVersionBumpError extends Error {
  constructor(message) {
    super(`TUfast version check: ${message}`)
    this.name = 'TUfastVersionBumpError'
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function runGit(args) {
  return execFileSync('git', args, {
    cwd: rootDir,
    encoding: 'utf8'
  }).trim()
}

function compareVersions(leftVersion, rightVersion) {
  const leftParts = leftVersion.split('.').map((part) => Number(part))
  const rightParts = rightVersion.split('.').map((part) => Number(part))
  const maxLength = Math.max(leftParts.length, rightParts.length)

  for (let index = 0; index < maxLength; index += 1) {
    const leftPart = Number.isFinite(leftParts[index]) ? leftParts[index] : 0
    const rightPart = Number.isFinite(rightParts[index]) ? rightParts[index] : 0

    if (leftPart > rightPart) return 1
    if (leftPart < rightPart) return -1
  }

  return 0
}

const baseRef = process.env.GITHUB_BASE_REF || process.argv[2] || 'main'

const mergeBase = runGit(['merge-base', 'HEAD', `origin/${baseRef}`])
const changedFiles = runGit(['diff', '--name-only', `${mergeBase}...HEAD`])
const packageJsonChanged = changedFiles.split('\n').filter(Boolean).includes('package.json')

if (!packageJsonChanged) {
  console.log('package.json is unchanged; skipping version bump check.')
  process.exit(0)
}

const baseVersion = JSON.parse(runGit(['show', `${mergeBase}:package.json`])).version
const headVersion = readJson(path.join(rootDir, 'package.json')).version

if (typeof baseVersion !== 'string' || typeof headVersion !== 'string') {
  throw new Error('package.json must contain string versions in base and head revisions.')
}

if (compareVersions(headVersion, baseVersion) <= 0) {
  throw new TUfastVersionBumpError(
    `package.json version must be increased in the PR. Base: ${baseVersion}, head: ${headVersion}`
  )
}

console.log(`package.json version increased from ${baseVersion} to ${headVersion}.`)
