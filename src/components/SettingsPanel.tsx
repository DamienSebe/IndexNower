import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { getSiteSettings, updateSiteSettings } from '@/lib/storage'
import type { SiteSettings } from '@/types'
import { Settings as SettingsIcon, Save } from 'lucide-react'

interface SettingsPanelProps {
  siteId: string
}

export function SettingsPanel({ siteId }: SettingsPanelProps) {
  const [settings, setSettings] = useState<SiteSettings>({
    apiKey: '',
    keyLocation: '',
    host: '',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = getSiteSettings(siteId)
    setSettings(stored)
  }, [siteId])

  const handleSave = () => {
    updateSiteSettings(siteId, settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleChange = (field: keyof SiteSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          Settings
        </CardTitle>
        <CardDescription className="text-gray-500">
          Configure your IndexNow API credentials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="Your IndexNow API key"
            value={settings.apiKey}
            onChange={(e) => handleChange('apiKey', e.target.value)}
          />
          <p className="text-xs text-gray-500">
            Generate a key at indexnow.org or use any unique string
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="host">Host Domain</Label>
          <Input
            id="host"
            placeholder="example.com"
            value={settings.host}
            onChange={(e) => handleChange('host', e.target.value)}
          />
          <p className="text-xs text-gray-500">
            Your website domain without protocol (e.g., example.com)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="keyLocation">Key File Location (optional)</Label>
          <Input
            id="keyLocation"
            placeholder="https://example.com/your-key.txt"
            value={settings.keyLocation}
            onChange={(e) => handleChange('keyLocation', e.target.value)}
          />
          <p className="text-xs text-gray-500">
            URL where your key file is hosted. Defaults to https://[host]/[apiKey].txt
          </p>
        </div>

        <Button onClick={handleSave} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {saved ? 'Saved!' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  )
}
