import CryptoJS from 'crypto-js'

export function hashContent(content: string): string {
  return CryptoJS.MD5(content).toString()
}

export function hashUrl(url: string): string {
  return CryptoJS.MD5(url).toString()
}
