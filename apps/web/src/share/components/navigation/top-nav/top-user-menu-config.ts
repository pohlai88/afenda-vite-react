/**
 * Configuration for the top nav user menu sections and items.
 * Used to build the multi-section `TopUserMenu` structure.
 */

export interface TopUserMenuNavItem {
  readonly key: string
  readonly labelKey: string
  readonly icon: string
  readonly href?: string
  readonly onClick?: () => void
}

/**
 * Section 3: Personal navigation items
 */
export const topUserMenuPersonalNavItems: readonly TopUserMenuNavItem[] = [
  {
    key: 'account',
    labelKey: 'user_menu.account',
    icon: 'UserIcon',
    href: '/app/account',
  },
  {
    key: 'billing',
    labelKey: 'user_menu.billing',
    icon: 'CreditCardIcon',
    href: '/app/billing',
  },
  {
    key: 'notifications',
    labelKey: 'user_menu.notification_settings',
    icon: 'BellIcon',
    href: '/app/settings/notifications',
  },
  {
    key: 'audit_log',
    labelKey: 'user_menu.audit_log',
    icon: 'ScrollTextIcon',
    href: '/app/audit-log',
  },
]

/**
 * User status options for Section 2
 */
export const topUserMenuStatusOptions = [
  {
    key: 'available',
    labelKey: 'user_menu.status_available',
    icon: 'CircleIcon',
    color: 'text-truth-valid',
  },
  {
    key: 'busy',
    labelKey: 'user_menu.status_busy',
    icon: 'CircleIcon',
    color: 'text-destructive',
  },
  {
    key: 'away',
    labelKey: 'user_menu.status_away',
    icon: 'CircleIcon',
    color: 'text-truth-warning',
  },
  {
    key: 'invisible',
    labelKey: 'user_menu.status_invisible',
    icon: 'CircleIcon',
    color: 'text-foreground-muted',
  },
] as const
