"use client"

import { useSidebar } from "@afenda/design-system/ui-primitives"

/** Closes the mobile sheet sidebar after in-shell navigation. */
export function useCloseMobileSidebar(): () => void {
  const { setOpenMobile } = useSidebar()
  return () => {
    setOpenMobile(false)
  }
}
