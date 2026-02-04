export interface UrlEntry {
  url: string
  contentHash: string
  lastSubmitted: string | null
  status: 'pending' | 'submitted' | 'changed' | 'error'
  lastModified?: string
}

export interface SiteSettings {
  apiKey: string
  keyLocation: string
  host: string
}

export interface Site {
  id: string
  name: string
  settings: SiteSettings
  urls: Record<string, UrlEntry>
  createdAt: string
  updatedAt: string
}

export interface AppData {
  sites: Record<string, Site>
  activeSiteId: string | null
}

export interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: string
}

// Legacy type for backwards compatibility
export interface Settings extends SiteSettings {}
