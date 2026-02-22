/**
 * Единый serverless endpoint для Kaiten API: обрабатывает /api/kaiten и /api/kaiten/*.
 * Путь извлекается из req.url. Токен только из process.env.KAITEN_TOKEN.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'

function getPathAndQuery(url: string | undefined): { path: string; query: string } {
  if (!url) return { path: '', query: '' }
  const pathname = url.startsWith('http') ? new URL(url).pathname : url.split('?')[0]
  const match = pathname.match(/\/api\/kaiten\/?(.*)/)
  const path = (match && match[1]) ? match[1].replace(/^\/+/, '') : ''
  const query = url.includes('?') ? '?' + url.split('?').slice(1).join('?') : ''
  return { path, query }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Kaiten-Domain')
    return res.status(204).end()
  }

  const { path, query } = getPathAndQuery(req.url)
  const base = `https://onyagency.kaiten.ru/api/v1`
  const pathPart = path ? `/${path}` : ''
  const kaitenUrl = `${base}${pathPart}${query}`

  const token = process.env.KAITEN_TOKEN ?? ''
  if (!token) {
    res.status(500).setHeader('Content-Type', 'application/json')
    return res.send(JSON.stringify({ error: 'KAITEN_TOKEN not configured' }))
  }

  const method = req.method ?? 'GET'
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

  const response = await fetch(kaitenUrl, init)
  const text = await response.text()
  res.status(response.status).setHeader('Content-Type', response.headers.get('content-type') ?? 'application/json')
  res.send(text)
}
