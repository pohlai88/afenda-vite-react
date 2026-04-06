import type { ReactNode } from 'react'
import { useState } from 'react'
import {
  FileTextIcon,
  ShoppingCartIcon,
  UserCogIcon,
  UsersIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@afenda/ui/lib/utils'
import { Separator } from '@afenda/ui/components/ui/separator'

import type { TruthHealthSummary, TruthSeverity } from '@afenda/core/truth'
import type {
  ResolutionSuggestion,
  TruthAlertItem,
} from '@afenda/core/truth-ui'

import { useTruthHealthStore, useTruthScopeStore } from '@/share/state'
import { useGlobalSearch } from '@/share/components/providers'
import {
  CommandPaletteTrigger,
  CreateActionTrigger,
  type CreateAction,
} from '../block-ui'
import type { ScopeSwitcherItem } from '../block-ui'
import { ActionBar } from './action-bar'
import { CommandPalette } from '../search'
import { FeedbackPopover } from './feedback-popover'
import { HelpPanel } from './help-panel'
import { MobileNavDrawer } from './mobile-nav-drawer'
import { MobileNavTrigger } from './mobile-nav-trigger'
import type { TopNavGroup, TopNavItem } from './nav-model'
import { NavBreadcrumbBar } from './nav-breadcrumb-bar'
import { ResolutionPanel } from './resolution-panel'
import { TopNavGroupMenu } from './top-nav-group-menu'
import { TopNavLink } from './top-nav-link'
import { TruthAlertPanel } from './truth-alert-panel'
import { useNavItems } from './use-nav-items'
import { useCommandPaletteShortcut } from './use-command-palette-shortcut'
import { UserMenu } from './user-menu'

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
  utilities?: ReactNode
  account?: ReactNode

  /** Truth health summary for user menu (omit to use `useTruthHealthStore`) */
  healthSummary?: TruthHealthSummary | null
  /** Truth alerts for alert panel (omit to use `useTruthHealthStore`) */
  alerts?: readonly TruthAlertItem[]
  /** Resolution suggestions for resolution panel */
  resolutions?: readonly ResolutionSuggestion[]

  /** Severity at org scope level */
  orgSeverity?: TruthSeverity
  /** Severity at subsidiary scope level */
  subsidiarySeverity?: TruthSeverity

  showCommandPalette?: boolean
  showAccountMenu?: boolean
  showTruthAlerts?: boolean
  showResolutions?: boolean
  showFeedback?: boolean
  showHelp?: boolean
  showCreateActions?: boolean
  showActionBar?: boolean
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
  showCommandPalette = true,
  showAccountMenu = true,
  showTruthAlerts = true,
  showResolutions = true,
  showFeedback = true,
  showHelp = true,
  showCreateActions = true,
  showActionBar = true,
}: TopNavBarProps) {
  const { t } = useTranslation('shell')
  const resolved = useNavItems()
  const items = itemsOverride ?? resolved.items
  const groups = groupsOverride ?? resolved.groups
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { isCommandPaletteOpen, setCommandPaletteOpen, openCommandPalette } =
    useGlobalSearch()

  useCommandPaletteShortcut(
    showCommandPalette,
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

  const containerClasses = cn(
    'sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/80',
    className,
  )

  const createActions: CreateAction[] = [
    {
      id: 'create-invoice',
      label: t('create.invoice' as never),
      to: '/app/invoices/new',
      icon: FileTextIcon,
    },
    {
      id: 'create-customer',
      label: t('create.customer' as never),
      to: '/app/customers/new',
      icon: UsersIcon,
    },
    {
      id: 'create-sale',
      label: t('create.sale' as never),
      to: '/app/sales/new',
      icon: ShoppingCartIcon,
    },
    { id: 'create-sep-after-sales', separator: true },
    {
      id: 'create-employee',
      label: t('create.employee' as never),
      to: '/app/employees/new',
      icon: UserCogIcon,
    },
  ]

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

  return (
    <>
      <header className={containerClasses}>
        {/* Row 1: Breadcrumb bar + Nav + Right utilities */}
        <div className="flex h-12 items-center gap-2 px-4 lg:px-6">
          {/* Left: Breadcrumb bar (Logo / Org / Subsidiary / Module) */}
          <NavBreadcrumbBar
            currentOrgId={scope?.tenantId ?? null}
            orgItems={orgItems}
            onOrgSwitch={switchOrg}
            orgSeverity={orgSeverity}
            currentSubsidiaryId={scope?.legalEntityId ?? null}
            subsidiaryItems={subsidiaryItems}
            onSubsidiarySwitch={switchSubsidiary}
            subsidiarySeverity={subsidiarySeverity}
            logoHref={logoHref ?? '/app'}
          />

          {/* Desktop nav: flat links or grouped dropdowns */}
          {items.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-5" />
              <nav
                className="hidden items-center gap-0.5 md:flex"
                aria-label="Primary navigation"
              >
                {useFlatNav
                  ? items.map((item) => (
                      <TopNavLink key={item.to} item={item} />
                    ))
                  : groups.map((group) => (
                      <TopNavGroupMenu key={group.label} group={group} />
                    ))}
              </nav>
            </>
          )}

          {/* Center: Command palette search trigger */}
          <div className="hidden flex-1 justify-center md:flex">
            {showCommandPalette && (
              <CommandPaletteTrigger onClick={() => openCommandPalette()} />
            )}
          </div>

          {/* Right: plan order — Feedback, Create, Truth alerts, Help, Resolution, User */}
          <div className="ml-auto flex shrink-0 items-center gap-1">
            {utilities ?? (
              <>
                {showFeedback && <FeedbackPopover />}
                {showCreateActions && (
                  <CreateActionTrigger actions={createActions} />
                )}
                {showTruthAlerts && (
                  <TruthAlertPanel
                    alerts={alerts}
                    onMarkRead={markAlertRead}
                    onMarkAllRead={markAllAlertsRead}
                  />
                )}
                {showHelp && <HelpPanel />}
                {showResolutions && (
                  <ResolutionPanel suggestions={resolutions} />
                )}
              </>
            )}
            <Separator orientation="vertical" className="mx-1 h-5" />
            {account ??
              (showAccountMenu ? (
                <UserMenu healthSummary={healthSummary} />
              ) : null)}
            {items.length > 0 && (
              <MobileNavTrigger
                onClick={() => setMobileNavOpen(true)}
                expanded={mobileNavOpen}
              />
            )}
          </div>
        </div>

        {/* Row 2: Action bar (module-specific tabs) */}
        {showActionBar && <ActionBar />}
      </header>

      {/* Command palette dialog */}
      {showCommandPalette && (
        <CommandPalette
          open={isCommandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
        />
      )}

      {/* Mobile drawer */}
      {items.length > 0 && (
        <MobileNavDrawer
          open={mobileNavOpen}
          onOpenChange={setMobileNavOpen}
          items={items}
          brandName={brandName}
          logoHref={logoHref}
        />
      )}
    </>
  )
}
