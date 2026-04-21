import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { createMemoryRouter, Outlet, RouterProvider } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

vi.mock("../../../../_components", () => ({
  AppRouteErrorFallback: () => <div data-testid="setup-error-fallback" />,
}))

vi.mock("../../../theme/app-theme-provider", () => ({
  AppThemeProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock("../../better-auth-ui/afenda-auth-ui-provider", () => ({
  AfendaAuthUiProvider: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}))

vi.mock("../../guards/require-auth", () => ({
  RequireAuth: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock("../../guards/require-setup-route", () => ({
  RequireSetupRoute: ({ children }: { children?: ReactNode }) => (
    <>{children ?? <div data-testid="setup-index-resolver" />}</>
  ),
}))

vi.mock("../../../../_features/setup", () => ({
  SetupLayout: () => (
    <div data-testid="setup-layout-shell">
      <Outlet />
    </div>
  ),
  WorkspaceSetupPage: () => <div data-testid="workspace-setup-page" />,
  ProfileSetupPage: () => <div data-testid="profile-setup-page" />,
}))

import { setupRouteObject } from "../route-setup"

describe("setupRouteObject", () => {
  it("renders the standalone setup route inside its own shell", () => {
    const router = createMemoryRouter([setupRouteObject], {
      initialEntries: ["/setup/workspace"],
    })

    render(<RouterProvider router={router} />)

    expect(screen.getByTestId("setup-layout-shell")).toBeInTheDocument()
    expect(screen.getByTestId("workspace-setup-page")).toBeInTheDocument()
  })

  it("renders the setup index resolver at /setup", () => {
    const router = createMemoryRouter([setupRouteObject], {
      initialEntries: ["/setup"],
    })

    render(<RouterProvider router={router} />)

    expect(screen.getByTestId("setup-layout-shell")).toBeInTheDocument()
    expect(screen.getByTestId("setup-index-resolver")).toBeInTheDocument()
  })
})
