import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const platform = process.argv[2]
if (!['ios', 'macos'].includes(platform)) throw new Error('Usage: npm run archive:safari -- ios|macos')
const { TUFAST_TEAM_ID, TUFAST_BUNDLE_ID, TUFAST_BUILD_NUMBER } = process.env
if (!/^[A-Z0-9]{10}$/.test(TUFAST_TEAM_ID || '')) throw new Error('Set TUFAST_TEAM_ID to your Apple Developer team ID')
if (!TUFAST_BUNDLE_ID || TUFAST_BUNDLE_ID.startsWith('com.example.')) throw new Error('Set TUFAST_BUNDLE_ID to your own registered app identifier')
if (!/^[1-9]\d*$/.test(TUFAST_BUILD_NUMBER || '')) throw new Error('Set TUFAST_BUILD_NUMBER to a new positive integer')
for (const [command, args] of [
  ['npm', ['run', 'build:safari']],
  ['npm', ['run', 'verify:safari']],
  ['xcodebuild', [
    '-project', 'safari/TUfast Safari/TUfast Safari.xcodeproj',
    '-scheme', `TUfast Safari (${platform === 'ios' ? 'iOS' : 'macOS'})`,
    '-configuration', 'Release',
    '-destination', `generic/platform=${platform === 'ios' ? 'iOS' : 'macOS'}`,
    '-archivePath', `safari/Archives/TUfast-${platform}-${TUFAST_BUILD_NUMBER}.xcarchive`,
    `DEVELOPMENT_TEAM=${TUFAST_TEAM_ID}`,
    `TUFAST_BUNDLE_ID=${TUFAST_BUNDLE_ID}`,
    `TUFAST_BUILD_NUMBER=${TUFAST_BUILD_NUMBER}`,
    `TUFAST_APP_VERSION=${process.env.TUFAST_APP_VERSION || '1.0'}`,
    'archive'
  ]]
]) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status || 1)
}
console.log('Open the archive in Xcode Organizer, validate it, then choose Distribute App → App Store Connect.')
