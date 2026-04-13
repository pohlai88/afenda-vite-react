export const shellNavigationItemIds = ["events", "audit", "partners"] as const

export type ShellNavigationItemId = (typeof shellNavigationItemIds)[number]
