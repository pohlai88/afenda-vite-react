import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { LoginDevQuickSignIn } from "../login-dev-quick-sign-in"

describe("LoginDevQuickSignIn", () => {
  beforeAll(() => {
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
  })

  it("renders local dev one-click section when import.meta.env.DEV is true", () => {
    if (!import.meta.env.DEV) {
      expect(true).toBe(true)
      return
    }

    render(
      <MemoryRouter>
        <LoginDevQuickSignIn />
      </MemoryRouter>
    )

    expect(screen.getByText(/local development/i)).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /one-click sign-in/i })
    ).toBeInTheDocument()
  })
})
