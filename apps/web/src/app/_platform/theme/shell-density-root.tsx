"use client"

import { useEffect, useLayoutEffect } from "react"

import {
  applyShellDensity,
  parseStoredDensity,
  readStoredShellDensity,
  VITE_UI_DENSITY_STORAGE_KEY,
} from "./shell-density-preference"

/** Applies stored `data-density` on mount and syncs across tabs. */
export function ShellDensityRoot() {
  useLayoutEffect(() => {
    applyShellDensity(readStoredShellDensity())
  }, [])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === VITE_UI_DENSITY_STORAGE_KEY) {
        applyShellDensity(parseStoredDensity(e.newValue))
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  return null
}
