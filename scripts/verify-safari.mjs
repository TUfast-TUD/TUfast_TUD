import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'safari/Resources/manifest.json'), 'utf8'))
assert.equal(manifest.background.type, 'module', 'The bundled background uses ES modules')
assert.ok(manifest.permissions.includes('nativeMessaging'))
assert.ok(!manifest.permissions.includes('system.cpu'))
assert.ok(!manifest.host_permissions.includes('*://*/'))
for (const entry of manifest.content_scripts) {
  assert.ok(!entry.include_globs, 'Safari needs runtime URL guards rather than unsupported include_globs')
  for (const resource of [...(entry.js || []), ...(entry.css || [])]) {
    assert.ok(fs.existsSync(path.join(root, 'safari/Resources', resource)), `Missing resource: ${resource}`)
  }
}
assert.ok(!fs.existsSync(path.join(root, 'safari/Resources/manifest.chrome.json')))
const data = { isEnabled: true }
let reads = 0
const credentials = {
  getUserData: async () => { reads++; return { user: 'test', pass: 'test' } },
  userDataExists: async () => true,
  setUserData: async () => {},
  deleteUserData: async () => true
}
const chrome = {
  runtime: { getURL: (value) => 'safari-web-extension://test/' + value, sendMessage: async () => {} },
  storage: { local: {
    get: async (keys) => Object.fromEntries(keys.map((key) => [key, data[key]])),
    set: async (value) => Object.assign(data, value)
  } }
}
const source = fs.readFileSync(path.join(root, 'src/modules/safariMessages.ts'), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 } }).outputText
const sandbox = { exports: {}, chrome, URL, Date, Set, require: (name) => {
  if (name === './credentials') return credentials
  if (name === './otp') return { getTOTP: async () => '123456', getIOTP: async () => 'ab' }
  throw new Error(`Unexpected import: ${name}`)
} }
vm.runInNewContext(compiled, sandbox)
const { handleSafariCredentialMessage: handle, isSafariLoginSender: allowed } = sandbox.exports
const portal = { url: 'https://idp.tu-dresden.de/idp/login' }
const settings = { url: 'safari-web-extension://test/freshContent/settings/index.html' }
assert.equal(allowed({ url: 'https://idp.tu-dresden.de.attacker.example/' }, 'zih'), false)
assert.equal(allowed({ url: 'http://idp.tu-dresden.de/' }, 'zih'), false)
assert.equal(allowed({ url: 'https://foo.slub-dresden.de/' }, 'slub'), true)
await assert.rejects(handle({ cmd: 'get_user_data', platform: 'zih-totp' }, portal))
await assert.rejects(handle({ cmd: 'get_user_data' }, { url: 'https://www.google.com/' }))
await assert.rejects(handle({ cmd: 'set_user_data', userData: {} }, portal))
await assert.rejects(handle({ cmd: 'get_totp' }, { url: 'https://bildungsportal.sachsen.de/opal/' }))
assert.equal(reads, 0, 'Denied requests must never read the credential store')
assert.equal((await handle({ cmd: 'get_user_data' }, portal)).user, 'test')
assert.equal(await handle({ cmd: 'get_totp' }, portal), '123456')
assert.equal(await handle({ cmd: 'get_iotp', indexes: [-1, 999] }, portal), null)
assert.equal(await handle({ cmd: 'set_user_data', userData: { user: 'test', pass: 'test' } }, settings), true)
const attempts = await Promise.all(Array.from({ length: 4 }, () => handle({ cmd: 'begin_login_attempt' }, portal)))
assert.deepEqual(attempts, [true, true, true, false], 'Concurrent attempts must respect the persistent cap')
assert.equal(data.isEnabled, false)
assert.equal(data.safariLoginPaused, true)
assert.equal(await handle({ cmd: 'begin_login_attempt' }, portal), false)
console.log('Safari manifest, resource, credential-origin, OTP and login-limit checks passed.')
