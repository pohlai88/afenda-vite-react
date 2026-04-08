import type { ComponentType, SVGProps } from 'react'
import {
  ArrowLeftRightIcon,
  BarChart3Icon,
  CheckCircleIcon,
  ClipboardListIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  PackageIcon,
  PuzzleIcon,
  ScrollTextIcon,
  Settings2Icon,
  ShoppingCartIcon,
  UserCogIcon,
  UsersIcon,
  WalletIcon,
} from 'lucide-react'

export interface NavConfigItem {
  readonly labelKey: string
  readonly path: string
  readonly icon: ComponentType<SVGProps<SVGSVGElement>>
  readonly permissionKey?: string
  readonly exact?: boolean
  readonly badge?: string | number
  readonly notificationDot?: boolean
}

export interface NavConfigGroup {
  readonly id: string
  /**
   * Used for command palette section titles. Hidden in the side nav when
   * `showGroupLabel` is false (Supabase-style separator blocks).
   */
  readonly labelKey: string
  readonly items: readonly NavConfigItem[]
  readonly showGroupLabel?: boolean
  readonly collapsible?: boolean
  readonly defaultExpanded?: boolean
}

/**
 * Afenda ERP labels and routes in a **Supabase project sidebar shape**:
 * 3 + 5 + 5 + 1 items, section titles off, separators only.
 * Placeholder modules: `workspace/events`, `workspace/audit`, `workspace/partners`.
 */
export const navGroups: readonly NavConfigGroup[] = [
  {
    id: 'workspace_primary',
    labelKey: 'nav.workspace.section_primary',
    showGroupLabel: false,
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
        labelKey: 'nav.reports',
        path: 'reports',
        icon: BarChart3Icon,
        permissionKey: 'reports:read',
      },
    ],
  },
  {
    id: 'workspace_operations',
    labelKey: 'nav.workspace.section_operations',
    showGroupLabel: false,
    items: [
      {
        labelKey: 'nav.finance',
        path: 'finance',
        icon: WalletIcon,
        permissionKey: 'finance:read',
      },
      {
        labelKey: 'nav.customers',
        path: 'customers',
        icon: UsersIcon,
        permissionKey: 'customers:read',
      },
      {
        labelKey: 'nav.allocations',
        path: 'allocations',
        icon: ArrowLeftRightIcon,
        permissionKey: 'finance:read',
      },
      {
        labelKey: 'nav.sales',
        path: 'sales',
        icon: ShoppingCartIcon,
        permissionKey: 'sales:read',
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
    id: 'workspace_insights',
    labelKey: 'nav.workspace.section_insights',
    showGroupLabel: false,
    items: [
      {
        labelKey: 'nav.invoices',
        path: 'invoices',
        icon: FileTextIcon,
        permissionKey: 'finance:read',
        notificationDot: true,
      },
      {
        labelKey: 'nav.employees',
        path: 'employees',
        icon: UserCogIcon,
        permissionKey: 'employees:read',
      },
      {
        labelKey: 'nav.workspace.event_log',
        path: 'workspace/events',
        icon: ScrollTextIcon,
      },
      {
        labelKey: 'nav.workspace.audit_trail',
        path: 'workspace/audit',
        icon: ClipboardListIcon,
      },
      {
        labelKey: 'nav.workspace.partner_integrations',
        path: 'workspace/partners',
        icon: PuzzleIcon,
      },
    ],
  },
  {
    id: 'workspace_app',
    labelKey: 'nav.workspace.section_app',
    showGroupLabel: false,
    items: [
      {
        labelKey: 'nav.settings',
        path: 'settings',
        icon: Settings2Icon,
        permissionKey: 'settings:read',
      },
    ],
  },
]

export const secondaryNavItems: readonly NavConfigItem[] = []
