import { render, screen, waitFor } from "@testing-library/react"
import { createMemoryRouter, Outlet, RouterProvider } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

vi.mock("../../app/_platform/auth", () => ({
  AUTH_ROUTES: {
    login: "/auth/login",
    register: "/auth/register",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    callback: "/auth/callback",
  },
  RouteAuthUnified: () => (
    <div data-testid="route-auth-unified">auth-unified</div>
  ),
  RouteAuthCallback: () => (
    <div data-testid="route-auth-callback">auth-callback</div>
  ),
}))

vi.mock("../../app/_platform/auth/routes/auth-layout", () => ({
  AuthLayout: () => (
    <div data-testid="auth-layout-shell">
      <Outlet />
    </div>
  ),
}))

import { authRouteObjects } from "../route-auth"

describe("authRouteObjects", () => {
  it("renders the standalone auth route inside its own shell", () => {
    const router = createMemoryRouter(authRouteObjects, {
      initialEntries: ["/auth/login"],
    })

    render(<RouterProvider router={router} />)

    expect(screen.getByTestId("auth-layout-shell")).toBeInTheDocument()
    expect(screen.getByTestId("route-auth-unified")).toBeInTheDocument()
  })

  it("renders the explicit auth callback route inside the auth shell", () => {
    const router = createMemoryRouter(authRouteObjects, {
      initialEntries: ["/auth/callback"],
    })

    render(<RouterProvider router={router} />)

    expect(screen.getByTestId("auth-layout-shell")).toBeInTheDocument()
    expect(screen.getByTestId("route-auth-callback")).toBeInTheDocument()
  })

  it("redirects legacy short paths to canonical auth URLs", async () => {
    const router = createMemoryRouter(authRouteObjects, {
      initialEntries: ["/login"],
    })

    render(<RouterProvider router={router} />)

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/auth/login")
    })
  })
})
