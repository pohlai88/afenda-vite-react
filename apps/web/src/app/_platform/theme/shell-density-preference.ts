/**
 * UI density for `/app/*`: drives `data-density` on `document.documentElement`
 * (see `theme-density.css`). Persisted beside app theme in localStorage.
 */
export const VITE_UI_DENSITY_STORAGE_KEY = "vite-ui-density" as const

export type ShellDensity = "compact" | "comfortable" | "spacious"

export const SHELL_DENSITY_DEFAULT: ShellDensity = "comfortable"

export function parseStoredDensity(raw: string | null): ShellDensity {
  if (raw === "compact" || raw === "comfortable" || raw === "spacious") {
    return raw
  }
  return SHELL_DENSITY_DEFAULT
}

export function applyShellDensity(mode: ShellDensity): void {
  if (typeof document === "undefined") return
  document.documentElement.setAttribute("data-density", mode)
}

export function readStoredShellDensity(): ShellDensity {
  if (typeof window === "undefined") return SHELL_DENSITY_DEFAULT
  return parseStoredDensity(
    window.localStorage.getItem(VITE_UI_DENSITY_STORAGE_KEY)
  )
}
