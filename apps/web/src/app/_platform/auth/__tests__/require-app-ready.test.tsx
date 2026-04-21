import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

type MockSetupState = {
  state: "auth" | "workspace_required" | "profile_recommended" | "ready"
  isPending: boolean
}

let mockSetupState: MockSetupState = {
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
    mockSetupState = {
      state: "ready",
      isPending: false,
    }

    render(
      <MemoryRouter initialEntries={["/app/reports"]}>
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
      </MemoryRouter>
    )

    expect(screen.getByTestId("protected-app")).toBeInTheDocument()
  })

  it("redirects workspace-required users to setup and preserves the return target", async () => {
    mockSetupState = {
      state: "workspace_required",
      isPending: false,
    }

    render(
      <MemoryRouter initialEntries={["/app/reports?tab=1#pane"]}>
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
      </MemoryRouter>
    )

    const probe = await screen.findByTestId("setup-probe")
    expect(probe).toHaveAttribute("data-pathname", "/app/reports")
    expect(probe).toHaveAttribute("data-search", "?tab=1")
    expect(probe).toHaveAttribute("data-hash", "#pane")
  })
})
