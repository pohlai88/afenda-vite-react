/**
 * Motion preference for `/app/*`: `data-motion-preference` on `document.documentElement`.
 * - `system`: follow `prefers-reduced-motion`
 * - `reduce`: always minimize motion
 * - `allow`: allow full motion even when the OS prefers reduced (explicit user choice)
 */
export const VITE_UI_MOTION_STORAGE_KEY = "vite-ui-motion-preference" as const

export type ShellMotionPreference = "system" | "reduce" | "allow"

export const SHELL_MOTION_DEFAULT: ShellMotionPreference = "system"

export function parseStoredMotion(raw: string | null): ShellMotionPreference {
  if (raw === "system" || raw === "reduce" || raw === "allow") {
    return raw
  }
  return SHELL_MOTION_DEFAULT
}

export function applyShellMotionPreference(mode: ShellMotionPreference): void {
  if (typeof document === "undefined") return
  document.documentElement.setAttribute("data-motion-preference", mode)
}

export function readStoredShellMotion(): ShellMotionPreference {
  if (typeof window === "undefined") return SHELL_MOTION_DEFAULT
  return parseStoredMotion(
    window.localStorage.getItem(VITE_UI_MOTION_STORAGE_KEY)
  )
}
