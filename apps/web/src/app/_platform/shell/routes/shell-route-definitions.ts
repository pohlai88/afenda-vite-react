/**
 * Single source of truth for `/app/*` shell route metadata.
 * `shellRouteMetadataList` is derived here; the browser router subtree is built in
 * `apps/web/src/routes/route-app-shell.tsx` from this module.
 */

import type { ShellRouteMetadata } from "../contract/shell-route-metadata-contract"

const APP_BASE = "/app"

/** Full URL path for a one-segment child under `/app`. */
export function shellAppChildPath(pathSegment: string): string {
  return `${APP_BASE}/${pathSegment}`
}

/** Default child when visiting `/app` (index redirect). */
export const shellAppDefaultChildSegment = "events" as const

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

/**
 * Authenticated app children (path segment + full metadata).
 * Order is not significant for resolution; index redirect uses {@link shellAppDefaultChildSegment}.
 */
export const shellAppChildRouteDefinitions = [
  {
    pathSegment: "events",
    metadata: {
      routeId: "events",
      path: shellAppChildPath("events"),
      shell: {
        titleKey: "breadcrumb.events",
        breadcrumbs: [
          { id: "app", labelKey: "breadcrumb.app", to: APP_BASE },
          {
            id: "events",
            labelKey: "breadcrumb.events",
            to: shellAppChildPath("events"),
          },
        ],
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
              id: "events-partners",
              labelKey: "context_bar.events.tabs.partners",
              kind: "link",
              to: shellAppChildPath("partners"),
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
                  id: "events-open-partners",
                  labelKey: "context_bar.events.actions.menu.partners",
                  kind: "link",
                  to: shellAppChildPath("partners"),
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
    } satisfies ShellRouteMetadata,
  },
  {
    pathSegment: "audit",
    metadata: {
      routeId: "audit",
      path: shellAppChildPath("audit"),
      shell: {
        titleKey: "breadcrumb.audit",
        breadcrumbs: [
          { id: "app", labelKey: "breadcrumb.app", to: APP_BASE },
          {
            id: "audit",
            labelKey: "breadcrumb.audit",
            to: shellAppChildPath("audit"),
          },
        ],
      },
    } satisfies ShellRouteMetadata,
  },
  {
    pathSegment: "partners",
    metadata: {
      routeId: "partners",
      path: shellAppChildPath("partners"),
      shell: {
        titleKey: "breadcrumb.partners",
        breadcrumbs: [
          { id: "app", labelKey: "breadcrumb.app", to: APP_BASE },
          {
            id: "partners",
            labelKey: "breadcrumb.partners",
            to: shellAppChildPath("partners"),
          },
        ],
      },
      coverage: {
        descendantSamplePaths: ["/app/partners/acme/settings"],
      },
    } satisfies ShellRouteMetadata,
  },
] as const

/** Canonical child path segments (single source for router parity and tooling). */
export const shellAppChildPathSegments = shellAppChildRouteDefinitions.map(
  (definition) => definition.pathSegment
) as readonly string[]

/**
 * All canonical `/app` shell routes (layout + children), for hooks and tooling.
 * Derived from layout + {@link shellAppChildRouteDefinitions}.
 */
export const shellRouteMetadataList: readonly ShellRouteMetadata[] = [
  shellAppLayoutRoute,
  ...shellAppChildRouteDefinitions.map((c) => c.metadata),
  shellAppNotFoundRoute,
]
