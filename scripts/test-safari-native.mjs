import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const listing = spawnSync('xcrun', ['simctl', 'list', 'devices', 'available', '-j'], { encoding: 'utf8' })
if (listing.status !== 0) throw new Error(listing.stderr || 'Unable to list iOS simulators')
const devices = Object.entries(JSON.parse(listing.stdout).devices)
  .filter(([runtime]) => /iOS-(?:18|2\d)-/.test(runtime))
  .flatMap(([, devices]) => devices)
  .filter((device) => /^(iPhone|iPad) /.test(device.name))
const device = process.argv[2]
  ? devices.find((device) => device.udid === process.argv[2])
  : devices.find((device) => device.name.startsWith('iPhone '))
if (!device) throw new Error('No suitable iPhone/iPad simulator found. Install an iOS 18+ simulator runtime in Xcode.')
console.log(`Testing on simulator: ${device.name}`)
const result = spawnSync('xcodebuild', [
  '-project', 'safari/TUfast Safari/TUfast Safari.xcodeproj',
  '-scheme', 'TUfast Safari (iOS)',
  '-destination', `platform=iOS Simulator,id=${device.udid}`,
  '-derivedDataPath', 'safari/DerivedData',
  'CODE_SIGN_IDENTITY=-',
  'test'
], { cwd: root, stdio: 'inherit' })
if (result.error) throw result.error
process.exit(result.status || 0)
