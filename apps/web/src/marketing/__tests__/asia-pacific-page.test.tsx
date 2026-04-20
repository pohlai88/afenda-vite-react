import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeAll, describe, expect, it } from "vitest"

import AsiaPacificPage from "../pages/regional/asia-pacific-page"

beforeAll(() => {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root = null
    readonly rootMargin = "0px"
    readonly thresholds = [0]

    disconnect() {}

    observe() {}

    takeRecords(): IntersectionObserverEntry[] {
      return []
    }

    unobserve() {}
  }

  window.IntersectionObserver = MockIntersectionObserver
  globalThis.IntersectionObserver = MockIntersectionObserver
})

describe("AsiaPacificPage", () => {
  it("renders the regional page scaffold", () => {
    render(
      <MemoryRouter>
        <AsiaPacificPage />
      </MemoryRouter>
    )

    expect(
      screen.getByRole("heading", {
        name: /Asia Pacific is a real ERP context, not just a localization checkbox\./i,
      })
    ).toBeInTheDocument()

    expect(screen.getByText(/Regional Posture/i)).toBeInTheDocument()

    expect(screen.getByRole("link", { name: /View PDPA/i })).toHaveAttribute(
      "href",
      "/marketing/legal/pdpa"
    )
  })
})
