/**
 * Прокси к Kaiten API. Только KAITEN_API_BASE и KAITEN_TOKEN.
 * Timeout 8s, in-memory cache 60s только для GET /spaces, лог запросов.
 */
const REQUEST_TIMEOUT_MS = 8000
const CACHE_TTL_MS = 60000

type CacheEntry = { text: string; contentType: string; expiresAt: number }
const cache = new Map<string, CacheEntry>()

function isCacheable(method: string, path: string): boolean {
  if (method !== 'GET') return false
  return path === 'spaces'
}

function logRequest(
  method: string,
  path: string,
  status: number,
  durationMs: number,
  errorMessage?: string
): void {
  const pathForLog = path ? `/${path}` : '/'
  const errPart = errorMessage ? ` ${errorMessage}` : ''
  console.log(`[Kaiten] ${method} ${pathForLog} → ${status} (${durationMs}ms)${errPart}`)
}

export default async function handler(req, res) {
  const start = Date.now()

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(204).end()
  }

  const base = process.env.KAITEN_API_BASE
  const token = process.env.KAITEN_TOKEN
  if (!base || !token) {
    res.status(500).setHeader('Content-Type', 'application/json')
    return res.send(JSON.stringify({ error: 'KAITEN_API_BASE or KAITEN_TOKEN not configured' }))
  }

  const path = (req.url ?? '').split('?')[0].replace(/^\/api\/kaiten\/?/, '').replace(/^\/+/, '')
  const query = (req.url ?? '').includes('?') ? '?' + (req.url ?? '').split('?').slice(1).join('?') : ''
  const kaitenUrl = path ? `${base.replace(/\/$/, '')}/${path}${query}` : `${base}${query}`

  const method = req.method ?? 'GET'

  // Кэш: только GET /spaces и GET /spaces/:id/boards
  if (isCacheable(method, path)) {
    const entry = cache.get(kaitenUrl)
    if (entry && entry.expiresAt > Date.now()) {
      res.status(200).setHeader('Content-Type', entry.contentType)
      res.send(entry.text)
      logRequest(method, path, 200, Date.now() - start)
      return
    }
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  }
  if (['POST', 'PUT', 'PATCH'].includes(method) && req.body != null) {
    headers['Content-Type'] = 'application/json'
  }
  const init: RequestInit = { method, headers }
  if (['POST', 'PUT', 'PATCH'].includes(method) && req.body != null) {
    init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  init.signal = controller.signal

  try {
    const response = await fetch(kaitenUrl, init)
    clearTimeout(timeoutId)
    const text = await response.text()

    if (isCacheable(method, path) && response.ok) {
      cache.set(kaitenUrl, {
        text,
        contentType: response.headers.get('content-type') ?? 'application/json',
        expiresAt: Date.now() + CACHE_TTL_MS,
      })
    }

    res.status(response.status).setHeader(
      'Content-Type',
      response.headers.get('content-type') ?? 'application/json'
    )
    res.send(text)
    logRequest(method, path, response.status, Date.now() - start)
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof Error && err.name === 'AbortError') {
      res.status(504).setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify({ error: 'Kaiten request timeout' }))
      logRequest(method, path, 504, Date.now() - start, 'timeout')
      return
    }
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(502).setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify({ error: message }))
    logRequest(method, path, 502, Date.now() - start, message)
  }
}
