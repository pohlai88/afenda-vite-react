import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'

import { useTruthNavProps } from '@/share/state'

import {
  ActionBarProvider,
  GlobalSearchProvider,
  ShellMetadataProvider,
} from '../providers'
import { TopNavBar } from '../navigation'

export interface ErpLayoutProps {
  children?: ReactNode
}

/**
 * ErpLayout is the main shell layout for authenticated ERP routes.
 * Renders the top navigation bar and the routed content.
 *
 * Providers:
 * - `ShellMetadataProvider` — page title / breadcrumb metadata from route views
 * - `GlobalSearchProvider` — shared command palette / search query / recents
 * - `ActionBarProvider` — Row 2 module tabs registered via `useActionBar()`
 */
export function ErpLayout({ children }: ErpLayoutProps) {
  return (
    <ShellMetadataProvider>
      <GlobalSearchProvider>
        <ActionBarProvider>
          <ErpLayoutChrome>{children}</ErpLayoutChrome>
        </ActionBarProvider>
      </GlobalSearchProvider>
    </ShellMetadataProvider>
  )
}

function ErpLayoutChrome({ children }: { children?: ReactNode }) {
  const truthNav = useTruthNavProps()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNavBar {...truthNav} />
      <main className="flex-1">{children ?? <Outlet />}</main>
    </div>
  )
}
