import { getUserData } from './credentials'

// Get the TOTP code for the user
export async function getTOTP(platform: string = 'zih'): Promise<string | undefined> {
  const userData = await getUserData(platform + '-totp')
  try {
    if (!userData || !userData.pass) return undefined
    return await generateTOTP(userData.pass ?? '')
  } catch {
    return undefined
  }
}

export async function getIOTP(platform: string = 'zih', ...indexes): Promise<string | undefined> {
  const userData = await getUserData(platform + '-iotp')
  if (!userData || !userData.pass) return undefined

  let result = ''
  for (const index of indexes) {
    const char = userData.pass[index]
    if (!char) return undefined
    result += char
  }
  return result
}

// Generate a TOTP code from a seed URI
// Returns a string as it can be prefixed with 0s
async function generateTOTP(secret: string): Promise<string> {
  if (!secret) {
    throw new Error('No secret found in URI')
  }

  // Counter is the current time in seconds divided by the interval
  // Interval is 30 for the TUD
  const counter = Math.floor(Date.now() / 1000 / 30)

  const key = await b32ToUInt8Arr(secret)
  const value = new ArrayBuffer(8)
  const view = new DataView(value)
  view.setUint32(4, counter, false)

  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, [
    'sign',
    'verify'
  ])
  const signed = await crypto.subtle.sign({ name: 'HMAC', hash: 'SHA-1' }, cryptoKey, value)

  // Truncate the result
  const signature = new Uint8Array(signed)
  const offset = signature[signature.length - 1] & 0xf
  const code =
    ((signature[offset + 0] & 0x7f) << 24) |
    ((signature[offset + 1] & 0xff) << 16) |
    ((signature[offset + 2] & 0xff) << 8) |
    (signature[offset + 3] & 0xff)
  //         because 6 digits v
  return (code % Math.pow(10, 6)).toString().padStart(6, '0')
}

async function b32ToUInt8Arr(base32: string): Promise<Uint8Array> {
  base32 = base32.replace(/=+$/, '').toLocaleUpperCase()

  /**
   * How this works:
   * - Convert each base32 character to a value.
   * - Each value is 5bits long (because of 32 available chars).
   * - We want bytes, but thats 8bits.
   * - So get all the 5bit values, and concat them into a string.
   * - Then get chunks of 8 from the string and parse the numeric value.
   */

  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = ''

  for (let i = 0; i < base32.length; i++) {
    const val = base32Chars.indexOf(base32.charAt(i))
    if (val === -1) throw new Error('Invalid character in secret')
    bits += val.toString(2).padStart(5, '0')
  }

  const result = new Uint8Array(bits.length / 8)

  for (let i = 0; i + 8 <= bits.length; i += 8) {
    const chunk = bits.substring(i, i + 8)
    result[i / 8] = Number.parseInt(chunk, 2)
  }

  return result
}
