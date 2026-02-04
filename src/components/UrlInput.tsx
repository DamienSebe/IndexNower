import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { parseSitemap, extractUrlsFromText } from '@/lib/sitemap'
import { Link, FileText, Loader2 } from 'lucide-react'

interface UrlInputProps {
  onUrlsLoaded: (urls: string[]) => void
}

export function UrlInput({ onUrlsLoaded }: UrlInputProps) {
  const [sitemapUrl, setSitemapUrl] = useState('')
  const [manualUrls, setManualUrls] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState('sitemap')

  const handleLoadSitemap = async () => {
    if (!sitemapUrl.trim()) {
      setError('Please enter a sitemap URL')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const urls = await parseSitemap(sitemapUrl)
      onUrlsLoaded(urls.map((u) => u.loc))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load sitemap')
    } finally {
      setLoading(false)
    }
  }

  const handleLoadManual = () => {
    const urls = extractUrlsFromText(manualUrls)
    if (urls.length === 0) {
      setError('No valid URLs found')
      return
    }
    setError(null)
    onUrlsLoaded(urls)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Add URLs
        </CardTitle>
        <CardDescription className="text-gray-500">
          Import URLs from a sitemap or enter them manually
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sitemap">
              <FileText className="h-4 w-4 mr-2" />
              Sitemap
            </TabsTrigger>
            <TabsTrigger value="manual">
              <Link className="h-4 w-4 mr-2" />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sitemap" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sitemapUrl">Sitemap URL</Label>
              <Input
                id="sitemapUrl"
                placeholder="https://example.com/sitemap.xml"
                value={sitemapUrl}
                onChange={(e) => setSitemapUrl(e.target.value)}
              />
            </div>
            <Button onClick={handleLoadSitemap} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load Sitemap'
              )}
            </Button>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manualUrls">URLs (one per line)</Label>
              <Textarea
                id="manualUrls"
                placeholder="https://example.com/page1&#10;https://example.com/page2&#10;https://example.com/page3"
                value={manualUrls}
                onChange={(e) => setManualUrls(e.target.value)}
                rows={8}
              />
            </div>
            <Button onClick={handleLoadManual} className="w-full">
              Load URLs
            </Button>
          </TabsContent>
        </Tabs>

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}
      </CardContent>
    </Card>
  )
}
