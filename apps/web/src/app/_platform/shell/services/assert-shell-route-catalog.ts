import type { ShellInvariantCode } from "../contract/shell-invariant-codes"
import type { ShellRouteMetadata } from "../contract/shell-route-metadata-contract"
import type { ShellInvariantIssue } from "../contract/shell-invariant-contract"
import { shellMetadataValidationCodes } from "../contract/shell-metadata-validation-codes"
import type { ShellMetadataValidationIssue } from "./validate-shell-metadata"
import { createShellInvariantError } from "./shell-invariant-error-map"
import { validateShellMetadata } from "./validate-shell-metadata"

function pushIssue(
  issues: ShellInvariantIssue[],
  issue: ShellInvariantIssue
): void {
  issues.push(issue)
}

function checkBreadcrumbOrder(
  route: ShellRouteMetadata,
  issues: ShellInvariantIssue[]
): void {
  const breadcrumbs = route.shell.breadcrumbs ?? []

  if (breadcrumbs.length === 0) {
    return
  }

  const last = breadcrumbs[breadcrumbs.length - 1]
  if (last?.labelKey !== route.shell.titleKey) {
    pushIssue(issues, {
      code: "SHELL_INV_STRUCT_002",
      severity: "high",
      routeId: route.routeId,
      path: route.path,
      message:
        "Terminal breadcrumb must represent current route title context.",
      details: {
        terminalLabelKey: last?.labelKey,
        titleKey: route.shell.titleKey,
      },
    })
  }

  if (route.path.startsWith("/app/")) {
    const first = breadcrumbs[0]
    if (first?.id !== "app") {
      pushIssue(issues, {
        code: "SHELL_INV_STRUCT_003",
        severity: "medium",
        routeId: route.routeId,
        path: route.path,
        breadcrumbId: first?.id,
        message: "App-shell child route must begin with app root breadcrumb.",
        details: {
          expectedBreadcrumbId: "app",
          actualBreadcrumbId: first?.id ?? null,
        },
      })
    }
  }
}

/**
 * Invariant codes for breadcrumb `id` (must stay disjoint: empty ≠ duplicate-within-trail).
 * @see shellMetadataValidationCodes.EMPTY_BREADCRUMB_ID / DUPLICATE_BREADCRUMB_ID
 */
const breadcrumbIdInvariantCode = {
  duplicateWithinTrail: "SHELL_INV_ID_002",
  empty: "SHELL_INV_ID_003",
} as const satisfies Record<
  "duplicateWithinTrail" | "empty",
  ShellInvariantCode
>

/**
 * Maps `validateShellHeaderActions` subcodes embedded in
 * `SHELL_METADATA_INVALID_HEADER_ACTION` messages to stable `SHELL_INV_ACTION_*` codes.
 */
function mapShellHeaderActionValidationMessageToInvariantCode(
  message: string
): ShellInvariantCode {
  const match = /^\[([A-Z0-9_]+)\]/.exec(message)
  const sub = match?.[1]

  switch (sub) {
    case "SHELL_HEADER_ACTION_INVALID_ID":
    case "SHELL_HEADER_ACTION_DUPLICATE_ID":
      return "SHELL_INV_ACTION_001"
    case "SHELL_HEADER_ACTION_INVALID_LABEL_KEY":
      return "SHELL_INV_ACTION_002"
    case "SHELL_HEADER_ACTION_INVALID_KIND":
      return "SHELL_INV_ACTION_003"
    case "SHELL_HEADER_ACTION_MISSING_LINK_TARGET":
      return "SHELL_INV_ACTION_004"
    case "SHELL_HEADER_ACTION_MISSING_COMMAND_ID":
      return "SHELL_INV_ACTION_005"
    case "SHELL_HEADER_ACTION_INVALID_COMMAND_CONFIGURATION":
    case "SHELL_HEADER_ACTION_INVALID_LINK_CONFIGURATION":
      return "SHELL_INV_ACTION_006"
    default:
      return "SHELL_INV_ACTION_001"
  }
}

