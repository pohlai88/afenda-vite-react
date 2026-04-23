import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeAll, describe, expect, it } from "vitest"

import TrustCenterPage from "../pages/legal/trust-center/trust-center-page"

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

describe("TrustCenterPage", () => {
  it("renders the reusable legal shell", () => {
    render(
      <MemoryRouter>
        <TrustCenterPage />
      </MemoryRouter>
    )

    expect(
      screen.getByRole("heading", {
        name: /Operational trust starts before audit and survives after it\./i,
      })
    ).toBeInTheDocument()

    expect(
      screen.getByText(/Trust is presented as a system/i)
    ).toBeInTheDocument()

    expect(
      screen.getByRole("link", { name: /Open Data Governance/i })
    ).toHaveAttribute("href", "/marketing/legal/data-governance")
  })
})
