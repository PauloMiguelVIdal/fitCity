import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
      server: {
       allowedHosts: true,
      },
  plugins: [
    react(),
        tailwindcss(),

    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'FitCity',
        short_name: 'FitCity',
          start_url: '/',           // 🔥 FALTA ISSO
  scope: '/',               // 🔥 FALTA ISSO
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#350973',
        theme_color: '#350973',
        icons: [
          { src: '/assets/logoApp.png', sizes: '192x192', type: 'image/png' },
          { src: '/assets/logoApp.png', sizes: '512x512', type: 'image/png' },
          { src: '/assets/logoApp.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
workbox: {
  globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
  cleanupOutdatedCaches: true,
  clientsClaim: true,
  skipWaiting: true,
},
    }),
  ],
})
