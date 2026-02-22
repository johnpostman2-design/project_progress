import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
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
        rewrite: (path) => path.replace(/^\/api\/kaiten/, '/api/v1'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Токен только из env сервера (не из клиентского бандла)
            const serverToken = process.env.VITE_KAITEN_TOKEN
            if (serverToken) {
              proxyReq.setHeader('Authorization', `Bearer ${serverToken}`)
            }
            const kaitenDomain = req.headers['x-kaiten-domain'] as string
            if (kaitenDomain && kaitenDomain !== 'onyagency') {
              proxyReq.setHeader('Host', `${kaitenDomain}.kaiten.ru`)
            }
          })
          proxy.on('error', (err) => {
            console.error('[Vite Proxy] Error:', err)
          })
        },
      },
    },
  },
})
