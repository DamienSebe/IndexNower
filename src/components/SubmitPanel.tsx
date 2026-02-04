import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { submitToIndexNow } from '@/lib/indexnow'
import { getSiteSettings } from '@/lib/storage'
import type { UrlEntry } from '@/types'
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface SubmitPanelProps {
  siteId: string
  urls: UrlEntry[]
  onSubmitComplete: (submittedUrls: string[]) => void
}

export function SubmitPanel({ siteId, urls, onSubmitComplete }: SubmitPanelProps) {
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const urlsToSubmit = urls.filter((u) => u.status === 'pending' || u.status === 'changed')

  const handleSubmit = async () => {
    const settings = getSiteSettings(siteId)
    
    if (!settings.apiKey || !settings.host) {
      setResult({ success: false, message: 'Please configure your API key and host in Settings' })
      return
    }

    setSubmitting(true)
    setResult(null)

    const urlStrings = urlsToSubmit.map((u) => u.url)
    const submitResult = await submitToIndexNow(urlStrings, settings)

    setResult({ success: submitResult.success, message: submitResult.message })
    setSubmitting(false)

    if (submitResult.success) {
      onSubmitComplete(urlStrings)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Submit to IndexNow
        </CardTitle>
        <CardDescription className="text-gray-500">
          {urlsToSubmit.length} URLs ready to submit
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleSubmit}
          disabled={submitting || urlsToSubmit.length === 0}
          className="w-full"
          size="lg"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit {urlsToSubmit.length} URLs
            </>
          )}
        </Button>

        {result && (
          <div
            className={`flex items-center gap-2 p-4 rounded-lg ${
              result.success
                ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200'
                : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'
            }`}
          >
            {result.success ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <p className="text-sm">{result.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
