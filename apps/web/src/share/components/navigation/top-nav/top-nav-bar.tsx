import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { MapPinIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Separator } from '@afenda/ui/components/ui/separator'
import { cn } from '@afenda/ui/lib/utils'

import type { SearchResultTypePresentation } from '@/share/components/providers/global-search-provider.types'
import { useGlobalSearch } from '@/share/components/providers'
import {
  CreateActionTrigger,
  FeedbackPopover,
  HelpPanel,
  MobileNavTrigger,
} from '../../block-ui'
import { TopActionBar } from './top-action-bar'
import {
  buildNavGlobalSearchResults,
  CommandPalette,
  CommandPaletteBar,
  GLOBAL_SEARCH_NAV_TYPE,
  useCommandPaletteShortcut,
} from '../../search'
import { ShellSearchBar } from '../../shell-ui'
import { MobileNavDrawer } from '../mobile-nav/mobile-nav-drawer'
import type { TopNavGroup, TopNavItem } from '../nav-catalog/nav-model'
import { NavBreadcrumbBar } from '../scope-strip/nav-breadcrumb-bar'
import type { NavBreadcrumbScopeLevel } from '../scope-strip/nav-breadcrumb-bar.types'
import { TopNavGroupMenu } from './top-nav-group-menu'
import { TopNavLink } from './top-nav-link'
import { useNavItems } from '../nav-catalog/use-nav-items'
import { useCreateActions } from '../nav-catalog/use-create-actions'
import { TopUserMenu } from './top-user-menu'
import {
  TOP_NAV_MAX_SCOPE_ICON_SWITCHERS,
  topNavRowClassName,
  topNavLeftClusterClassName,
  topNavSearchColumnClassName,
  topNavRightEdgeClassName,
  topNavShellIconTriggerClassName,
  topNavShellTextTriggerClassName,
  topNavSearchInputGroupClassName,
} from './top-nav-chrome-tokens'

/**
 * Feature toggles for the top navigation bar.
 * All features are enabled by default — explicitly opt out as needed.
 */
export interface TopNavFeatures {
  commandPalette?: boolean
  globalSearch?: boolean
  accountMenu?: boolean
  feedback?: boolean
  help?: boolean
  createActions?: boolean
  actionBar?: boolean
  mobileDrawer?: boolean
  sidebarTrigger?: boolean
}

const DEFAULT_FEATURES: Required<TopNavFeatures> = {
  commandPalette: true,
  globalSearch: true,
  accountMenu: true,
  feedback: true,
  help: true,
  createActions: true,
  actionBar: true,
  mobileDrawer: true,
  sidebarTrigger: false,
}

export interface TopNavBarProps {
  className?: string
  brandName?: string
  logoHref?: string | null
  items?: readonly TopNavItem[]
  groups?: readonly TopNavGroup[]
  flatItemThreshold?: number
  utilities?: ReactNode
  account?: ReactNode
  /** Scope levels for org / entity switchers (empty until operational scope is wired). */
  scopeLevels?: readonly NavBreadcrumbScopeLevel[]
  features?: TopNavFeatures
}

