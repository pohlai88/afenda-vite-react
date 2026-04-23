import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeAll, describe, expect, it } from "vitest"

import TruthEnginePage from "../pages/product/truth-engine/truth-engine-page"

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

describe("TruthEnginePage", () => {
  it("renders the product page scaffold", () => {
    render(
      <MemoryRouter>
        <TruthEnginePage />
      </MemoryRouter>
    )

    expect(
      screen.getByRole("heading", {
        name: /The truth engine is the operating logic behind Afenda\./i,
      })
    ).toBeInTheDocument()

    expect(screen.getByText(/Operating Law/i)).toBeInTheDocument()

    expect(
      screen.getByRole("link", { name: /View Benchmark ERP/i })
    ).toHaveAttribute("href", "/marketing/campaigns/erp-benchmark")
  })
})
