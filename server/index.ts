import express from 'express'
import cors from 'cors'
import { parseString } from 'xml2js'

const app = express()
const PORT = Number(process.env.PORT) || 3001

const CORS_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (CORS_ORIGINS.length === 0) return callback(null, true)
      if (CORS_ORIGINS.includes(origin)) return callback(null, true)
      return callback(new Error('CORS origin not allowed'))
    },
  })
)
app.use(express.json({ limit: '10mb' }))

interface SitemapUrl {
  loc: string[]
  lastmod?: string[]
  changefreq?: string[]
  priority?: string[]
}

interface SitemapUrlset {
  urlset?: {
    url?: SitemapUrl[]
  }
  sitemapindex?: {
    sitemap?: Array<{ loc: string[] }>
  }
}

app.get('/api/sitemap', async (req, res) => {
  const sitemapUrl = req.query.url as string

  if (!sitemapUrl) {
    res.status(400).json({ error: 'URL parameter is required' })
    return
  }

  try {
    const response = await fetch(sitemapUrl)
    if (!response.ok) {
      res.status(response.status).json({ error: `Failed to fetch sitemap: ${response.statusText}` })
      return
    }

    const xml = await response.text()
    
    parseString(xml, async (err: Error | null, result: SitemapUrlset) => {
      if (err) {
        res.status(400).json({ error: 'Failed to parse sitemap XML' })
        return
      }

      const urls: Array<{ loc: string; lastmod?: string; changefreq?: string; priority?: string }> = []

      if (result.sitemapindex?.sitemap) {
        for (const sitemap of result.sitemapindex.sitemap) {
          if (sitemap.loc?.[0]) {
            try {
              const subResponse = await fetch(sitemap.loc[0])
              if (subResponse.ok) {
                const subXml = await subResponse.text()
                parseString(subXml, (subErr: Error | null, subResult: SitemapUrlset) => {
                  if (!subErr && subResult.urlset?.url) {
                    for (const url of subResult.urlset.url) {
                      urls.push({
                        loc: url.loc[0],
                        lastmod: url.lastmod?.[0],
                        changefreq: url.changefreq?.[0],
                        priority: url.priority?.[0],
                      })
                    }
                  }
                })
              }
            } catch {
              console.error(`Failed to fetch sub-sitemap: ${sitemap.loc[0]}`)
            }
          }
        }
      }

      if (result.urlset?.url) {
        for (const url of result.urlset.url) {
          urls.push({
            loc: url.loc[0],
            lastmod: url.lastmod?.[0],
            changefreq: url.changefreq?.[0],
            priority: url.priority?.[0],
          })
        }
      }

      res.json({ urls })
    })
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch sitemap: ${error instanceof Error ? error.message : 'Unknown error'}` })
  }
})

app.post('/api/submit', async (req, res) => {
  const { host, key, keyLocation, urlList } = req.body

  if (!host || !key || !urlList || !Array.isArray(urlList)) {
    res.status(400).json({ error: 'Missing required fields: host, key, urlList' })
    return
  }

  try {
    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        host,
        key,
        keyLocation: keyLocation || `https://${host}/${key}.txt`,
        urlList,
      }),
    })

    if (response.ok || response.status === 200 || response.status === 202) {
      res.json({ success: true, message: 'URLs submitted successfully' })
    } else {
      const errorText = await response.text()
      res.status(response.status).json({ error: errorText })
    }
  } catch (error) {
    res.status(500).json({ error: `Failed to submit to IndexNow: ${error instanceof Error ? error.message : 'Unknown error'}` })
  }
})

app.get('/api/fetch-content', async (req, res) => {
  const url = req.query.url as string

  if (!url) {
    res.status(400).json({ error: 'URL parameter is required' })
    return
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'IndexNower/1.0',
      },
    })

    if (!response.ok) {
      res.status(response.status).send('')
      return
    }

    const content = await response.text()
    res.send(content)
  } catch {
    res.status(500).send('')
  }
})

app.listen(PORT, () => {
  console.log(`IndexNower API server running on http://localhost:${PORT}`)
})
