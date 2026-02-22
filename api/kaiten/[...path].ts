/**
 * Прокси к Kaiten API (обход CORS).
 * Используется, когда в Vercel Root Directory = корень репо.
 */
export default async function handler(req: { method?: string; headers: Record<string, string | string[] | undefined>; query: Record<string, string | string[] | undefined>; body?: unknown }, res: { setHeader: (k: string, v: string) => void; status: (n: number) => { end: () => void; json: (o: object) => void; send: (s: string) => void }; end: () => void; json: (o: object) => void; send: (s: string) => void }) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Kaiten-Domain')
    return res.status(204).end()
  }

  let domain = (Array.isArray(req.headers['x-kaiten-domain']) ? req.headers['x-kaiten-domain'][0] : req.headers['x-kaiten-domain']) as string || 'onyagency'
  domain = (domain || '').trim().replace(/\.kaiten\.ru$/i, '').split('.')[0] || 'onyagency'
  const auth = (Array.isArray(req.headers['authorization']) ? req.headers['authorization'][0] : req.headers['authorization']) || (Array.isArray(req.headers['Authorization']) ? req.headers['Authorization'][0] : req.headers['Authorization']) as string
  if (!auth) {
    return res.status(401).json({ error: 'Missing Authorization header' })
  }

  let path = Array.isArray(req.query.path) ? req.query.path.join('/') : (req.query.path as string) || ''
  if (!path && (req as { url?: string }).url) {
    const rawUrl = (req as { url: string }).url
    const pathname = rawUrl.startsWith('http') ? new URL(rawUrl).pathname : rawUrl
    const match = pathname.match(/\/api\/kaiten\/([^?]*)/)
    if (match) path = match[1]
  }
  path = (path || '').replace(/^\/+/, '')
  const queryKeys = Object.keys(req.query).filter((k) => k !== 'path')
  const query = queryKeys.length
    ? '?' + queryKeys.map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(String(req.query[k]))}`).join('&')
    : ((req as { url?: string }).url && (req as { url: string }).url.includes('?') ? '?' + (req as { url: string }).url.split('?')[1] : '')

  const targetUrl = `https://${domain}.kaiten.ru/api/v1/${path}${query}`

  const headers: Record<string, string> = {
    Authorization: auth,
    Accept: 'application/json',
    Host: `${domain}.kaiten.ru`,
    'User-Agent': (req.headers['user-agent'] as string) || 'Mozilla/5.0 (compatible; KaitenProxy/1.0)',
    Origin: `https://${domain}.kaiten.ru`,
    Referer: `https://${domain}.kaiten.ru/`,
  }
  const ct = req.headers['content-type']
  if (ct) headers['Content-Type'] = Array.isArray(ct) ? ct[0] : ct

  const init: RequestInit = {
    method: req.method || 'GET',
    headers,
  }
  if (req.method && !['GET', 'HEAD'].includes(req.method) && req.body !== undefined) {
    init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
  }

  try {
    const response = await fetch(targetUrl, init)
    const contentType = response.headers.get('content-type') || 'application/json'
    const data = await response.text()
    res.status(response.status).setHeader('Content-Type', contentType)
    return res.send(data)
  } catch (e) {
    console.error('[Kaiten proxy]', e)
    return res.status(502).json({
      error: 'Proxy error',
      details: e instanceof Error ? e.message : String(e),
    })
  }
}
