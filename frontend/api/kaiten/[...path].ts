/**
 * Прокси к Kaiten API для обхода CORS на проде.
 * Браузер вызывает наш домен (/api/kaiten/...), сервер — Kaiten.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Kaiten-Domain')
    return res.status(204).end()
  }

  let domain = (req.headers['x-kaiten-domain'] as string) || 'onyagency'
  domain = (domain || '').trim().replace(/\.kaiten\.ru$/i, '').split('.')[0] || 'onyagency'
  const auth = (req.headers['authorization'] ?? req.headers['Authorization']) as string
  if (!auth) {
    return res.status(401).json({ error: 'Missing Authorization header' })
  }

  // Путь: на Vercel req.query.path может быть пустым — извлекаем из req.url/pathname
  let path = Array.isArray(req.query.path) ? req.query.path.join('/') : (req.query.path as string) || ''
  if (!path) {
    const rawUrl = req.url || (req as unknown as { path?: string }).path || ''
    const pathname = rawUrl.startsWith('http') ? new URL(rawUrl).pathname : rawUrl
    const match = pathname.match(/\/api\/kaiten\/([^?]*)/)
    if (match) path = match[1]
  }
  path = path.replace(/^\/+/, '') // убрать ведущие слеши
  const queryKeys = Object.keys(req.query).filter((k) => k !== 'path')
  const query = queryKeys.length
    ? '?' + queryKeys.map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(String(req.query[k]))}`).join('&')
    : (req.url && req.url.includes('?') ? '?' + req.url.split('?')[1] : '')

  const targetUrl = `https://${domain}.kaiten.ru/api/v1/${path}${query}`

  const headers: Record<string, string> = {
    Authorization: auth,
    Accept: 'application/json',
    Host: `${domain}.kaiten.ru`,
  }
  if (req.headers['content-type']) {
    headers['Content-Type'] = req.headers['content-type'] as string
  }

  const init: RequestInit = {
    method: req.method || 'GET',
    headers,
  }
  if (req.method && !['GET', 'HEAD'].includes(req.method) && req.body) {
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
