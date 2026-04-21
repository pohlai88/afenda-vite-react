import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

type MockSetupState = {
  state: "auth" | "workspace_required" | "profile_recommended" | "ready"
  isPending: boolean
}

let mockSetupState: MockSetupState = {
  state: "ready",
  isPending: false,
}

let mockDestination = "/app"

vi.mock("../hooks/use-auth-setup-state", () => ({
  useAuthSetupState: () => mockSetupState,
}))

vi.mock("../hooks/use-auth-post-login-destination", () => ({
  useAuthPostLoginDestination: () => mockDestination,
}))

vi.mock("@/app/_components/app-states/app-bootstrap-loading", () => ({
  AppBootstrapLoading: () => <div data-testid="app-bootstrap-loading" />,
}))

import { RequireSetupRoute } from "../guards/require-setup-route"

function renderSetupRoute(
  pathname: string,
  mode: "index" | "workspace" | "profile"
) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <Routes>
        <Route path="/setup" element={<RequireSetupRoute mode="index" />} />
        <Route
          path="/setup/workspace"
          element={
            <RequireSetupRoute mode={mode}>
              <div data-testid="workspace-child">workspace</div>
            </RequireSetupRoute>
          }
        />
        <Route
          path="/setup/profile"
          element={
            <RequireSetupRoute mode="profile">
              <div data-testid="profile-child">profile</div>
            </RequireSetupRoute>
          }
        />
        <Route path="/app" element={<div data-testid="app-route">app</div>} />
        <Route
          path="/auth/login"
          element={<div data-testid="auth-route">login</div>}
        />
      </Routes>
    </MemoryRouter>
  )
}

describe("RequireSetupRoute", () => {
  it("lets workspace-required users stay on the workspace route", () => {
    mockSetupState = {
      state: "workspace_required",
      isPending: false,
    }

    renderSetupRoute("/setup/workspace", "workspace")

    expect(screen.getByTestId("workspace-child")).toBeInTheDocument()
  })

  it("redirects index to the profile route when profile completion is recommended", async () => {
    mockSetupState = {
      state: "profile_recommended",
      isPending: false,
    }

    renderSetupRoute("/setup", "workspace")

    expect(await screen.findByTestId("profile-child")).toBeInTheDocument()
  })

  it("redirects workspace-ready users away from the mandatory workspace route", async () => {
    mockSetupState = {
      state: "ready",
      isPending: false,
    }
    mockDestination = "/app"

    renderSetupRoute("/setup/workspace", "workspace")

    expect(await screen.findByTestId("app-route")).toBeInTheDocument()
  })

  it("redirects unauthenticated users back to auth", async () => {
    mockSetupState = {
      state: "auth",
      isPending: false,
    }

    renderSetupRoute("/setup/profile", "profile")

    expect(await screen.findByTestId("auth-route")).toBeInTheDocument()
  })
})
