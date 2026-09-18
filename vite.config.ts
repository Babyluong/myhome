import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.svg',
        '512px-Jata_MalaysiaV2.svg.png',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/icon-maskable-512.png',
        'icons/apple-touch-icon.png',
      ],
      manifest: {
        name: 'H.O.M.E. - Hospital Operation & Management Ecosystem',
        short_name: 'H.O.M.E.',
        description: 'Hospital Operation Management Ecosystem - Kementerian Kesihatan Malaysia',
        start_url: '/',
        id: '/',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
        orientation: 'any',
        background_color: '#020617',
        theme_color: '#020617',
        scope: '/',
        lang: 'ms',
        categories: ['medical', 'health', 'productivity', 'business'],
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/512px-Jata_MalaysiaV2.svg.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 25 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              networkTimeoutSeconds: 6,
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
  server: {
    port: 3000,
    open: true,
    watch: {
      // Exclude archived folders from file watcher — they are not used at runtime
      ignored: [
        '**/src/_archived_app/**',
        '**/src/_archived_features/**',
      ],
    },
  },
  optimizeDeps: {
    // Pre-bundle heavy dependencies eagerly so the browser doesn't stall on first load
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'lucide-react',
      'framer-motion',
      'recharts',
      'date-fns',
      'zustand',
      'tesseract.js',
      'pdfjs-dist',
    ],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    chunkSizeWarningLimit: 2500,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return

          // Core React runtime
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
            return 'vendor-react'
          }
          // Heavy PDF libraries
          if (id.includes('pdfjs-dist') || id.includes('pdf-lib') || id.includes('jspdf')) {
            return 'vendor-pdf'
          }
          // OCR
          if (id.includes('tesseract.js')) {
            return 'vendor-ocr'
          }
          // Supabase client
          if (id.includes('@supabase')) {
            return 'vendor-supabase'
          }
          // UI motion & icons
          if (id.includes('framer-motion') || id.includes('lucide-react')) {
            return 'vendor-ui'
          }
          // Common utilities
          if (id.includes('date-fns') || id.includes('zustand') || id.includes('zod')) {
            return 'vendor-utils'
          }
        },
      },
    },
  },
})
