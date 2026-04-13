export const shellNavigationGroupIds = ["workspace"] as const

export type ShellNavigationGroupId = (typeof shellNavigationGroupIds)[number]
