import { SlashIcon } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { cn } from '@afenda/ui/lib/utils'

import type { TruthSeverity } from '@afenda/core/truth'

import { Logo } from '../brand'
import { ScopeSwitcher, type ScopeSwitcherItem } from '../block-ui'

export interface NavBreadcrumbBarProps {
  /** Current organization ID */
  currentOrgId: string | null
  /** Available organizations */
  orgItems: readonly ScopeSwitcherItem[]
  /** Called when user switches organization */
  onOrgSwitch: (orgId: string) => void
  /** Severity for org scope (shows dot if issues exist at org level) */
  orgSeverity?: TruthSeverity

  /** Current subsidiary ID */
  currentSubsidiaryId: string | null
  /** Available subsidiaries */
  subsidiaryItems: readonly ScopeSwitcherItem[]
  /** Called when user switches subsidiary */
  onSubsidiarySwitch: (subsidiaryId: string) => void
  /** Severity for subsidiary scope */
  subsidiarySeverity?: TruthSeverity

  /** Current module name (derived from route or explicitly provided) */
  currentModule?: string
  /** Logo href */
  logoHref?: string
  className?: string
}

/**
 * NavBreadcrumbBar renders the left side of Row 1: Logo / Org / Subsidiary / Module
 * Each scope level is a dropdown switcher (Neon-inspired).
 */
export function NavBreadcrumbBar({
  currentOrgId,
  orgItems,
  onOrgSwitch,
  orgSeverity,
  currentSubsidiaryId,
  subsidiaryItems,
  onSubsidiarySwitch,
  subsidiarySeverity,
  currentModule,
  logoHref = '/app',
  className,
}: NavBreadcrumbBarProps) {
  const { t } = useTranslation('shell')
  const location = useLocation()

  const derivedModule = currentModule ?? deriveModuleFromPath(location.pathname)

  return (
    <nav
      className={cn('flex items-center gap-1', className)}
      aria-label={t('breadcrumb.aria_label', 'Scope navigation')}
    >
      <Logo
        showText={false}
        href={logoHref}
        className="mr-1"
        ariaLabel={t('breadcrumb.home', 'Home')}
      />

      <Separator />

      <ScopeSwitcher
        label={t('breadcrumb.org', 'Organization')}
        currentValue={currentOrgId}
        items={orgItems}
        onSelect={onOrgSwitch}
        severity={orgSeverity}
        searchPlaceholder={t(
          'breadcrumb.search_org',
          'Search organizations...',
        )}
      />

      <Separator />

      <ScopeSwitcher
        label={t('breadcrumb.subsidiary', 'Subsidiary')}
        currentValue={currentSubsidiaryId}
        items={subsidiaryItems}
        onSelect={onSubsidiarySwitch}
        severity={subsidiarySeverity}
        searchPlaceholder={t(
          'breadcrumb.search_subsidiary',
          'Search subsidiaries...',
        )}
      />

      {derivedModule && (
        <>
          <Separator />
          <span className="px-1 text-sm font-medium text-foreground">
            {derivedModule}
          </span>
        </>
      )}
    </nav>
  )
}

function Separator() {
  return (
    <SlashIcon
      className="size-3.5 shrink-0 text-muted-foreground/50"
      aria-hidden="true"
    />
  )
}

function deriveModuleFromPath(pathname: string): string | undefined {
  const segments = pathname.split('/').filter(Boolean)
  if (segments[0] === 'app' && segments[1]) {
    return segments[1].charAt(0).toUpperCase() + segments[1].slice(1)
  }
  return undefined
}
