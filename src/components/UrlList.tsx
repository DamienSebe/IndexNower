import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { UrlEntry } from '@/types'
import { List, Trash2, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react'

interface UrlListProps {
  urls: UrlEntry[]
  onClear: () => void
  onRemove: (url: string) => void
}

function getStatusBadge(status: UrlEntry['status']) {
  switch (status) {
    case 'submitted':
      return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" />Submitted</Badge>
    case 'pending':
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
    case 'changed':
      return <Badge variant="warning"><RefreshCw className="h-3 w-3 mr-1" />Changed</Badge>
    case 'error':
      return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function UrlList({ urls, onClear, onRemove }: UrlListProps) {
  const pendingCount = urls.filter((u) => u.status === 'pending' || u.status === 'changed').length
  const submittedCount = urls.filter((u) => u.status === 'submitted').length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              URL Queue
            </CardTitle>
            <CardDescription className="text-gray-500">
              {urls.length} URLs total • {pendingCount} to submit • {submittedCount} already submitted
            </CardDescription>
          </div>
          {urls.length > 0 && (
            <Button variant="outline" size="sm" onClick={onClear}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {urls.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No URLs loaded. Import from a sitemap or add manually.
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {urls.map((entry) => (
              <div
                key={entry.url}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-medium truncate">{entry.url}</p>
                  {entry.lastSubmitted && (
                    <p className="text-xs text-gray-500">
                      Last submitted: {new Date(entry.lastSubmitted).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(entry.status)}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onRemove(entry.url)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
