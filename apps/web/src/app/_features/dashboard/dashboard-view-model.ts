import type { ChartConfig } from "@afenda/design-system/ui-primitives"

export type DashboardStatTone = "neutral" | "success" | "warning"

export interface DashboardStatCard {
  readonly id: string
  readonly value: string
  readonly labelKey: string
  readonly helperKey: string
  readonly tone: DashboardStatTone
}

export interface DashboardModuleCard {
  readonly id: string
  readonly titleKey: string
  readonly descriptionKey: string
  readonly linkLabelKey: string
  readonly href: string
  readonly accentClassName: string
}

export interface DashboardTrendPoint {
  readonly name: string
  readonly revenue: number
  readonly operations: number
}

export interface DashboardReadinessItem {
  readonly id: string
  readonly labelKey: string
  readonly completion: number
  readonly helperKey: string
}

export const dashboardStatCards: readonly DashboardStatCard[] = [
  {
    id: "revenue",
    value: "$1.24M",
    labelKey: "stats.revenue.label",
    helperKey: "stats.revenue.helper",
    tone: "success",
  },
  {
    id: "queue",
    value: "18",
    labelKey: "stats.queue.label",
    helperKey: "stats.queue.helper",
    tone: "warning",
  },
  {
    id: "sla",
    value: "97.8%",
    labelKey: "stats.sla.label",
    helperKey: "stats.sla.helper",
    tone: "neutral",
  },
] as const

export const dashboardTrendSeries: readonly DashboardTrendPoint[] = [
  { name: "Mon", revenue: 180, operations: 42 },
  { name: "Tue", revenue: 220, operations: 48 },
  { name: "Wed", revenue: 260, operations: 51 },
  { name: "Thu", revenue: 240, operations: 46 },
  { name: "Fri", revenue: 310, operations: 57 },
] as const

export const dashboardTrendChartConfig = {
  revenue: {
    label: "Revenue",
    color: "oklch(58% 0.17 155)",
  },
  operations: {
    label: "Operations",
    color: "oklch(58% 0.15 230)",
  },
} satisfies ChartConfig

export const dashboardModuleCards: readonly DashboardModuleCard[] = [
  {
    id: "inventory",
    titleKey: "card.inventory.title.label",
    descriptionKey: "card.inventory.description.message",
    linkLabelKey: "card.inventory.link.label",
    href: "/app/inventory",
    accentClassName: "border-l-[3px] border-l-[oklch(58%_0.15_230)]",
  },
  {
    id: "sales",
    titleKey: "card.sales.title.label",
    descriptionKey: "card.sales.description.message",
    linkLabelKey: "card.sales.link.label",
    href: "/app/sales",
    accentClassName: "border-l-[3px] border-l-[oklch(65%_0.17_55)]",
  },
  {
    id: "customers",
    titleKey: "card.customers.title.label",
    descriptionKey: "card.customers.description.message",
    linkLabelKey: "card.customers.link.label",
    href: "/app/crm",
    accentClassName: "border-l-[3px] border-l-[oklch(62%_0.19_15)]",
  },
  {
    id: "finance",
    titleKey: "card.finance.title.label",
    descriptionKey: "card.finance.description.message",
    linkLabelKey: "card.finance.link.label",
    href: "/app/finance",
    accentClassName: "border-l-[3px] border-l-[oklch(58%_0.17_155)]",
  },
  {
    id: "employees",
    titleKey: "card.employees.title.label",
    descriptionKey: "card.employees.description.message",
    linkLabelKey: "card.employees.link.label",
    href: "/app/employees",
    accentClassName: "border-l-[3px] border-l-[oklch(55%_0.18_290)]",
  },
  {
    id: "reports",
    titleKey: "card.reports.title.label",
    descriptionKey: "card.reports.description.message",
    linkLabelKey: "card.reports.link.label",
    href: "/app/reports",
    accentClassName: "border-l-[3px] border-l-[oklch(58%_0.14_175)]",
  },
] as const

export const dashboardReadinessItems: readonly DashboardReadinessItem[] = [
  {
    id: "inventory",
    labelKey: "card.inventory.title.label",
    completion: 82,
    helperKey: "readiness.inventory.helper",
  },
  {
    id: "sales",
    labelKey: "card.sales.title.label",
    completion: 74,
    helperKey: "readiness.sales.helper",
  },
  {
    id: "finance",
    labelKey: "card.finance.title.label",
    completion: 91,
    helperKey: "readiness.finance.helper",
  },
] as const
