import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { Building2Icon, LandmarkIcon, MapPinIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Separator } from '@afenda/ui/components/ui/separator'
import { cn } from '@afenda/ui/lib/utils'

import type { TruthHealthSummary, TruthSeverity } from '@afenda/core/truth'
import type {
  ResolutionSuggestion,
  TruthAlertItem,
} from '@afenda/core/truth-ui'

import { useTruthHealthStore, useTruthScopeStore } from '@/share/client-store'
import type { SearchResultTypePresentation } from '@/share/components/providers/global-search-provider.types'
import { useGlobalSearch } from '@/share/components/providers'
import {
  CreateActionTrigger,
  FeedbackPopover,
  HelpPanel,
  MobileNavTrigger,
  ResolutionPanel,
  TruthAlertPanel,
} from '../../block-ui'
import type { ScopeSwitcherItem } from '../../block-ui'
import { TopActionBar } from './top-action-bar'
import {
  buildNavGlobalSearchResults,
  CommandPalette,
  CommandPaletteBar,
  GLOBAL_SEARCH_NAV_TYPE,
  GlobalSearchBar,
  useCommandPaletteShortcut,
} from '../../search'
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
 * Prefer this over individual boolean props for a leaner call site.
 *
 * @example
 * // ERP shell — sidebar toggle lives on the rail footer, not the top bar
 * <TopNavBar features={{ mobileDrawer: false, sidebarTrigger: false }} />
 */
export interface TopNavFeatures {
  /** ⌘K command palette dialog. Default: true */
  commandPalette?: boolean
  /** Inline global search bar. When false, palette bar renders if commandPalette is on. Default: true */
  globalSearch?: boolean
  /** Account / user menu on the right. Default: true */
  accountMenu?: boolean
  /** Truth-health alert panel. Default: true */
  truthAlerts?: boolean
  /** Resolution suggestion panel. Default: true */
  resolutions?: boolean
  /** Feedback popover trigger. Default: true */
  feedback?: boolean
  /** Help panel trigger. Default: true */
  help?: boolean
  /** Quick-create dropdown trigger. Default: true */
  createActions?: boolean
  /** Row 2 module action bar. Default: true */
  actionBar?: boolean
  /** Mobile drawer + hamburger trigger. Set false when using SideNavBar. Default: true */
  mobileDrawer?: boolean
  /**
   * Top-bar sidebar toggle (legacy). ERP shell uses the rail footer control only.
   * Default: false
   */
  sidebarTrigger?: boolean
}

const DEFAULT_FEATURES: Required<TopNavFeatures> = {
  commandPalette: true,
  globalSearch: true,
  accountMenu: true,
  truthAlerts: true,
  resolutions: true,
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
  /** Override auto-resolved nav items (flat list used for mobile + command). */
  items?: readonly TopNavItem[]
  /** Override auto-resolved nav groups (used for desktop dropdowns). */
  groups?: readonly TopNavGroup[]
  /** Max items to show as top-level links before grouping into dropdowns. */
  flatItemThreshold?: number
  /** Slot for custom right-side utility area (replaces default util icons). */
  utilities?: ReactNode
  /** Slot for custom account area (replaces default user menu). */
  account?: ReactNode
  /** Truth health summary for user menu (omit to use `useTruthHealthStore`). */
  healthSummary?: TruthHealthSummary | null
  /** Truth alerts for alert panel (omit to use `useTruthHealthStore`). */
  alerts?: readonly TruthAlertItem[]
  /** Resolution suggestions for resolution panel. */
  resolutions?: readonly ResolutionSuggestion[]
  /** Severity at org scope level. */
  orgSeverity?: TruthSeverity
  /** Severity at subsidiary scope level. */
  subsidiarySeverity?: TruthSeverity
  /** Feature toggles — all on by default. Pass only what you want to change. */
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
  healthSummary: healthSummaryProp,
  alerts: alertsProp,
  resolutions = [],
  orgSeverity,
  subsidiarySeverity,
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

  const scope = useTruthScopeStore((state) => state.scope)
  const orgList = useTruthScopeStore((state) => state.orgList)
  const subsidiaryList = useTruthScopeStore((state) => state.subsidiaryList)
  const switchOrg = useTruthScopeStore((state) => state.switchOrg)
  const switchSubsidiary = useTruthScopeStore((state) => state.switchSubsidiary)

  const storeHealth = useTruthHealthStore((state) => state.health)
  const storeAlerts = useTruthHealthStore((state) => state.alerts)
  const markAlertRead = useTruthHealthStore((state) => state.markRead)
  const markAllAlertsRead = useTruthHealthStore((state) => state.markAllRead)

  const healthSummary = healthSummaryProp ?? storeHealth
  const alerts = alertsProp ?? storeAlerts

  const createActions = useCreateActions()

  const containerClasses = cn(
    'sticky top-0 z-40 w-full border-b border-border bg-background',
    className,
  )

  const useFlatNav = groups.length <= 1 && items.length <= flatItemThreshold

  const orgItems: ScopeSwitcherItem[] = orgList.map((org) => ({
    id: org.id,
    name: org.name,
  }))

  const subsidiaryItems: ScopeSwitcherItem[] = subsidiaryList
    .filter((sub) => sub.orgId === scope?.tenantId)
    .map((sub) => ({
      id: sub.id,
      name: sub.name,
      badge: sub.legalEntityCode,
    }))

  const scopeLevels = useMemo((): readonly NavBreadcrumbScopeLevel[] => {
    const levels: NavBreadcrumbScopeLevel[] = [
      {
        id: 'tenant',
        label: t('breadcrumb.org', 'Organization'),
        searchPlaceholder: t(
          'breadcrumb.search_org',
          'Search organizations...',
        ),
        items: orgItems,
        currentValue: scope?.tenantId ?? null,
        onSelect: switchOrg,
        severity: orgSeverity,
        icon: Building2Icon,
      },
      {
        id: 'legalEntity',
        label: t('breadcrumb.subsidiary', 'Subsidiary'),
        searchPlaceholder: t(
          'breadcrumb.search_subsidiary',
          'Search subsidiaries...',
        ),
        items: subsidiaryItems,
        currentValue: scope?.legalEntityId ?? null,
        onSelect: switchSubsidiary,
        severity: subsidiarySeverity,
        icon: LandmarkIcon,
      },
    ]
    return levels.slice(0, TOP_NAV_MAX_SCOPE_ICON_SWITCHERS)
  }, [
    orgItems,
    subsidiaryItems,
    scope?.tenantId,
    scope?.legalEntityId,
    switchOrg,
    switchSubsidiary,
    orgSeverity,
    subsidiarySeverity,
    t,
  ])

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
        {/* Row 1: Supabase-style zones — left scope + module nav | center search | right icon rail */}
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
              <GlobalSearchBar
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
                  {features.truthAlerts ? (
                    <TruthAlertPanel
                      alerts={alerts}
                      onMarkRead={markAlertRead}
                      onMarkAllRead={markAllAlertsRead}
                      triggerClassName={topNavShellIconTriggerClassName}
                    />
                  ) : null}
                  {features.help ? (
                    <HelpPanel
                      triggerClassName={topNavShellIconTriggerClassName}
                    />
                  ) : null}
                  {features.resolutions ? (
                    <ResolutionPanel
                      suggestions={resolutions}
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
                      healthSummary={healthSummary}
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

        {/* Row 2: Action bar (module-specific tabs) */}
        {features.actionBar && <TopActionBar />}
      </header>

      {/* Command palette dialog */}
      {features.commandPalette && (
        <CommandPalette
          open={isCommandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
        />
      )}

      {/* Mobile drawer */}
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
