import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

vi.mock("../routes/auth-theme-provider", () => ({
  AuthThemeProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="auth-theme-provider">{children}</div>
  ),
}))

vi.mock("../better-auth-ui/afenda-public-auth-ui-provider", () => ({
  AfendaPublicAuthUiProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="auth-ui-provider">{children}</div>
  ),
}))

vi.mock("@afenda/design-system/ui-primitives", () => ({
  Toaster: () => <div data-testid="auth-toaster" />,
}))

import { AuthLayout } from "../routes/auth-layout"

describe("AuthLayout", () => {
  it("renders the standalone auth provider stack, shell container, outlet, and toaster", () => {
    const { container } = render(
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

    expect(screen.getByTestId("auth-theme-provider")).toBeInTheDocument()
    expect(screen.getByTestId("auth-ui-provider")).toBeInTheDocument()
    expect(screen.getByTestId("auth-outlet")).toBeInTheDocument()
    expect(screen.getByTestId("auth-toaster")).toBeInTheDocument()
    expect(container.querySelector(".auth-root")).not.toBeNull()
    expect(container.querySelector(".auth-shell-content")).not.toBeNull()
  })
})
