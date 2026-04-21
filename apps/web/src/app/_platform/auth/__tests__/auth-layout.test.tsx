import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

vi.mock("../../theme/public-theme-provider", () => ({
  PublicThemeProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="public-theme-provider">{children}</div>
  ),
}))

vi.mock("../better-auth-ui/afenda-auth-ui-provider", () => ({
  AfendaAuthUiProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="auth-ui-provider">{children}</div>
  ),
}))

vi.mock("@afenda/design-system/ui-primitives", () => ({
  Toaster: () => <div data-testid="auth-toaster" />,
}))

import { AuthLayout } from "../routes/auth-layout"

describe("AuthLayout", () => {
  it("renders the standalone auth provider stack, shell container, outlet, and toaster", () => {
    render(
      <MemoryRouter initialEntries={["/auth/login"]}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route
              path="/auth/login"
              element={<div data-testid="auth-outlet">auth-screen</div>}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByTestId("public-theme-provider")).toBeInTheDocument()
    expect(screen.getByTestId("auth-ui-provider")).toBeInTheDocument()
    expect(screen.getByTestId("auth-outlet")).toBeInTheDocument()
    expect(screen.getByTestId("auth-toaster")).toBeInTheDocument()
    expect(screen.getByTestId("auth-layout-root")).toBeInTheDocument()
  })
})
