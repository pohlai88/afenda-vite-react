/**
 * RESPONSIBILITY ENVELOPE
 * File role: client bootstrap entry for the Vite app.
 * Owns: global stylesheet imports, one-time startup, React root mount.
 * Must own only app startup order and render wiring.
 * Must not own route UI, feature logic, or design tokens.
 * Safe edits: providers bootstrap, initialization sequence, root render.
 * Unsafe edits: page styling, router structure, feature composition.
 * Styling rule: import the single global stylesheet entry only.
 * Related files: `index.html`, `App.tsx`, `index.css`.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initI18n } from './share/i18n'

void initI18n().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
