import { describe, expect, it } from "vitest"

import type { ShellRouteMetadata } from "../contract/shell-route-metadata-contract"
import {
  assertShellRouteCatalog,
  collectShellRouteCatalogIssues,
} from "../services/assert-shell-route-catalog"
import { shellAppLayoutRoute } from "../routes/shell-route-definitions"

function makeRoute(
  overrides: Partial<ShellRouteMetadata> = {}
): ShellRouteMetadata {
  return {
    routeId: "events",
    path: "/app/events",
    shell: {
      titleKey: "breadcrumb.events",
      breadcrumbs: [
        { id: "app", labelKey: "breadcrumb.app", to: "/app" },
        {
          id: "events",
          labelKey: "breadcrumb.events",
          to: "/app/events",
        },
      ],
    },
    ...overrides,
  }
}

describe("assertShellRouteCatalog", () => {
  it("accepts valid governed shell routes", () => {
    expect(() =>
      assertShellRouteCatalog([shellAppLayoutRoute, makeRoute()])
    ).not.toThrow()
  })

  it("fails on duplicate routeId", () => {
    const dupShell = {
      titleKey: "breadcrumb.events",
      breadcrumbs: [
        { id: "app", labelKey: "breadcrumb.app", to: "/app" },
        {
          id: "events",
          labelKey: "breadcrumb.events",
          to: "/app/events",
        },
      ],
    } as const

    const issues = collectShellRouteCatalogIssues([
      { routeId: "dup", path: "/app/events", shell: dupShell },
      { routeId: "dup", path: "/app/reports", shell: dupShell },
    ])

    expect(issues.some((issue) => issue.code === "SHELL_INV_ID_001")).toBe(true)
  })

  it("fails when app-shell child route does not start with app breadcrumb", () => {
    const issues = collectShellRouteCatalogIssues([
      makeRoute({
        shell: {
          titleKey: "breadcrumb.events",
          breadcrumbs: [
            {
              id: "events",
              labelKey: "breadcrumb.events",
              to: "/app/events",
            },
          ],
        },
      }),
    ])

    expect(issues.some((issue) => issue.code === "SHELL_INV_STRUCT_003")).toBe(
      true
    )
  })

  it("fails when terminal breadcrumb does not match titleKey", () => {
    const issues = collectShellRouteCatalogIssues([
      makeRoute({
        shell: {
          titleKey: "breadcrumb.events",
          breadcrumbs: [
            { id: "app", labelKey: "breadcrumb.app", to: "/app" },
            {
              id: "events",
              labelKey: "breadcrumb.reports",
              to: "/app/events",
            },
          ],
        },
      }),
    ])

    expect(issues.some((issue) => issue.code === "SHELL_INV_STRUCT_002")).toBe(
      true
    )
  })

  it("maps duplicate breadcrumb ids to SHELL_INV_ID_002 (not empty-id code)", () => {
    const issues = collectShellRouteCatalogIssues([
      makeRoute({
        shell: {
          titleKey: "breadcrumb.events",
          breadcrumbs: [
            { id: "app", labelKey: "breadcrumb.app", to: "/app" },
            {
              id: "dup",
              labelKey: "breadcrumb.events",
              to: "/app/events",
            },
            {
              id: "dup",
              labelKey: "breadcrumb.events",
              to: "/app/events",
            },
          ],
        },
      }),
    ])

    expect(
      issues.filter((i) => i.code === "SHELL_INV_ID_002").length
    ).toBeGreaterThan(0)
    expect(issues.some((i) => i.code === "SHELL_INV_ID_003")).toBe(false)
  })

  it("maps empty breadcrumb id to SHELL_INV_ID_003 (not duplicate-within-trail code)", () => {
    const issues = collectShellRouteCatalogIssues([
      makeRoute({
        shell: {
          titleKey: "breadcrumb.events",
          breadcrumbs: [
            { id: "app", labelKey: "breadcrumb.app", to: "/app" },
            {
              id: "",
              labelKey: "breadcrumb.events",
              to: "/app/events",
            },
          ],
        },
      }),
    ])

    expect(
      issues.filter((i) => i.code === "SHELL_INV_ID_003").length
    ).toBeGreaterThan(0)
    expect(issues.some((i) => i.code === "SHELL_INV_ID_002")).toBe(false)
  })

  it("emits only empty-id invariants for repeated blank ids (never duplicate)", () => {
    const issues = collectShellRouteCatalogIssues([
      makeRoute({
        shell: {
          titleKey: "breadcrumb.events",
          breadcrumbs: [
            { id: "app", labelKey: "breadcrumb.app", to: "/app" },
            { id: "", labelKey: "a", to: "/app/events" },
            { id: "", labelKey: "b", to: "/app/events" },
          ],
        },
      }),
    ])

    expect(issues.filter((i) => i.code === "SHELL_INV_ID_003").length).toBe(2)
    expect(issues.some((i) => i.code === "SHELL_INV_ID_002")).toBe(false)
  })

  it("maps metadata validation issues into shell invariant issues", () => {
    const issues = collectShellRouteCatalogIssues([
      makeRoute({
        shell: {
          titleKey: "",
          breadcrumbs: [
            { id: "app", labelKey: "breadcrumb.app", to: "/app" },
            {
              id: "",
              labelKey: "",
              to: " ",
            },
          ],
        },
      }),
    ])

    expect(issues.some((issue) => issue.code === "SHELL_INV_FIELD_001")).toBe(
      true
    )
    expect(issues.some((issue) => issue.code === "SHELL_INV_ID_003")).toBe(true)
    expect(issues.some((issue) => issue.code === "SHELL_INV_FIELD_002")).toBe(
      true
    )
    expect(issues.some((issue) => issue.code === "SHELL_INV_FIELD_003")).toBe(
      true
    )
  })
})
