import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { execSync } from 'child_process'
import fs from 'fs'

// Custom Vite Plugin: Automatically generates releases and synchronizes database on every build/dev
function systemReleasesPlugin() {
  return {
    name: 'system-releases-plugin',
    buildStart() {
      try {
        const scriptPath = path.resolve(__dirname, 'scripts/generate_system_releases.cjs')
        if (fs.existsSync(scriptPath)) {
          execSync(`node "${scriptPath}"`, { stdio: 'inherit' })
        }
      } catch (err: any) {
        console.warn('[Vite Plugin] System release generation notice:', err?.message)
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    systemReleasesPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.svg',
        'favicon.png',
        '512px-Jata_MalaysiaV2.svg.png',
        'icons/icon-72.png',
        'icons/icon-96.png',
        'icons/icon-128.png',
        'icons/icon-144.png',
        'icons/icon-152.png',
        'icons/icon-192.png',
        'icons/icon-384.png',
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
        display_override: ['standalone', 'window-controls-overlay', 'minimal-ui'],
        orientation: 'portrait-primary',
        background_color: '#020617',
        theme_color: '#020617',
        scope: '/',
        lang: 'ms',
        categories: ['medical', 'health', 'productivity', 'business'],
        icons: [
          {
            src: '/icons/icon-72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-384.png',
            sizes: '384x384',
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
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
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
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days stale cache fallback
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-storage-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
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
    host: true,
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
    modulePreload: {
      resolveDependencies: (_filename, deps) => {
        return deps.filter((dep) => !dep.includes('vendor-ocr') && !dep.includes('vendor-pdf'))
      },
    },
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
