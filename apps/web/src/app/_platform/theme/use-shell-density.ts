"use client"

import { useCallback, useState } from "react"

import {
  applyShellDensity,
  readStoredShellDensity,
  type ShellDensity,
  VITE_UI_DENSITY_STORAGE_KEY,
} from "./shell-density-preference"

export function useShellDensity(): readonly [
  ShellDensity,
  (next: ShellDensity) => void,
] {
  const [density, setDensity] = useState<ShellDensity>(() =>
    readStoredShellDensity()
  )

  const setDensityPreference = useCallback((next: ShellDensity) => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(VITE_UI_DENSITY_STORAGE_KEY, next)
    applyShellDensity(next)
    setDensity(next)
  }, [])

  return [density, setDensityPreference] as const
}
