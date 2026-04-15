/**
 * PLATFORM PREVIEW ICONS
 *
 * Central icon resolution for the AFENDA platform preview feature.
 * Keeps icon-switch logic out of page and stage components.
 */

import type { ComponentType } from "react"
import {
  Activity,
  AlertTriangle,
  BriefcaseBusiness,
  Building2,
  CalendarRange,
  Eye,
  FileSearch,
  LayoutDashboard,
  PlugZap,
  ReceiptText,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react"

import type { PreviewRole, PreviewScenario } from "../types/platform-preview-types"

type IconComponent = ComponentType<{ className?: string }>

export function getRoleIcon(iconKey: string): IconComponent {
  switch (iconKey) {
    case "shield-check":
      return ShieldCheck
    case "building-2":
      return Building2
    case "briefcase-business":
      return BriefcaseBusiness
    case "users":
      return Users
    default:
      return Eye
  }
}

export function getRoleLensIcon(role: PreviewRole): IconComponent {
  switch (role) {
    case "controller":
      return ShieldCheck
    case "executive":
      return Building2
    case "owner":
      return Eye
    case "operator":
      return Users
  }
}

export function getScenarioIcon(scenario: PreviewScenario): IconComponent {
  switch (scenario) {
    case "payment-release":
      return Wallet
    case "month-end-close":
      return CalendarRange
    case "audit-review":
      return FileSearch
    case "integration-exception":
      return AlertTriangle
    default:
      return ReceiptText
  }
}

export function getNavIcon(iconKey?: string): IconComponent {
  switch (iconKey) {
    case "layout-dashboard":
      return LayoutDashboard
    case "shield-check":
      return ShieldCheck
    case "plug-zap":
      return PlugZap
    default:
      return Activity
  }
}
