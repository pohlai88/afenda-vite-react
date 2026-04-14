"use client"

import { useCallback, useState } from "react"

import {
  applyShellMotionPreference,
  readStoredShellMotion,
  type ShellMotionPreference,
  VITE_UI_MOTION_STORAGE_KEY,
} from "./shell-motion-preference"

export function useShellMotion(): readonly [
  ShellMotionPreference,
  (next: ShellMotionPreference) => void,
] {
  const [motion, setMotion] = useState<ShellMotionPreference>(() =>
    readStoredShellMotion()
  )

  const setMotionPreference = useCallback((next: ShellMotionPreference) => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(VITE_UI_MOTION_STORAGE_KEY, next)
    applyShellMotionPreference(next)
    setMotion(next)
  }, [])

  return [motion, setMotionPreference] as const
}
