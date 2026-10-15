import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { purgeStaleApiCaches } from '@/shared/utils/cacheBuster'

const root = ReactDOM.createRoot(document.getElementById('root')!)
let isStarting = false

async function startHome() {
  if (isStarting) return
  isStarting = true
  root.render(
    <main className="min-h-screen flex items-center justify-center bg-canvas text-text-primary p-6">
      <p role="status" aria-live="polite">Starting HOME...</p>
    </main>,
  )
  try {
    await purgeStaleApiCaches()
    const { default: App } = await import('./App')
    root.render(<React.StrictMode><App /></React.StrictMode>)
  } catch {
    root.render(
      <main className="min-h-screen flex flex-col gap-4 items-center justify-center bg-canvas text-text-primary p-6">
        <p role="alert">HOME could not start. Try again or reload the page.</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => void startHome()} className="rounded-lg bg-accent-base text-white px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-base focus-visible:outline-offset-2">Try again</button>
          <button type="button" onClick={() => window.location.reload()} className="rounded-lg bg-surface border border-border-default px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-base focus-visible:outline-offset-2">Reload page</button>
        </div>
      </main>,
    )
  } finally {
    isStarting = false
  }
}

void startHome()


