import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/kaiten': {
        target: 'https://onyagency.kaiten.ru',
        changeOrigin: true,
        secure: true,
        ws: false,
        rewrite: (path) => {
          const rewritten = path.replace(/^\/api\/kaiten/, '/api/v1')
          console.log('[Vite Proxy] rewrite:', { original: path, rewritten })
          return rewritten
        },
        configure: (proxy, _options) => {
          console.log('[Vite Proxy] Proxy configured for /api/kaiten')
          
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            const authHeader = req.headers.authorization
            if (authHeader) {
              proxyReq.setHeader('Authorization', authHeader)
            }
            
            const kaitenDomain = req.headers['x-kaiten-domain'] as string
            if (kaitenDomain && kaitenDomain !== 'onyagency') {
              // Меняем Host заголовок для другого домена
              proxyReq.setHeader('Host', `${kaitenDomain}.kaiten.ru`)
            }
            
            console.log('[Vite Proxy] Request:', {
              method: req.method,
              url: req.url,
              path: proxyReq.path,
              host: proxyReq.getHeader('host'),
              hasAuth: !!authHeader,
              domain: kaitenDomain || 'onyagency',
            })
          })
          
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('[Vite Proxy] Response:', {
              status: proxyRes.statusCode,
              method: req.method,
              url: req.url,
            })
          })
          
          proxy.on('error', (err, req, res) => {
            console.error('[Vite Proxy] Error:', err)
          })
        },
      },
    },
  },
})
