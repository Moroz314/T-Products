import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: ['team-26-76jbizna.hack.prodcontest.ru',],
    proxy: {
      // Прокси для всех API путей
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // Прокси для остальных путей
      '/user': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/merchant': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/products': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/orders': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/order': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/cart': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/users': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/order-items': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [react(), tailwindcss()],
})
