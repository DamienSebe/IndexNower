import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAllSites, createSite, deleteSite, setActiveSite } from '@/lib/storage'
import type { Site } from '@/types'
import { Globe, Plus, Trash2, Check } from 'lucide-react'

interface SiteSelectorProps {
  activeSite: Site | null
  onSiteChange: (site: Site | null) => void
}

export function SiteSelector({ activeSite, onSiteChange }: SiteSelectorProps) {
  const [sites, setSites] = useState<Site[]>(() => getAllSites())
  const [newSiteName, setNewSiteName] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const handleCreateSite = () => {
    if (!newSiteName.trim()) return
    
    const site = createSite(newSiteName.trim())
    setSites(getAllSites())
    setNewSiteName('')
    setShowAddForm(false)
    onSiteChange(site)
  }

  const handleSelectSite = (site: Site) => {
    setActiveSite(site.id)
    onSiteChange(site)
  }

  const handleDeleteSite = (siteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this site? All submission history will be lost.')) {
      return
    }
    
    deleteSite(siteId)
    const remaining = getAllSites()
    setSites(remaining)
    
    if (activeSite?.id === siteId) {
      onSiteChange(remaining.length > 0 ? remaining[0] : null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Sites
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Site
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <div className="space-y-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
            <Label htmlFor="newSiteName">Site Name</Label>
            <div className="flex gap-2">
              <Input
                id="newSiteName"
                placeholder="My Website"
                value={newSiteName}
                onChange={(e) => setNewSiteName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateSite()}
              />
              <Button onClick={handleCreateSite} disabled={!newSiteName.trim()}>
                Create
              </Button>
            </div>
          </div>
        )}

        {sites.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No sites yet. Add your first site to get started.
          </p>
        ) : (
          <div className="space-y-2">
            {sites.map((site) => (
              <div
                key={site.id}
                onClick={() => handleSelectSite(site)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  activeSite?.id === site.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {activeSite?.id === site.id && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                  <div>
                    <p className="font-medium">{site.name}</p>
                    <p className="text-xs text-gray-500">
                      {site.settings.host || 'No domain configured'}
                      {' • '}
                      {Object.keys(site.urls).length} URLs
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-red-600"
                  onClick={(e) => handleDeleteSite(site.id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
