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

  const domain = (req.headers['x-kaiten-domain'] as string) || 'onyagency'
  const auth = req.headers['authorization'] as string
  if (!auth) {
    return res.status(401).json({ error: 'Missing Authorization header' })
  }

  const pathSeg = req.query.path
  const path = Array.isArray(pathSeg) ? pathSeg.join('/') : (pathSeg as string) || ''
  const queryKeys = Object.keys(req.query).filter((k) => k !== 'path')
  const query = queryKeys.length
    ? '?' + queryKeys.map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(String(req.query[k]))}`).join('&')
    : ''

  const targetUrl = `https://${domain}.kaiten.ru/api/v1/${path}${query}`

  const headers: Record<string, string> = {
    Authorization: auth,
    Accept: 'application/json',
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
