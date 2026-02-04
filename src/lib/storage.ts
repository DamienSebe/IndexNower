import type { AppData, Site, UrlEntry, SiteSettings } from '@/types'

const STORAGE_KEY = 'indexnow-app-data'

const defaultSettings: SiteSettings = {
  apiKey: '',
  keyLocation: '',
  host: '',
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function getAppData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load app data:', e)
  }
  return { sites: {}, activeSiteId: null }
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save app data:', e)
  }
}

export function getActiveSite(): Site | null {
  const data = getAppData()
  if (!data.activeSiteId || !data.sites[data.activeSiteId]) {
    return null
  }
  return data.sites[data.activeSiteId]
}

export function setActiveSite(siteId: string): void {
  const data = getAppData()
  if (data.sites[siteId]) {
    data.activeSiteId = siteId
    saveAppData(data)
  }
}

export function getAllSites(): Site[] {
  const data = getAppData()
  return Object.values(data.sites).sort((a, b) => a.name.localeCompare(b.name))
}

export function createSite(name: string): Site {
  const data = getAppData()
  const id = generateId()
  const now = new Date().toISOString()
  
  const site: Site = {
    id,
    name,
    settings: { ...defaultSettings },
    urls: {},
    createdAt: now,
    updatedAt: now,
  }
  
  data.sites[id] = site
  data.activeSiteId = id
  saveAppData(data)
  
  return site
}

export function updateSite(siteId: string, updates: Partial<Omit<Site, 'id' | 'createdAt'>>): Site | null {
  const data = getAppData()
  const site = data.sites[siteId]
  
  if (!site) return null
  
  data.sites[siteId] = {
    ...site,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  saveAppData(data)
  return data.sites[siteId]
}

export function deleteSite(siteId: string): void {
  const data = getAppData()
  delete data.sites[siteId]
  
  if (data.activeSiteId === siteId) {
    const remainingSites = Object.keys(data.sites)
    data.activeSiteId = remainingSites.length > 0 ? remainingSites[0] : null
  }
  
  saveAppData(data)
}

export function updateUrlEntry(siteId: string, url: string, entry: Partial<UrlEntry>): void {
  const data = getAppData()
  const site = data.sites[siteId]
  
  if (!site) return
  
  site.urls[url] = {
    ...site.urls[url],
    url,
    contentHash: entry.contentHash || site.urls[url]?.contentHash || '',
    lastSubmitted: entry.lastSubmitted ?? site.urls[url]?.lastSubmitted ?? null,
    status: entry.status || site.urls[url]?.status || 'pending',
    lastModified: entry.lastModified || site.urls[url]?.lastModified,
  }
  
  site.updatedAt = new Date().toISOString()
  saveAppData(data)
}

export function updateSiteSettings(siteId: string, settings: Partial<SiteSettings>): void {
  const data = getAppData()
  const site = data.sites[siteId]
  
  if (!site) return
  
  site.settings = { ...site.settings, ...settings }
  site.updatedAt = new Date().toISOString()
  saveAppData(data)
}

export function getSiteSettings(siteId: string): SiteSettings {
  const data = getAppData()
  return data.sites[siteId]?.settings || { ...defaultSettings }
}

export function getSiteUrlEntries(siteId: string): Record<string, UrlEntry> {
  const data = getAppData()
  return data.sites[siteId]?.urls || {}
}

export function clearSiteHistory(siteId: string): void {
  const data = getAppData()
  const site = data.sites[siteId]
  
  if (!site) return
  
  site.urls = {}
  site.updatedAt = new Date().toISOString()
  saveAppData(data)
}
