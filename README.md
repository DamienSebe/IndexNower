# IndexNower (IndexNow URL Submitter)

IndexNower is a simple self-hosted web app to:

- Submit URLs to **IndexNow** (used by search engines like **Bing** and **Yandex**) for faster indexing.
- Pull URLs from a sitemap.
- Track which URLs were submitted and detect content changes.

This project is designed to be **free**, **public**, and easy to run locally or self-host.

## Quick start (TL;DR)

1. Generate an IndexNow key.
2. Upload `/<KEY>.txt` to your site root (and confirm it loads).
3. Run IndexNower locally: `npm install` → `npm run dev`.
4. Paste URLs and submit.

---
 
## What is IndexNow?

**IndexNow** is a protocol that lets you instantly notify participating search engines when:

- A page was created
- A page was updated
- A page was deleted

Instead of waiting for crawlers to discover changes, you can “push” URLs to IndexNow.

### Which search engines use IndexNow?

IndexNow is commonly associated with:

- **Bing**
- **Yandex**

(Availability and support can change over time—always check the official IndexNow documentation if you need the latest list.)

---

## Step-by-step: generate an IndexNow key (Bing / IndexNow)

You have two safe options:

### Option A: Generate your own key (works everywhere)

1. Create a random string (recommended 32+ characters).
2. Save it as a file named `<KEY>.txt`.
3. Put that file at your website root so it is reachable at:
  - `https://yourdomain.com/<KEY>.txt`

#### Verify your key file (do this before submitting)

1. Open the key file URL in an incognito/private window:
   - `https://yourdomain.com/<KEY>.txt`
2. Confirm:
   - The page loads with **HTTP 200**
   - The response body is **exactly** your key (no extra HTML, no spaces)

If your CMS forces HTML pages, you must upload a plain `.txt` file that is served as raw text.

### Option B: Use Bing Webmaster Tools (if available for your account)

Bing Webmaster Tools sometimes provides an IndexNow area that can help you generate or manage a key. If you see an IndexNow key generation workflow in your Bing Webmaster Tools UI, you can use it.

If you don’t see it (or you’re unsure), use **Option A** above.

#### Bing site verification (recommended)

Even though IndexNow uses a key file for domain control, you should also add your site to **Bing Webmaster Tools** and verify ownership. This helps with diagnostics and reporting.

---

## Local setup (recommended first)

### Prerequisites

- Node.js 18+ (Node 20+ recommended)
- npm

### Install

1. Install dependencies:

```bash
npm install
```

2. Start the app (client + API server):

```bash
npm run dev
```

3. Open the app:

- Frontend: `http://localhost:5173`
- API server: `http://localhost:3001`

---

## Environment variables

This project supports the following environment variables:

- `VITE_API_BASE_URL`
  - **Empty by default** for local dev.
  - Set this when your frontend and API are hosted on different domains.
  - Example: `VITE_API_BASE_URL=https://your-api.example.com`

- `CORS_ORIGINS` (API server)
  - Optional comma-separated list of allowed frontend origins.
  - Example:
    - `CORS_ORIGINS=https://your-netlify-site.netlify.app,https://yourdomain.com`
  - If empty, the API allows requests from any origin.

There is an `.env.example` in the repo you can copy.

---

## Using the app (step-by-step)

1. Create/select a site.
2. Open **Settings** and set:
  - **API Key**: your IndexNow key
  - **Host Domain**: e.g. `example.com`
  - **Key File Location (optional)**: defaults to `https://<host>/<key>.txt`
3. Add URLs (paste list or import via sitemap depending on your workflow).
4. Click **Submit to IndexNow**.

### What to put in Settings

- **API Key**
  - Your IndexNow key (the same value that is inside your `/<KEY>.txt` file)
- **Host Domain**
  - Your domain without protocol
  - Example: `example.com` (not `https://example.com`)
- **Key File Location** (optional)
  - If you host the key somewhere else, paste the exact URL here

---

## Where data is stored (privacy)

IndexNower stores your site settings and submission history in your browser’s **localStorage**.

