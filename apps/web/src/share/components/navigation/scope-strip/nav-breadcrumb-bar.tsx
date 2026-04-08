import { Fragment } from 'react'
import { SlashIcon } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { cn } from '@afenda/ui/lib/utils'

import { Logo } from '../../brand'
import { ScopeSwitcher } from '../../block-ui'
import {
  topNavBreadcrumbNavClassName,
  topNavModuleCrumbClassName,
  topNavShellIconTriggerClassName,
} from '../top-nav/top-nav-chrome-tokens'

import type { NavBreadcrumbScopeLevel } from './nav-breadcrumb-bar.types'

const scopeTextTriggerClassName =
  'h-8 max-w-[14rem] justify-between rounded-md border border-transparent bg-transparent gap-1 px-2.5 text-[length:var(--top-nav-font-size)] font-medium text-muted-foreground/85 hover:border-border/60 hover:bg-muted/35 hover:text-foreground'

export interface NavBreadcrumbBarProps {
  /**
   * Scope levels rendered left-to-right (caller caps length, e.g.
   * {@link TOP_NAV_MAX_SCOPE_ICON_SWITCHERS} in `TopNavBar`).
   */
  scopeLevels: readonly NavBreadcrumbScopeLevel[]

  /** Current module name (derived from route or explicitly provided) */
  currentModule?: string
  /** Logo href */
  logoHref?: string
  className?: string
  /**
   * `icon` — compact icon+dropdown per level. `text` — full-label triggers.
   */
  scopeMode?: 'icon' | 'text'
}

/**
 * Left-aligned scope strip on the **top nav row** (horizontal flow): Logo / scope levels / Module.
 * Not a vertical left sidebar or collapsible rail; each level uses `ScopeSwitcher` inline in the bar.
 */
export function NavBreadcrumbBar({
  scopeLevels,
  currentModule,
  logoHref = '/app',
  className,
  scopeMode = 'icon',
}: NavBreadcrumbBarProps) {
  const { t } = useTranslation('shell')
  const location = useLocation()

  const derivedModule = currentModule ?? deriveModuleFromPath(location.pathname)

  return (
    <nav
      className={cn(topNavBreadcrumbNavClassName, className)}
      aria-label={t('breadcrumb.aria_label', 'Scope navigation')}
    >
      <Logo
        showText={false}
        href={logoHref}
        className="mr-0.5 shrink-0"
        ariaLabel={t('breadcrumb.home', 'Home')}
      />

      <Separator />

      {scopeLevels.map((level, index) => (
        <Fragment key={level.id}>
          {index > 0 ? <Separator /> : null}
          <ScopeSwitcher
            label={level.label}
            currentValue={level.currentValue}
            items={level.items}
            onSelect={level.onSelect}
            severity={level.severity}
            searchPlaceholder={level.searchPlaceholder}
            mode={scopeMode === 'icon' ? 'icon' : 'text'}
            icon={level.icon}
            className={
              scopeMode === 'icon'
                ? topNavShellIconTriggerClassName
                : scopeTextTriggerClassName
            }
          />
        </Fragment>
      ))}

      {derivedModule && (
        <>
          <Separator />
          <span className={cn(topNavModuleCrumbClassName, 'px-0.5')}>
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
      className="size-3 shrink-0 text-muted-foreground/45"
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
