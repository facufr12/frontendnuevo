import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    // Proxy deshabilitado - usando URLs directas del backend
    // proxy: {
    //   '/api': {
    //     target: 'https://wspflows.cober.online',
    //     changeOrigin: true,
    //     secure: true,
    //     configure: (proxy) => {
    //       proxy.on('proxyReq', (proxyReq) => {
    //         // Agregar headers necesarios
    //         proxyReq.setHeader('Origin', 'https://wspflows.cober.online');
    //         proxyReq.setHeader('Referer', 'https://wspflows.cober.online');
    //       });
    //     }
    //   }
    // }
  }
})
