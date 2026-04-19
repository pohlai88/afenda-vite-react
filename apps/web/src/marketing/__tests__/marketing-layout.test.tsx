import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

vi.mock("../marketing-theme-provider", () => ({
  MarketingThemeProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="marketing-theme-provider">{children}</div>
  ),
}))

vi.mock("@afenda/design-system/ui-primitives", () => ({
  Toaster: () => <div data-testid="marketing-toaster" />,
}))

import { MarketingLayout } from "../marketing-layout"

describe("MarketingLayout", () => {
  it("renders the marketing provider stack, shell container, outlet, and toaster", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<MarketingLayout />}>
            <Route
              path="/"
              element={<div data-testid="marketing-outlet">landing</div>}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByTestId("marketing-theme-provider")).toBeInTheDocument()
    expect(screen.getByTestId("marketing-outlet")).toBeInTheDocument()
    expect(screen.getByTestId("marketing-toaster")).toBeInTheDocument()
    expect(container.querySelector(".marketing-root")).not.toBeNull()
    expect(container.querySelector(".marketing-shell-content")).not.toBeNull()
  })
})
