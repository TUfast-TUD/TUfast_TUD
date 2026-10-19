export function isSafari(): boolean {
  return chrome.runtime.getURL('').startsWith('safari-web-extension:')
}

export async function safariCredentialRequest<T>(operation: string, platform?: string, data?: unknown): Promise<T> {
  const response = await chrome.runtime.sendNativeMessage('tufast', {
    operation,
    platform,
    data
  })
  if (!response?.ok) throw new Error(response?.error || 'Keychain request failed')
  return response.value as T
}
