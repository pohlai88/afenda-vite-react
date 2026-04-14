export const shellNavigationItemIds = [
  "events",
  "audit",
  "partners",
  "my_project",
  "my_team",
  "my_report",
  "my_claim",
] as const

export type ShellNavigationItemId = (typeof shellNavigationItemIds)[number]
