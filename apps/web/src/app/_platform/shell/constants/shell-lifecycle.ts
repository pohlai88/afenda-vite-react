/**
 * Governed lifecycle for shell navigation items (UX semantics are fixed — see README / tests).
 */
export const shellNavigationLifecycleStatuses = [
  "active",
  "beta",
  "comingSoon",
  "disabled",
  "deprecated",
] as const

export type ShellNavigationLifecycleStatus =
  (typeof shellNavigationLifecycleStatuses)[number]