export function TopNavBar({
  className,
  brandName,
  logoHref = '/app',
  items: itemsOverride,
  groups: groupsOverride,
  flatItemThreshold = 4,
  utilities,
  account,
  scopeLevels: scopeLevelsProp,
  features: featuresProp,
}: TopNavBarProps) {
  const features: Required<TopNavFeatures> = {
    ...DEFAULT_FEATURES,
    ...featuresProp,
  }

  const { t } = useTranslation('shell')
  const resolved = useNavItems()
  const items = itemsOverride ?? resolved.items
  const groups = groupsOverride ?? resolved.groups
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { isCommandPaletteOpen, setCommandPaletteOpen, openCommandPalette } =
    useGlobalSearch()

  useCommandPaletteShortcut(
    features.commandPalette,
    isCommandPaletteOpen,
    setCommandPaletteOpen,
  )

  const createActions = useCreateActions()

  const containerClasses = cn(
    'sticky top-0 z-40 w-full border-b border-border bg-background',
    className,
  )

  const useFlatNav = groups.length <= 1 && items.length <= flatItemThreshold

  const scopeLevels = useMemo((): readonly NavBreadcrumbScopeLevel[] => {
    if (scopeLevelsProp) return scopeLevelsProp.slice(0, TOP_NAV_MAX_SCOPE_ICON_SWITCHERS)
    return []
  }, [scopeLevelsProp])

  const fetchNavResults = useCallback(
    (q: string) => Promise.resolve(buildNavGlobalSearchResults(items, q)),
    [items],
  )

  const getSearchTypePresentation = useCallback(
    (type: string): SearchResultTypePresentation | undefined => {
      if (type !== GLOBAL_SEARCH_NAV_TYPE) return undefined
      return {
        label: t('global_search.type_navigation'),
        icon: <MapPinIcon className="shrink-0 opacity-80" aria-hidden />,
      }
    },
    [t],
  )

  return (
    <>
      <header className={containerClasses}>
        <div className={topNavRowClassName}>
          <div className={topNavLeftClusterClassName}>
            <NavBreadcrumbBar
              scopeLevels={scopeLevels}
              logoHref={logoHref ?? '/app'}
              className="shrink-0"
            />

            {items.length > 0 ? (
              <div className="hidden min-w-0 flex-1 items-center md:flex">
                <Separator
                  orientation="vertical"
                  className="mx-1 hidden h-4 shrink-0 md:block"
                />
                <nav
                  className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto overflow-y-hidden no-scrollbar"
                  aria-label="Primary navigation"
                >
                  {useFlatNav
                    ? items.map((item) => (
                        <TopNavLink key={item.to} item={item} />
                      ))
                    : groups.map((group) => (
                        <TopNavGroupMenu key={group.id} group={group} />
                      ))}
                </nav>
              </div>
            ) : null}
          </div>

          <div className={topNavSearchColumnClassName}>
            {features.globalSearch ? (
              <ShellSearchBar
                fetchResults={fetchNavResults}
                getTypePresentation={getSearchTypePresentation}
                className="w-full max-w-(--top-nav-search-omni-max-width) min-w-0 shrink-0"
                searchInputClassName={topNavSearchInputGroupClassName}
              />
            ) : null}
            {features.commandPalette && features.globalSearch ? (
              <CommandPaletteBar
                paletteOpen={isCommandPaletteOpen}
                onOpen={openCommandPalette}
                className="shrink-0"
              />
            ) : null}
            {features.commandPalette && !features.globalSearch ? (
              <CommandPaletteBar
                paletteOpen={isCommandPaletteOpen}
                onOpen={openCommandPalette}
                className="shrink-0"
              />
            ) : null}
          </div>

          <div className={topNavRightEdgeClassName}>
            {utilities ?? (
              <>
                {features.feedback ? (
                  <FeedbackPopover
                    triggerClassName={topNavShellTextTriggerClassName}
                  />
                ) : null}
                <div className="flex items-center gap-1">
                  {features.createActions ? (
                    <CreateActionTrigger
                      actions={createActions}
                      triggerClassName={topNavShellIconTriggerClassName}
                    />
                  ) : null}
                  {features.help ? (
                    <HelpPanel
                      triggerClassName={topNavShellIconTriggerClassName}
                    />
                  ) : null}
                </div>
                <Separator
                  orientation="vertical"
                  className="mx-1 hidden h-4 shrink-0 sm:block"
                />
                {account ??
                  (features.accountMenu ? (
                    <TopUserMenu
                      triggerClassName={topNavShellIconTriggerClassName}
                    />
                  ) : null)}
                {items.length > 0 && features.mobileDrawer ? (
                  <MobileNavTrigger
                    onClick={() => setMobileNavOpen(true)}
                    expanded={mobileNavOpen}
                  />
                ) : null}
              </>
            )}
          </div>
        </div>

        {features.actionBar && <TopActionBar />}
      </header>

      {features.commandPalette && (
        <CommandPalette
          open={isCommandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
        />
      )}

      {items.length > 0 && features.mobileDrawer ? (
        <MobileNavDrawer
          open={mobileNavOpen}
          onOpenChange={setMobileNavOpen}
          items={items}
          brandName={brandName}
          logoHref={logoHref}
        />
      ) : null}
    </>
  )
}
