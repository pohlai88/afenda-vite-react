import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

import { TenantScopeTestDoubleProvider } from "../../tenant"

type MockSetupState = {
  state: "auth" | "workspace_required" | "profile_recommended" | "ready"
  isPending: boolean
}

const mockSetupState: MockSetupState = {
  state: "ready",
  isPending: false,
}

vi.mock("../hooks/use-auth-setup-state", () => ({
  useAuthSetupState: () => mockSetupState,
}))

vi.mock("@/app/_components/app-states/app-bootstrap-loading", () => ({
  AppBootstrapLoading: () => <div data-testid="app-bootstrap-loading" />,
}))

import { RequireAppReady } from "../guards/require-app-ready"

function SetupProbe() {
  const location = useLocation()
  const returnTarget = location.state?.returnTarget as
    | { pathname?: string; search?: string; hash?: string }
    | undefined

  return (
    <div
      data-testid="setup-probe"
      data-pathname={returnTarget?.pathname ?? ""}
      data-search={returnTarget?.search ?? ""}
      data-hash={returnTarget?.hash ?? ""}
    />
  )
}

describe("RequireAppReady", () => {
  it("renders children when the app is ready", () => {
    render(
      <MemoryRouter initialEntries={["/app/reports"]}>
        <TenantScopeTestDoubleProvider
          value={{
            status: "ready",
            me: {
              betterAuth: {
                user: { id: "better-auth-user-1" },
                session: { id: "auth-session-1" },
              },
              afenda: {
                afendaUserId: "user-1",
                tenantIds: ["tenant-1"],
                defaultTenantId: "tenant-1",
              },
              actor: {
                id: "user-1",
                roles: [],
                permissions: [],
              },
              tenant: {
                id: "tenant-1",
                memberships: [],
                capabilities: [],
              },
              truthContext: {
                enabledModules: ["ops"],
                commandMatrix: [],
              },
              session: {
                id: "auth-session-1",
                activeTenantId: "tenant-1",
                activeMembershipId: "membership-1",
              },
              setup: {
                state: "ready",
                hasTenantContext: true,
                profileRecommended: false,
              },
            },
            selectedTenantId: "tenant-1",
            tenantChoices: [],
            setSelectedTenantId: vi.fn(),
          }}
        >
          <Routes>
            <Route
              path="/app/reports"
              element={
                <RequireAppReady>
                  <div data-testid="protected-app">app</div>
                </RequireAppReady>
              }
            />
          </Routes>
        </TenantScopeTestDoubleProvider>
      </MemoryRouter>
    )

    expect(screen.getByTestId("protected-app")).toBeInTheDocument()
  })

  it("redirects workspace-required users to setup and preserves the return target", async () => {
    render(
      <MemoryRouter initialEntries={["/app/reports?tab=1#pane"]}>
        <TenantScopeTestDoubleProvider
          value={{
            status: "ready",
            me: {
              betterAuth: {
                user: { id: "better-auth-user-1" },
                session: { id: "auth-session-1" },
              },
              afenda: {
                afendaUserId: "user-1",
                tenantIds: ["tenant-1"],
                defaultTenantId: "tenant-1",
              },
              actor: {
                id: "user-1",
                roles: [],
                permissions: [],
              },
              tenant: {
                id: "tenant-1",
                memberships: [],
                capabilities: [],
              },
              truthContext: {
                enabledModules: ["ops"],
                commandMatrix: [],
              },
              session: {
                id: "auth-session-1",
                activeTenantId: "tenant-1",
                activeMembershipId: "membership-1",
              },
              setup: {
                state: "workspace_required",
                hasTenantContext: false,
                profileRecommended: false,
              },
            },
            selectedTenantId: "tenant-1",
            tenantChoices: [],
            setSelectedTenantId: vi.fn(),
          }}
        >
          <Routes>
            <Route
              path="/app/reports"
              element={
                <RequireAppReady>
                  <div data-testid="protected-app">app</div>
                </RequireAppReady>
              }
            />
            <Route path="/setup/workspace" element={<SetupProbe />} />
          </Routes>
        </TenantScopeTestDoubleProvider>
      </MemoryRouter>
    )

    const probe = await screen.findByTestId("setup-probe")
    expect(probe).toHaveAttribute("data-pathname", "/app/reports")
    expect(probe).toHaveAttribute("data-search", "?tab=1")
    expect(probe).toHaveAttribute("data-hash", "#pane")
  })
})
