/**
 * Serverless /api/kaiten — запросы к Kaiten API.
 * Токен только из process.env.KAITEN_TOKEN. Заголовок Authorization с клиента не принимается.
 * Домен из заголовка X-Kaiten-Domain.
 */
export default async function handler(req, res) {
  const path = (req.query?.path ?? req.url?.replace(/^.*\/api\/kaiten\/?/, '').split('?')[0] ?? '').replace(/^\/+/, '')
  const domain = (req.headers?.['x-kaiten-domain'] ?? 'onyagency').trim().replace(/\.kaiten\.ru$/i, '').split('.')[0] || 'onyagency'
  const base = process.env.KAITEN_API_BASE || `https://${domain}.kaiten.ru/api/v1`
  const url = path ? `${base}/${path}` : base

  const token = process.env.KAITEN_TOKEN || ''
  if (!token) {
    res.status(500).setHeader('Content-Type', 'application/json')
    return res.send(JSON.stringify({ error: 'KAITEN_TOKEN not configured' }))
  }
  const auth = `Bearer ${token}`

  const method = req.method || 'GET'
  const headers = {
    Authorization: auth,
    Accept: 'application/json',
  }
  if (['POST', 'PUT', 'PATCH'].includes(method) && req.body != null) {
    headers['Content-Type'] = 'application/json'
  }
  const fetchOpts = { method, headers }
  if (['POST', 'PUT', 'PATCH'].includes(method) && req.body != null) {
    fetchOpts.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
  }

  const response = await fetch(url, fetchOpts)
  const text = await response.text()
  res.status(response.status).setHeader('Content-Type', response.headers.get('content-type') || 'application/json')
  res.send(text)
}
