import type { ComponentType, SVGProps } from 'react'
import {
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingCartIcon,
  UsersIcon,
  WalletIcon,
  FileTextIcon,
  ArrowLeftRightIcon,
  CheckCircleIcon,
  UserCogIcon,
  BarChart3Icon,
  Settings2Icon,
  CircleHelpIcon,
  SearchIcon,
} from 'lucide-react'

export interface NavItem {
  /** i18n label key inside the `shell` namespace, e.g. `nav.dashboard`. */
  labelKey: string
  /** Route path relative to `/app`, e.g. `dashboard`. */
  path: string
  /** Lucide icon component. */
  icon: ComponentType<SVGProps<SVGSVGElement>>
  /** Permission key required to see this item. Omit for unrestricted. */
  permissionKey?: string
}

export interface NavGroup {
  /** i18n label key for the group heading. */
  labelKey: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    labelKey: 'nav.group_main',
    items: [
      {
        labelKey: 'nav.dashboard',
        path: 'dashboard',
        icon: LayoutDashboardIcon,
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

export const secondaryNavItems: NavItem[] = [
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
