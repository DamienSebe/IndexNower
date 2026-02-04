import { useState, useEffect, useCallback } from 'react'
import { SiteSelector } from '@/components/SiteSelector'
import { SettingsPanel } from '@/components/SettingsPanel'
import { UrlInput } from '@/components/UrlInput'
import { UrlList } from '@/components/UrlList'
import { SubmitPanel } from '@/components/SubmitPanel'
import { getActiveSite, getSiteUrlEntries, updateUrlEntry, clearSiteHistory, getAppData, saveAppData } from '@/lib/storage'
import { hashContent } from '@/lib/hash'
import { fetchPageContent } from '@/lib/indexnow'
import type { UrlEntry, Site } from '@/types'
import { Zap } from 'lucide-react'

function App() {
  const [activeSite, setActiveSite] = useState<Site | null>(() => getActiveSite())
  const [urls, setUrls] = useState<UrlEntry[]>([])
  const [checkingChanges, setCheckingChanges] = useState(false)

  useEffect(() => {
    if (activeSite) {
      const stored = getSiteUrlEntries(activeSite.id)
      setUrls(Object.values(stored))
    } else {
      setUrls([])
    }
  }, [activeSite])

  const handleSiteChange = useCallback((site: Site | null) => {
    setActiveSite(site)
  }, [])

  const handleUrlsLoaded = useCallback(async (newUrls: string[]) => {
    if (!activeSite) return
    
    setCheckingChanges(true)
    const existingEntries = getSiteUrlEntries(activeSite.id)
    const updatedUrls: UrlEntry[] = []

    for (const url of newUrls) {
      const existing = existingEntries[url]
      
      let status: UrlEntry['status'] = 'pending'
      let contentHash = ''

      const content = await fetchPageContent(url)
      if (content) {
        contentHash = hashContent(content)
        
        if (existing) {
          if (existing.contentHash && existing.contentHash !== contentHash) {
            status = 'changed'
          } else if (existing.status === 'submitted' && existing.contentHash === contentHash) {
            status = 'submitted'
          }
        }
      } else if (existing) {
        contentHash = existing.contentHash
        status = existing.status
      }

      const entry: UrlEntry = {
        url,
        contentHash,
        lastSubmitted: existing?.lastSubmitted || null,
        status,
        lastModified: existing?.lastModified,
      }

      updateUrlEntry(activeSite.id, url, entry)
      updatedUrls.push(entry)
    }

    setUrls(updatedUrls)
    setCheckingChanges(false)
  }, [activeSite])

  const handleClear = useCallback(() => {
    if (!activeSite) return
    clearSiteHistory(activeSite.id)
    setUrls([])
  }, [activeSite])

  const handleRemove = useCallback((url: string) => {
    if (!activeSite) return
    const data = getAppData()
    const site = data.sites[activeSite.id]
    if (site) {
      delete site.urls[url]
      saveAppData(data)
    }
    setUrls((prev) => prev.filter((u) => u.url !== url))
  }, [activeSite])

  const handleSubmitComplete = useCallback((submittedUrls: string[]) => {
    if (!activeSite) return
    const now = new Date().toISOString()
    
    setUrls((prev) =>
      prev.map((entry) => {
        if (submittedUrls.includes(entry.url)) {
          const updated: UrlEntry = {
            ...entry,
            status: 'submitted',
            lastSubmitted: now,
          }
          updateUrlEntry(activeSite.id, entry.url, updated)
          return updated
        }
        return entry
      })
    )
  }, [activeSite])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">IndexNower</h1>
              <p className="text-sm text-gray-500">
                Submit your URLs to IndexNow for faster indexing
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <SiteSelector activeSite={activeSite} onSiteChange={handleSiteChange} />
          </div>

          <div className="lg:col-span-3">
            {!activeSite ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <p className="text-gray-500">Select or create a site to get started.</p>
              </div>
            ) : (
              <>
                {checkingChanges && (
                  <div className="mb-6 p-4 rounded-lg bg-blue-50 text-blue-800">
                    Checking for content changes... This may take a moment.
                  </div>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-1 space-y-6">
                    <SettingsPanel siteId={activeSite.id} />
                    <UrlInput onUrlsLoaded={handleUrlsLoaded} />
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    <SubmitPanel siteId={activeSite.id} urls={urls} onSubmitComplete={handleSubmitComplete} />
                    <UrlList urls={urls} onClear={handleClear} onRemove={handleRemove} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500">
          IndexNower • Submit URLs to IndexNow API for faster search engine indexing
        </div>
      </footer>
    </div>
  )
}

export default App
