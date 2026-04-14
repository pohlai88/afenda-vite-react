"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  parseShellLeftSidebarDisplayMode,
  SHELL_LEFT_SIDEBAR_DISPLAY_MODE_STORAGE_KEY,
  type ShellLeftSidebarDisplayMode,
} from "./shell-left-sidebar-display-mode"

const HOVER_COLLAPSE_DELAY_MS = 110

export type UseShellLeftSidebarDisplayModeResult = {
  mode: ShellLeftSidebarDisplayMode
  setMode: (nextMode: ShellLeftSidebarDisplayMode) => void
  expanded: boolean
  setHoverIntentActive: (active: boolean) => void
}

/**
 * Desktop labels panel mode:
 * - `expanded`: always open
 * - `collapsed`: always closed
 * - `hover`: expands while hover/focus intent is active in rail/labels region
 */
export function useShellLeftSidebarDisplayMode(): UseShellLeftSidebarDisplayModeResult {
  const [mode, setMode] = useState<ShellLeftSidebarDisplayMode>("expanded")
  const [isHoverIntentActive, setIsHoverIntentActive] = useState(false)
  const collapseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearCollapseTimeout = useCallback(() => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current)
      collapseTimeoutRef.current = null
    }
  }, [])

  const setHoverIntentActive = useCallback(
    (active: boolean) => {
      if (mode !== "hover") {
        clearCollapseTimeout()
        setIsHoverIntentActive(false)
        return
      }

      if (active) {
        clearCollapseTimeout()
        setIsHoverIntentActive(true)
        return
      }

      clearCollapseTimeout()
      collapseTimeoutRef.current = setTimeout(() => {
        setIsHoverIntentActive(false)
      }, HOVER_COLLAPSE_DELAY_MS)
    },
    [clearCollapseTimeout, mode]
  )

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const parsed = parseShellLeftSidebarDisplayMode(
      window.localStorage.getItem(SHELL_LEFT_SIDEBAR_DISPLAY_MODE_STORAGE_KEY)
    )
    if (parsed) {
      setMode(parsed)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    window.localStorage.setItem(SHELL_LEFT_SIDEBAR_DISPLAY_MODE_STORAGE_KEY, mode)
  }, [mode])

  useEffect(() => {
    if (mode !== "hover") {
      clearCollapseTimeout()
      setIsHoverIntentActive(false)
    }
  }, [clearCollapseTimeout, mode])

  useEffect(
    () => () => {
      clearCollapseTimeout()
    },
    [clearCollapseTimeout]
  )

  return {
    mode,
    setMode,
    expanded: mode === "expanded" || (mode === "hover" && isHoverIntentActive),
    setHoverIntentActive,
  }
}
