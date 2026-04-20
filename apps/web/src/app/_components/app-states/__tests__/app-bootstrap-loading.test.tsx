import { act, render, screen } from "@testing-library/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { initI18n } from "../../../_platform/i18n"

import { AppBootstrapLoading } from "../app-bootstrap-loading"

describe("AppBootstrapLoading", () => {
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

  it("renders a cheap app-shell loading state without canvas work", async () => {
    await act(async () => {
      render(<AppBootstrapLoading />)
    })

    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true")
    expect(screen.getByText("Loading ERP System…")).toBeInTheDocument()
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
    expect(document.querySelector("canvas")).toBeNull()
  })
})