function mapValidationIssue(
  route: ShellRouteMetadata,
  issue: ShellMetadataValidationIssue
): ShellInvariantIssue {
  switch (issue.code) {
    case shellMetadataValidationCodes.EMPTY_TITLE_KEY:
      return {
        code: "SHELL_INV_FIELD_001",
        severity: "high",
        routeId: route.routeId,
        path: issue.path,
        message: issue.message,
      }

    case shellMetadataValidationCodes.EMPTY_BREADCRUMB_ID:
      return {
        code: breadcrumbIdInvariantCode.empty,
        severity: "high",
        routeId: route.routeId,
        path: issue.path,
        message: issue.message,
      }

    case shellMetadataValidationCodes.DUPLICATE_BREADCRUMB_ID:
      return {
        code: breadcrumbIdInvariantCode.duplicateWithinTrail,
        severity: "high",
        routeId: route.routeId,
        path: issue.path,
        message: issue.message,
      }

    case shellMetadataValidationCodes.EMPTY_BREADCRUMB_LABEL_KEY:
      return {
        code: "SHELL_INV_FIELD_002",
        severity: "high",
        routeId: route.routeId,
        path: issue.path,
        message: issue.message,
      }

    case shellMetadataValidationCodes.EMPTY_BREADCRUMB_TO:
      return {
        code: "SHELL_INV_FIELD_003",
        severity: "high",
        routeId: route.routeId,
        path: issue.path,
        message: issue.message,
      }

    case shellMetadataValidationCodes.INVALID_HEADER_ACTION:
      return {
        code: mapShellHeaderActionValidationMessageToInvariantCode(
          issue.message
        ),
        severity: "high",
        routeId: route.routeId,
        path: issue.path,
        message: issue.message,
      }

    default: {
      const _exhaustive: never = issue.code
      return _exhaustive
    }
  }
}

/**
 * Maps a single field validation issue to a governed invariant issue (e.g. `assertShellMetadata`).
 */
export function mapShellMetadataValidationToShellInvariant(
  route: ShellRouteMetadata,
  issue: ShellMetadataValidationIssue,
  pathPrefix?: string
): ShellInvariantIssue {
  const mapped = mapValidationIssue(route, issue)
  if (pathPrefix === undefined) {
    return mapped
  }
  return {
    ...mapped,
    path: `${pathPrefix}.${issue.path}`,
  }
}

export function collectShellRouteCatalogIssues(
  routes: readonly ShellRouteMetadata[]
): ShellInvariantIssue[] {
  const issues: ShellInvariantIssue[] = []

  const seenRouteIds = new Map<string, string>()
  const seenPaths = new Map<string, string>()

  for (const route of routes) {
    const validationIssues = validateShellMetadata(route.shell)
    for (const validationIssue of validationIssues) {
      pushIssue(issues, mapValidationIssue(route, validationIssue))
    }

    const priorRouteIdPath = seenRouteIds.get(route.routeId)
    if (priorRouteIdPath !== undefined) {
      pushIssue(issues, {
        code: "SHELL_INV_ID_001",
        severity: "critical",
        routeId: route.routeId,
        path: route.path,
        message: `Duplicate routeId '${route.routeId}' detected in shell route catalog.`,
        details: {
          firstPath: priorRouteIdPath,
          duplicatePath: route.path,
        },
      })
    } else {
      seenRouteIds.set(route.routeId, route.path)
    }

    const priorPathOwner = seenPaths.get(route.path)
    if (priorPathOwner !== undefined) {
      pushIssue(issues, {
        code: "SHELL_INV_ROUTER_003",
        severity: "high",
        routeId: route.routeId,
        path: route.path,
        message: `Duplicate canonical path '${route.path}' detected in shell route catalog.`,
        details: {
          firstRouteId: priorPathOwner,
          duplicateRouteId: route.routeId,
        },
      })
    } else {
      seenPaths.set(route.path, route.routeId)
    }

    checkBreadcrumbOrder(route, issues)
  }

  return issues
}

export function assertShellRouteCatalog(
  routes: readonly ShellRouteMetadata[]
): void {
  const issues = collectShellRouteCatalogIssues(routes)

  if (issues.length > 0) {
    throw createShellInvariantError(issues)
  }
}
