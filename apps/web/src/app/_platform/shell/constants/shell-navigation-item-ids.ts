export const shellNavigationItemIds = [
  "dashboard",
  "events",
  "audit",
  "counterparties",
  "finance",
  "invoices",
  "allocations",
  "settlements",
  "db_studio",
  "my_project",
  "my_team",
  "my_report",
  "my_claim",
] as const

export type ShellNavigationItemId = (typeof shellNavigationItemIds)[number]
