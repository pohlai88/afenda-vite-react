/**
 * Configuration for user menu sections and items.
 * Used to build the 6-section user menu structure.
 */

export interface UserMenuNavItem {
  readonly key: string
  readonly labelKey: string
  readonly icon: string
  readonly href?: string
  readonly onClick?: () => void
}

/**
 * Section 3: Personal navigation items
 */
export const personalNavItems: readonly UserMenuNavItem[] = [
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
export const userStatusOptions = [
  {
    key: 'available',
    labelKey: 'user_menu.status_available',
    icon: 'CircleIcon',
    color: 'text-green-500',
  },
  {
    key: 'busy',
    labelKey: 'user_menu.status_busy',
    icon: 'CircleIcon',
    color: 'text-red-500',
  },
  {
    key: 'away',
    labelKey: 'user_menu.status_away',
    icon: 'CircleIcon',
    color: 'text-yellow-500',
  },
  {
    key: 'invisible',
    labelKey: 'user_menu.status_invisible',
    icon: 'CircleIcon',
    color: 'text-gray-400',
  },
] as const
