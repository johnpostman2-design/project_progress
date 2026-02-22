/**
 * Прокси: /api/kaiten/xxx -> внутренний вызов /api/kaiten?path=xxx.
 * Токен не принимается с клиента; kaiten.js использует только KAITEN_TOKEN.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Kaiten-Domain')
    return res.status(204).end()
  }

  let domain = (req.headers['x-kaiten-domain'] as string) || 'onyagency'
  domain = (domain || '').trim().replace(/\.kaiten\.ru$/i, '').split('.')[0] || 'onyagency'

  let path = Array.isArray(req.query.path) ? req.query.path.join('/') : (req.query.path as string) || ''
  if (!path && req.url) {
    const pathname = req.url.startsWith('http') ? new URL(req.url).pathname : req.url
    const match = pathname.match(/\/api\/kaiten\/([^?]*)/)
    if (match) path = match[1]
  }
  path = (path || '').replace(/^\/+/, '')
  const queryKeys = Object.keys(req.query || {}).filter((k) => k !== 'path')
  const query = queryKeys.length
    ? '&' + queryKeys.map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(String(req.query[k]))}`).join('&')
    : (req.url && req.url.includes('?') ? '&' + req.url.split('?')[1] : '')

  const origin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-host'] ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}` : 'http://localhost:5173')
  const apiUrl = `${origin}/api/kaiten?path=${encodeURIComponent(path)}${query}`

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Kaiten-Domain': domain,
  }
  if (req.headers['content-type']) {
    headers['Content-Type'] = req.headers['content-type'] as string
  }
  const init: RequestInit = {
    method: req.method || 'GET',
    headers,
  }
  if (req.method && !['GET', 'HEAD'].includes(req.method) && req.body !== undefined) {
    init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
  }

  try {
    const response = await fetch(apiUrl, init)
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
