import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      (
        ({
          "error.not_found.title": "Page not found",
          "error.not_found.description":
            "The requested shell route does not exist.",
          "error.not_found.link_dashboard": "Back to workspace",
          "states.tenant_scope.forbidden.title": "Access denied",
          "states.route_error.home": "Go to workspace",
        }) as const
      )[key] ?? key,
  }),
}))

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>("react-router-dom")

  return {
    ...actual,
    Link: ({
      children,
      to,
    }: {
      readonly children: ReactNode
      readonly to: string
    }) => <a href={to}>{children}</a>,
  }
})

vi.mock("../../hooks/use-shell-permissions", () => ({
  useShellPermissions: vi.fn(),
}))

vi.mock("../../hooks/use-shell-title", () => ({
  useShellTitle: vi.fn(),
}))

import { useShellPermissions } from "../../hooks/use-shell-permissions"
import { useShellTitle } from "../../hooks/use-shell-title"
import { AppShellAccessDenied } from "../app-shell-access-denied"
import { AppShellNotFound } from "../app-shell-not-found"

const mockedUseShellPermissions = vi.mocked(useShellPermissions)
const mockedUseShellTitle = vi.mocked(useShellTitle)

describe("shell route state surfaces", () => {
  it("renders the not-found shell state inside the canonical app surface", () => {
    mockedUseShellPermissions.mockReturnValue(["ops:event:view"])
    mockedUseShellTitle.mockReturnValue("Unknown route")

    render(<AppShellNotFound />)

    expect(
      screen.getByRole("heading", { name: "Shell route state" })
    ).toBeInTheDocument()
    expect(screen.getByText("Route not found")).toBeInTheDocument()
    expect(screen.getByText("Unknown route")).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Back to workspace" })
    ).toHaveAttribute("href", "/app/dashboard")
  })

  it("renders the access-denied shell state inside the canonical app surface", () => {
    mockedUseShellPermissions.mockReturnValue(["ops:event:view"])
    mockedUseShellTitle.mockReturnValue(undefined)

    render(<AppShellAccessDenied />)

    expect(
      screen.getByRole("heading", { name: "Shell route state" })
    ).toBeInTheDocument()
    expect(screen.getAllByText("Access denied")).toHaveLength(2)
    expect(
      screen.getByRole("link", { name: "Go to workspace" })
    ).toHaveAttribute("href", "/app/dashboard")
  })
})
