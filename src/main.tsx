import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { purgeStaleApiCaches } from '@/shared/utils/cacheBuster'

// Eagerly purge any obsolete Workbox / Supabase API caches on mobile and desktop
void purgeStaleApiCaches()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


