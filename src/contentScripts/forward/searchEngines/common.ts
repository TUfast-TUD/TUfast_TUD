import sites from './sites.json'

/* const sites = {
  hisqis: 'https://qis.dez.tu-dresden.de/qisserver/servlet/de.his.servlet.RequestDispatcherServlet?state=template&template=user/news',
  jexam: 'https://jexam.inf.tu-dresden.de/de.jexam.web.v4.5/spring/welcome',
  opal: 'https://bildungsportal.sachsen.de/opal/shiblogin?0',
  selma: 'https://selma.tu-dresden.de/APP/EXTERNALPAGES/-N000000000000001,-N000155,-AEXT_willkommen',
  slub: 'https://www.slub-dresden.de/',
  tucloud: 'https://cloudstore.zih.tu-dresden.de/index.php/login',
  tudmail: 'https://msx.tu-dresden.de/owa/#path=/mail',
  tumail: 'https://msx.tu-dresden.de/owa/#path=/mail',
  tumatrix: 'https://matrix.tu-dresden.de/#/',
  tumed: 'https://eportal.med.tu-dresden.de/login',
  tustore: 'https://cloudstore.zih.tu-dresden.de/index.php/login',
  videocampus: 'https://videocampus.sachsen.de/'
} */

export async function fwdEnabled () {
  // Promisified until usage of Manifest V3
  const { fwdEnabled } = await new Promise<any>((resolve) => chrome.storage.local.get(['fwdEnabled'], resolve))
  return !!fwdEnabled
}

export async function forward (query: string): Promise<boolean> {
  if (!(await fwdEnabled()) || !query) return false

  const url = sites[query.toLowerCase()]?.url
  if (url) {
    console.log(`Forwarding to ${query} (${url})`)
    chrome.runtime.sendMessage({ cmd: 'save_clicks', click_count: 1 }) // We don't need to wait for any (useless) response
    window.location.replace(url)
    return true // This probably will never be reached, but we can use it
  }
  return false
}

export interface SENamespace {
  fwdEnabled: typeof fwdEnabled
  forward: typeof forward
}
