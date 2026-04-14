"use client"

import { useEffect, useLayoutEffect } from "react"

import {
  applyShellMotionPreference,
  parseStoredMotion,
  readStoredShellMotion,
  VITE_UI_MOTION_STORAGE_KEY,
} from "./shell-motion-preference"

/** Applies stored `data-motion-preference` on mount and syncs across tabs. */
export function ShellMotionRoot() {
  useLayoutEffect(() => {
    applyShellMotionPreference(readStoredShellMotion())
  }, [])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === VITE_UI_MOTION_STORAGE_KEY) {
        applyShellMotionPreference(parseStoredMotion(e.newValue))
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  return null
}