- Your IndexNow key is stored locally in the browser profile.
- If you share a computer/browser profile, treat it as sensitive.

---

## Hosting / Deployment

This repo contains:

- A Vite + React frontend
- A small Express API server in `server/index.ts`

**Important:** Netlify/Vercel can host the frontend easily, but this project also needs an API server for:

- Submitting to `https://api.indexnow.org/IndexNow`
- Fetching sitemap XML / page content (used for change detection)

You have two main deployment approaches.

---

### Approach 1 (easiest): Frontend on Netlify/Vercel + API server on Render/Railway/Fly

1. Deploy the **frontend** to Netlify or Vercel.
2. Deploy the **Express server** to a Node hosting platform (Render, Railway, Fly.io, etc.).
3. Configure the frontend to call the hosted API.

#### Notes

- Today the frontend calls relative endpoints like `/api/submit`.
- In production, you’ll typically want the frontend to call something like `https://your-api.example.com/api/submit`.
- This repo already supports that via `VITE_API_BASE_URL`.

#### Hosting the API server (Render example)

The API server is in `server/index.ts` and listens on port `3001` locally.

On platforms like Render/Railway/Fly, you typically:

1. Create a new **Web Service** from this repo.
2. Set the build command to:

```bash
npm install
```

3. Set the start command to:

```bash
npx tsx server/index.ts
```

4. Set the service to use the platform-provided `PORT`.

Note: the current server code uses a hardcoded `3001`. If you want the API server to run on Render/Vercel-friendly port binding, tell me and I’ll adjust it to `process.env.PORT` while keeping local dev behavior.

---

### Approach 2: Serverless functions on Netlify/Vercel

You can convert these API endpoints into serverless functions:

- `GET /api/sitemap`
- `POST /api/submit`
- `GET /api/fetch-content`

This works well but requires code changes (moving Express routes into Netlify Functions or Vercel Functions). If you want this, tell me which platform you prefer and I’ll refactor it.

---

## Netlify (frontend) — step-by-step

1. Push this repo to GitHub.
2. In Netlify: **Add new site** → **Import from Git**.
3. Build settings:
  - Build command: `npm run build`
  - Publish directory: `dist`
4. Deploy.

If you keep the API server separate (Approach 1), add rewrites/proxy rules or configure the frontend to use your API base URL.

### Netlify environment variable

If your API is hosted at (example) `https://your-api.example.com`, set:

- `VITE_API_BASE_URL` = `https://your-api.example.com`

---

## Vercel (frontend) — step-by-step

1. Push this repo to GitHub.
2. In Vercel: **New Project** → import the repo.
3. Framework preset: **Vite** (Vercel usually detects this automatically).
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy.

If you keep the API server separate (Approach 1), configure the frontend to talk to your API host.

### Vercel environment variable

Set this in Project Settings → Environment Variables:

- `VITE_API_BASE_URL` = `https://your-api.example.com`

---

## Security notes (read if deploying publicly)

The API server has endpoints that fetch arbitrary URLs (sitemaps / page content). If you deploy the API publicly, consider:

- Restricting allowed domains
- Adding rate limiting
- Adding authentication

For local/self-host use, it’s typically fine.

---

## Troubleshooting

### “IndexNow API error” or “403/400”

- Confirm `https://<host>/<key>.txt` loads publicly and returns the key as plain text.
- Confirm `Host Domain` is the bare domain (no protocol).
- Confirm URLs you submit belong to the same host.

### “Network error”

- Locally: confirm the API server is running at `http://localhost:3001`.
- In hosted mode: confirm `VITE_API_BASE_URL` points to your API server and that CORS allows your frontend domain.

---

## SEO / Common searches this helps with

If you found this by searching:

- “how to submit urls to bing”
- “bing indexnow submit urls”
- “how to submit urls to yandex”
- “indexnow key file location”
- “instant indexing bing”

…this app is meant to make that workflow simple and repeatable.

---

## Tip jar

If this helped you, you can leave a tip here:

https://buymeacoffee.com/damiensebe
