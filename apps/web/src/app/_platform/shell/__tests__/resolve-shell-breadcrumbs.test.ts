import { describe, expect, it } from "vitest"

import type { ShellBreadcrumbDescriptor } from "../contract/shell-breadcrumb-contract"
import { resolveShellBreadcrumbs } from "../services/resolve-shell-breadcrumbs"

describe("resolveShellBreadcrumbs", () => {
  const translate = (key: string): string => `t:${key}`

  it("returns an empty array when no segments are provided", () => {
    expect(
      resolveShellBreadcrumbs({
        pathname: "/dashboard",
        segments: [],
        translate,
      })
    ).toEqual([])
  })

  it("marks the final segment as the current page", () => {
    const segments: readonly ShellBreadcrumbDescriptor[] = [
      { id: "dashboard", labelKey: "nav.dashboard", to: "/dashboard" },
      {
        id: "settings",
        labelKey: "nav.settings",
        to: "/dashboard/settings",
      },
      {
        id: "profile",
        labelKey: "nav.profile",
        to: "/dashboard/settings/profile",
      },
    ]

    expect(
      resolveShellBreadcrumbs({
        pathname: "/dashboard/settings/profile",
        segments,
        translate,
      })
    ).toEqual([
      {
        id: "dashboard",
        labelKey: "nav.dashboard",
        label: "t:nav.dashboard",
        to: "/dashboard",
        kind: "link",
        isCurrentPage: false,
      },
      {
        id: "settings",
        labelKey: "nav.settings",
        label: "t:nav.settings",
        to: "/dashboard/settings",
        kind: "link",
        isCurrentPage: false,
      },
      {
        id: "profile",
        labelKey: "nav.profile",
        label: "t:nav.profile",
        to: "/dashboard/settings/profile",
        kind: "page",
        isCurrentPage: true,
      },
    ])
  })

  it("does not resolve a non-terminal segment as a link when it targets the current pathname", () => {
    const segments: readonly ShellBreadcrumbDescriptor[] = [
      { id: "dashboard", labelKey: "nav.dashboard", to: "/dashboard" },
      { id: "details", labelKey: "nav.details" },
    ]

    const result = resolveShellBreadcrumbs({
      pathname: "/dashboard",
      segments,
      translate,
    })

    expect(result[0]).toEqual({
      id: "dashboard",
      labelKey: "nav.dashboard",
      label: "t:nav.dashboard",
      to: "/dashboard",
      kind: "page",
      isCurrentPage: false,
    })
  })

  it("resolves segments without `to` as page items", () => {
    const segments: readonly ShellBreadcrumbDescriptor[] = [
      { id: "dashboard", labelKey: "nav.dashboard", to: "/dashboard" },
      { id: "users", labelKey: "nav.users" },
    ]

    const result = resolveShellBreadcrumbs({
      pathname: "/dashboard/users",
      segments,
      translate,
    })

    expect(result[1]).toEqual({
      id: "users",
      labelKey: "nav.users",
      label: "t:nav.users",
      to: undefined,
      kind: "page",
      isCurrentPage: true,
    })
  })

  it("normalizes trailing slashes before comparison", () => {
    const segments: readonly ShellBreadcrumbDescriptor[] = [
      { id: "dashboard", labelKey: "nav.dashboard", to: "/dashboard/" },
      { id: "users", labelKey: "nav.users", to: "/dashboard/users/" },
    ]

    const result = resolveShellBreadcrumbs({
      pathname: "/dashboard/users/",
      segments,
      translate,
    })

    expect(result).toEqual([
      {
        id: "dashboard",
        labelKey: "nav.dashboard",
        label: "t:nav.dashboard",
        to: "/dashboard",
        kind: "link",
        isCurrentPage: false,
      },
      {
        id: "users",
        labelKey: "nav.users",
        label: "t:nav.users",
        to: "/dashboard/users",
        kind: "page",
        isCurrentPage: true,
      },
    ])
  })

  it("retains source ids exactly as provided", () => {
    const segments: readonly ShellBreadcrumbDescriptor[] = [
      { id: "tenant-home", labelKey: "nav.home", to: "/" },
    ]

    const result = resolveShellBreadcrumbs({
      pathname: "/",
      segments,
      translate,
    })

    expect(result[0].id).toBe("tenant-home")
  })

  it("uses the supplied translator to resolve final labels", () => {
    const segments: readonly ShellBreadcrumbDescriptor[] = [
      { id: "billing", labelKey: "nav.billing", to: "/billing" },
    ]

    const result = resolveShellBreadcrumbs({
      pathname: "/billing",
      segments,
      translate: (key) => `resolved:${key}`,
    })

    expect(result[0].label).toBe("resolved:nav.billing")
  })
})
