import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { initI18n } from "../../../i18n"
import {
  TenantScopeTestDoubleProvider,
  type TenantScopeState,
} from "../../../tenant"
import { ShellTenantScopeBanner } from "../shell-tenant-scope-banner"

vi.mock("../../../auth", () => ({
  authClient: {
    signOut: vi.fn().mockResolvedValue(undefined),
  },
}))

describe("ShellTenantScopeBanner", () => {
  beforeAll(async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }))
    )
    await initI18n()
  })

  it("renders nothing when optional tenant scope is absent", () => {
    const router = createMemoryRouter(
      [{ path: "/app", element: <ShellTenantScopeBanner /> }],
      { initialEntries: ["/app"] }
    )
    render(<RouterProvider router={router} />)
    expect(screen.queryByTestId("shell-tenant-scope-banner")).toBeNull()
  })

  it("renders nothing when tenant scope is idle", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/app",
          element: (
            <TenantScopeTestDoubleProvider value={{ status: "idle" }}>
              <ShellTenantScopeBanner />
            </TenantScopeTestDoubleProvider>
          ),
        },
      ],
      { initialEntries: ["/app"] }
    )
    render(<RouterProvider router={router} />)
    expect(screen.queryByTestId("shell-tenant-scope-banner")).toBeNull()
  })

  it("renders destructive alert and retry when tenant scope is error", async () => {
    const user = userEvent.setup()
    const retry = vi.fn()
    const errorState: TenantScopeState = {
      status: "error",
      kind: "api_session",
      httpStatus: 401,
      retry,
    }
    const router = createMemoryRouter(
      [
        {
          path: "/app",
          element: (
            <TenantScopeTestDoubleProvider value={errorState}>
              <ShellTenantScopeBanner />
            </TenantScopeTestDoubleProvider>
          ),
        },
      ],
      { initialEntries: ["/app"] }
    )
    render(<RouterProvider router={router} />)

    expect(screen.getByTestId("shell-tenant-scope-banner")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Retry" }))
    expect(retry).toHaveBeenCalledTimes(1)
  })

  it("shows forbidden copy when kind is forbidden", () => {
    const errorState: TenantScopeState = {
      status: "error",
      kind: "forbidden",
      httpStatus: 403,
      retry: vi.fn(),
    }
    const router = createMemoryRouter(
      [
        {
          path: "/app",
          element: (
            <TenantScopeTestDoubleProvider value={errorState}>
              <ShellTenantScopeBanner />
            </TenantScopeTestDoubleProvider>
          ),
        },
      ],
      { initialEntries: ["/app"] }
    )
    render(<RouterProvider router={router} />)

    expect(screen.getByText("Access denied")).toBeInTheDocument()
  })
})
