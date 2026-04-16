/**
 * Handles stale chunk / dynamic import failures after deploy (Vite `vite:preloadError`).
 * Renders a small document-level recovery bar so users can reload without a blank screen.
 * Typings: `vite/client` (`VitePreloadErrorEvent` uses `payload`, not `detail`).
 * @see https://vite.dev/guide/build#load-error-handling
 */

const BANNER_ID = "afenda-vite-preload-recovery"
const BANNER_CLASS = "vite-preload-recovery"
const TEXT_CLASS = "vite-preload-recovery__text"
const ACTION_CLASS = "vite-preload-recovery__action"

function mountRecoveryBanner(): void {
  if (document.getElementById(BANNER_ID)) return

  const bar = document.createElement("div")
  bar.id = BANNER_ID
  bar.className = BANNER_CLASS
  bar.setAttribute("role", "alert")
  bar.setAttribute("aria-live", "assertive")

  const text = document.createElement("p")
  text.className = TEXT_CLASS
  text.textContent =
    "Part of the app could not be loaded—often after a new version ships. Reload to continue."

  const btn = document.createElement("button")
  btn.type = "button"
  btn.className = ACTION_CLASS
  btn.textContent = "Reload"

  const reload = (): void => {
    window.location.reload()
  }
  btn.addEventListener("click", reload)

  bar.append(text, btn)
  document.body.appendChild(bar)
  btn.focus()

  if (import.meta.env.DEV) {
    console.error("[vite:preloadError] recovery banner shown; user can reload.")
  }
}

function registerVitePreloadRecovery(): void {
  if (typeof window === "undefined") return

  window.addEventListener("vite:preloadError", (event) => {
    if (import.meta.env.DEV) {
      console.error(event.payload)
    }
    mountRecoveryBanner()
  })
}

registerVitePreloadRecovery()
