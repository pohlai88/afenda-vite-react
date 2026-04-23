export const shellNavigationItemIds = [
  "events",
  "audit",
  "counterparties",
  "db_studio",
  "my_project",
  "my_team",
  "my_report",
  "my_claim",
] as const

export type ShellNavigationItemId = (typeof shellNavigationItemIds)[number]
