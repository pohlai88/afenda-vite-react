import type { ComponentType, SVGProps } from 'react'
import {
  ArrowLeftRightIcon,
  BarChart3Icon,
  CheckCircleIcon,
  CircleHelpIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  PackageIcon,
  SearchIcon,
  Settings2Icon,
  ShoppingCartIcon,
  UserCogIcon,
  UsersIcon,
  WalletIcon,
} from 'lucide-react'

export interface NavConfigItem {
  /** i18n label key inside the `shell` namespace, e.g. `nav.dashboard`. */
  readonly labelKey: string
  /** Route path segment relative to `/app/`, e.g. `dashboard`. */
  readonly path: string
  /** Lucide icon component rendered in sidebars and mobile drawers. */
  readonly icon: ComponentType<SVGProps<SVGSVGElement>>
  /** Permission key required to see this item. Omit for unrestricted. */
  readonly permissionKey?: string
  /** When true, only an exact pathname match counts as active. */
  readonly exact?: boolean
}

export interface NavConfigGroup {
  /** i18n label key for the group heading. */
  readonly labelKey: string
  readonly items: readonly NavConfigItem[]
}

export const navGroups: readonly NavConfigGroup[] = [
  {
    labelKey: 'nav.group_main',
    items: [
      {
        labelKey: 'nav.dashboard',
        path: 'dashboard',
        icon: LayoutDashboardIcon,
        exact: true,
      },
      {
        labelKey: 'nav.inventory',
        path: 'inventory',
        icon: PackageIcon,
        permissionKey: 'inventory:read',
      },
      {
        labelKey: 'nav.sales',
        path: 'sales',
        icon: ShoppingCartIcon,
        permissionKey: 'sales:read',
      },
      {
        labelKey: 'nav.customers',
        path: 'customers',
        icon: UsersIcon,
        permissionKey: 'customers:read',
      },
    ],
  },
  {
    labelKey: 'nav.group_finance',
    items: [
      {
        labelKey: 'nav.finance',
        path: 'finance',
        icon: WalletIcon,
        permissionKey: 'finance:read',
      },
      {
        labelKey: 'nav.invoices',
        path: 'invoices',
        icon: FileTextIcon,
        permissionKey: 'finance:read',
      },
      {
        labelKey: 'nav.allocations',
        path: 'allocations',
        icon: ArrowLeftRightIcon,
        permissionKey: 'finance:read',
      },
      {
        labelKey: 'nav.settlements',
        path: 'settlements',
        icon: CheckCircleIcon,
        permissionKey: 'finance:read',
      },
    ],
  },
  {
    labelKey: 'nav.group_management',
    items: [
      {
        labelKey: 'nav.employees',
        path: 'employees',
        icon: UserCogIcon,
        permissionKey: 'employees:read',
      },
      {
        labelKey: 'nav.reports',
        path: 'reports',
        icon: BarChart3Icon,
        permissionKey: 'reports:read',
      },
      {
        labelKey: 'nav.settings',
        path: 'settings',
        icon: Settings2Icon,
        permissionKey: 'settings:read',
      },
    ],
  },
]

export const secondaryNavItems: readonly NavConfigItem[] = [
  {
    labelKey: 'nav.help',
    path: 'help',
    icon: CircleHelpIcon,
  },
  {
    labelKey: 'nav.search',
    path: 'search',
    icon: SearchIcon,
  },
]
