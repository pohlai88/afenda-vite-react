import { render, screen, waitFor } from "@testing-library/react"
import { Suspense } from "react"
import { createMemoryRouter, Outlet, RouterProvider } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

vi.mock("../../auth-paths", () => ({
  AUTH_ROUTES: {
    login: "/auth/login",
    register: "/auth/register",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    callback: "/auth/callback",
  },
}))

vi.mock("../route-auth-unified", () => ({
  RouteAuthUnified: () => (
    <div data-testid="route-auth-unified">auth-unified</div>
  ),
}))

vi.mock("../route-auth-callback", () => ({
  RouteAuthCallback: () => (
    <div data-testid="route-auth-callback">auth-callback</div>
  ),
}))

vi.mock("../auth-layout", () => ({
  AuthLayout: () => (
    <div data-testid="auth-layout-shell">
      <Outlet />
    </div>
  ),
}))

import { authRouteObjects } from "../route-auth"

describe("authRouteObjects", () => {
  it("renders the standalone auth route inside its own shell", async () => {
    const router = createMemoryRouter(authRouteObjects, {
      initialEntries: ["/auth/login"],
    })

    render(
      <Suspense fallback={null}>
        <RouterProvider router={router} />
      </Suspense>
    )

    expect(await screen.findByTestId("auth-layout-shell")).toBeInTheDocument()
    expect(await screen.findByTestId("route-auth-unified")).toBeInTheDocument()
  })

  it("renders the explicit auth callback route inside the auth shell", async () => {
    const router = createMemoryRouter(authRouteObjects, {
      initialEntries: ["/auth/callback"],
    })

    render(
      <Suspense fallback={null}>
        <RouterProvider router={router} />
      </Suspense>
    )

    expect(await screen.findByTestId("auth-layout-shell")).toBeInTheDocument()
    expect(await screen.findByTestId("route-auth-callback")).toBeInTheDocument()
  })

  it("redirects legacy short paths to canonical auth URLs", async () => {
    const router = createMemoryRouter(authRouteObjects, {
      initialEntries: ["/login"],
    })

    render(
      <Suspense fallback={null}>
        <RouterProvider router={router} />
      </Suspense>
    )

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/auth/login")
    })
  })
})
