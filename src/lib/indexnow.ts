import type { Settings } from '@/types'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || ''

function apiUrl(path: string): string {
  if (!API_BASE_URL) return path
  const base = API_BASE_URL.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

export interface SubmitResult {
  success: boolean
  message: string
  submittedCount: number
}

export async function submitToIndexNow(
  urls: string[],
  settings: Settings
): Promise<SubmitResult> {
  if (!settings.apiKey) {
    return { success: false, message: 'API key is required', submittedCount: 0 }
  }
  
  if (!settings.host) {
    return { success: false, message: 'Host is required', submittedCount: 0 }
  }
  
  if (urls.length === 0) {
    return { success: false, message: 'No URLs to submit', submittedCount: 0 }
  }

  const batchSize = 10000
  let totalSubmitted = 0
  
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize)
    
    const payload = {
      host: settings.host,
      key: settings.apiKey,
      keyLocation: settings.keyLocation || `https://${settings.host}/${settings.apiKey}.txt`,
      urlList: batch,
    }
    
    try {
      const response = await fetch(apiUrl('/api/submit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      if (response.ok || response.status === 200 || response.status === 202) {
        totalSubmitted += batch.length
      } else {
        const errorText = await response.text()
        return {
          success: false,
          message: `IndexNow API error: ${response.status} - ${errorText}`,
          submittedCount: totalSubmitted,
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        submittedCount: totalSubmitted,
      }
    }
  }
  
  return {
    success: true,
    message: `Successfully submitted ${totalSubmitted} URLs`,
    submittedCount: totalSubmitted,
  }
}

export async function fetchPageContent(url: string): Promise<string | null> {
  try {
    const response = await fetch(apiUrl(`/api/fetch-content?url=${encodeURIComponent(url)}`))
    if (!response.ok) {
      return null
    }
    return await response.text()
  } catch {
    return null
  }
}
