/**
 * Single source of truth for `/app/*` shell route metadata.
 * `shellRouteMetadataList` is derived here; the browser router subtree is built in
 * `apps/web/src/routes/route-app-shell.tsx` from this module.
 */

import type { ShellRouteMetadata } from "../contract/shell-route-metadata-contract"
import {
  buildEnabledErpModuleShellRouteDefinitions,
  erpModuleCatalog,
} from "../../erp-catalog"

const APP_BASE = "/app"

/** Full URL path for a one-segment child under `/app`. */
export function shellAppChildPath(pathSegment: string): string {
  return `${APP_BASE}/${pathSegment}`
}

/** Default child when visiting `/app` (index redirect). */
export const shellAppDefaultChildSegment = "dashboard" as const

/** `/app` layout — shell root crumb only. */
export const shellAppLayoutRoute: ShellRouteMetadata = {
  routeId: "app-layout",
  path: APP_BASE,
  shell: {
    titleKey: "breadcrumb.app",
    breadcrumbs: [{ id: "app", labelKey: "breadcrumb.app", to: APP_BASE }],
  },
}

/** Splat not-found under `/app/*` — canonical metadata for unknown segments. */
export const shellAppNotFoundRoute: ShellRouteMetadata = {
  routeId: "app-not-found",
  path: `${APP_BASE}/*`,
  shell: {
    titleKey: "error.not_found.title",
    breadcrumbs: [
      { id: "app", labelKey: "breadcrumb.app", to: APP_BASE },
      { id: "not-found", labelKey: "error.not_found.title" },
    ],
  },
}

function applyShellRouteEnhancements(
  route: ShellRouteMetadata
): ShellRouteMetadata {
  switch (route.routeId) {
    case "events":
      return {
        ...route,
        shell: {
          ...route.shell,
          headerActions: [
            {
              id: "refresh-events",
              labelKey: "actions.refresh",
              kind: "command",
              commandId: "refresh-events-view",
            },
          ],
          contextBar: {
            tabs: [
              {
                id: "events-overview",
                labelKey: "context_bar.events.tabs.overview",
                kind: "link",
                to: shellAppChildPath("events"),
              },
              {
                id: "events-audit",
                labelKey: "context_bar.events.tabs.audit",
                kind: "link",
                to: shellAppChildPath("audit"),
              },
              {
                id: "events-counterparties",
                labelKey: "context_bar.events.tabs.counterparties",
                kind: "link",
                to: shellAppChildPath("counterparties"),
                badgeCount: 2,
              },
            ],
            actions: [
              {
                id: "events-refresh",
                labelKey: "context_bar.events.actions.refresh",
                presentation: "button",
                kind: "command",
                commandId: "refresh-events-view",
              },
              {
                id: "events-audit-action",
                labelKey: "context_bar.events.actions.open_audit",
                presentation: "icon",
                kind: "link",
                to: shellAppChildPath("audit"),
                iconName: "ShieldIcon",
              },
              {
                id: "events-open-menu",
                labelKey: "context_bar.events.actions.more",
                presentation: "menu",
                menuItems: [
                  {
                    id: "events-open-audit",
                    labelKey: "context_bar.events.actions.menu.audit",
                    kind: "link",
                    to: shellAppChildPath("audit"),
                  },
                  {
                    id: "events-open-counterparties",
                    labelKey: "context_bar.events.actions.menu.counterparties",
                    kind: "link",
                    to: shellAppChildPath("counterparties"),
                  },
                  {
                    id: "events-refresh-menu",
                    labelKey: "context_bar.events.actions.menu.refresh",
                    kind: "command",
                    commandId: "refresh-events-view",
                  },
                ],
              },
            ],
          },
        },
        coverage: {
          descendantSamplePaths: ["/app/events/123"],
        },
      }
    case "counterparties":
      return {
        ...route,
        coverage: {
          descendantSamplePaths: ["/app/counterparties/acme/settings"],
        },
      }
    default:
      return route
  }
}

const enabledErpShellRouteDefinitions =
  buildEnabledErpModuleShellRouteDefinitions({
    appBasePath: APP_BASE,
    catalog: erpModuleCatalog,
  }).map((definition) => ({
    ...definition,
    metadata: applyShellRouteEnhancements(definition.metadata),
  }))

function getEnabledShellRouteByRouteId(routeId: string): ShellRouteMetadata {
  const route = enabledErpShellRouteDefinitions.find(
    (definition) => definition.metadata.routeId === routeId
  )?.metadata

  if (!route) {
    throw new Error(`shell_route_missing_from_erp_catalog:${routeId}`)
  }

  return route
}

export const shellAppSettingsAccountRoute =
  getEnabledShellRouteByRouteId("settings-account")
export const shellAppSettingsSecurityRoute =
  getEnabledShellRouteByRouteId("settings-security")

/** Better Auth UI settings (account + security tabs). */
export const shellAppSettingsAccountPath = shellAppSettingsAccountRoute.path
export const shellAppSettingsSecurityPath = shellAppSettingsSecurityRoute.path

/** Transitional short-path redirect to the account settings route. */
const shellAppAccountRedirectRoute: ShellRouteMetadata = {
  routeId: "account",
  path: shellAppChildPath("account"),
  shell: {
    ...shellAppSettingsAccountRoute.shell,
    breadcrumbs: [
      { id: "app", labelKey: "breadcrumb.app", to: APP_BASE },
      {
        id: "account",
        labelKey: "breadcrumb.account",
        to: shellAppSettingsAccountPath,
      },
    ],
  },
}

const shellAppDirectChildRouteIds = [
  "dashboard",
  "events",
  "audit",
  "counterparties",
  "db-studio",
  "finance-accounting",
  "invoices",
  "allocations",
  "settlements",
] as const

/**
 * Authenticated one-segment app children. Multi-segment enabled routes are exposed through
 * {@link shellAppCompoundChildPaths}; planned catalog entries are intentionally excluded.
 */
export const shellAppChildRouteDefinitions = [
  {
    pathSegment: "account",
    metadata: shellAppAccountRedirectRoute,
  },
  ...shellAppDirectChildRouteIds.map((routeId) => {
    const metadata = getEnabledShellRouteByRouteId(routeId)
    return {
      pathSegment: metadata.path.slice(`${APP_BASE}/`.length),
      metadata,
    }
  }),
] as const

/**
 * Compound paths under `/app/*` (not single-segment — see {@link shellAppChildRouteDefinitions}).
 * Included in router parity tests with flat segment routes.
 */
export const shellAppCompoundChildPaths = [
  ...enabledErpShellRouteDefinitions
    .map((definition) => definition.pathSegment)
    .filter((pathSegment) => pathSegment.includes("/")),
] as const

/** Canonical child path segments (single source for router parity and tooling). */
export const shellAppChildPathSegments = [
  ...shellAppChildRouteDefinitions.map((definition) => definition.pathSegment),
  ...shellAppCompoundChildPaths,
] as readonly string[]

export const shellRouteMetadataList: readonly ShellRouteMetadata[] = [
  shellAppLayoutRoute,
  shellAppAccountRedirectRoute,
  ...enabledErpShellRouteDefinitions.map((definition) => definition.metadata),
  shellAppNotFoundRoute,
]
