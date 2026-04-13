/**
 * SHELL INVARIANT CODES
 *
 * Stable machine-readable identifiers for governed shell route catalog failures.
 * This registry is web-local and intentionally does not import database/audit code.
 */

export const shellInvariantCodeRegistry = {
  SHELL_INV_SCOPE_001: "governed route must declare shell metadata",
  SHELL_INV_SCOPE_002: "app-shell 404 must be governed",

  SHELL_INV_ID_001: "routeId must be globally unique",
  SHELL_INV_ID_002: "breadcrumb id must be unique within a trail",
  SHELL_INV_ID_003: "breadcrumb id must be non-empty",

  SHELL_INV_FIELD_001: "titleKey must be present",
  SHELL_INV_FIELD_002: "breadcrumb labelKey must be present",
  SHELL_INV_FIELD_003: "navigable breadcrumb must not have empty to",

  SHELL_INV_STRUCT_001: "breadcrumb trail must be ordered root-to-leaf",
  SHELL_INV_STRUCT_002: "terminal breadcrumb must represent current route",
  SHELL_INV_STRUCT_003:
    "app-shell child route must begin with app root breadcrumb",

  SHELL_INV_ROUTER_001:
    "canonical child definitions must match router children",
  SHELL_INV_ROUTER_002: "router child pathSegment must be unique",
  SHELL_INV_ROUTER_003: "canonical path must match computed router path",

  SHELL_INV_RESOLVE_001: "deepest match wins deterministically",
  SHELL_INV_RESOLVE_002:
    "resolved breadcrumb set must be stable for same pathname",

  SHELL_INV_ACTION_001: "header action id empty or duplicate within route",
  SHELL_INV_ACTION_002: "header action labelKey invalid",
  SHELL_INV_ACTION_003: "header action kind invalid",
  SHELL_INV_ACTION_004: "header action link target invalid",
  SHELL_INV_ACTION_005: "header action command id invalid",
  SHELL_INV_ACTION_006: "header action payload contradictory",
} as const

export type ShellInvariantCode = keyof typeof shellInvariantCodeRegistry

export const shellInvariantSeverityValues = [
  "medium",
  "high",
  "critical",
] as const

export type ShellInvariantSeverity =
  (typeof shellInvariantSeverityValues)[number]
