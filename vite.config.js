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
        name: 'FitCity Spike',
        short_name: 'FitCity',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#350973',
        theme_color: '#350973',
        icons: [
          { src: '/assets/logo Joguinho.png', sizes: '192x192', type: 'image/png' },
          { src: '/assets/logo Joguinho.png', sizes: '512x512', type: 'image/png' },
          { src: '/assets/logo Joguinho.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html}'],
      },
    }),
  ],
})
