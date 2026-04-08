import { useCallback } from 'react'

import { useSidebar } from '@afenda/ui/components/ui/sidebar'

/**
 * Returns a stable callback that closes the mobile sidebar sheet when called.
 * Extracted to avoid duplicating the isMobile + setOpenMobile pattern across
 * every nav item that must close the sheet on navigation.
 */
export function useCloseMobile(): () => void {
  const { isMobile, setOpenMobile } = useSidebar()
  return useCallback(() => {
    if (isMobile) setOpenMobile(false)
  }, [isMobile, setOpenMobile])
}
