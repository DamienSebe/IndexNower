import type { SitemapUrl } from '@/types'

export async function parseSitemap(sitemapUrl: string): Promise<SitemapUrl[]> {
  const response = await fetch(`/api/sitemap?url=${encodeURIComponent(sitemapUrl)}`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.urls as SitemapUrl[]
}

export function extractUrlsFromText(text: string): string[] {
  const lines = text.split('\n')
  const urls: string[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && isValidUrl(trimmed)) {
      urls.push(trimmed)
    }
  }
  
  return urls
}

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
