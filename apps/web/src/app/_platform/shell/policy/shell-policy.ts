/**
 * Shell capability metadata and boundary hints for tests / docs.
 */
export const shellCapabilityContract = {
  id: "shell",
  title: "App shell",
  summary:
    "Authenticated ERP runtime frame: sidebar, header, breadcrumbs, route composition.",
} as const

/** Default advisory permission set for v1 (empty — show all non-disabled nav). */
export const defaultShellPermissionsStub: readonly string[] = []
