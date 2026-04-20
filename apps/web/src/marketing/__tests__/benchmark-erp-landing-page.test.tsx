import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeAll, describe, expect, it } from "vitest"

import BenchmarkErpLandingPage from "../pages/landing/flagship/afenda-flagship-page"

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

describe("BenchmarkErpLandingPage", () => {
  it("renders the benchmark-aligned ERP landing surface", () => {
    render(
      <MemoryRouter>
        <BenchmarkErpLandingPage />
      </MemoryRouter>
    )

    expect(
      screen.getByRole("heading", {
        name: /NO\s*GUESSWORK/i,
      })
    ).toBeInTheDocument()

    expect(
      screen.getByText(/teams comparing Zoho, QuickBooks, Oracle, and SAP/i)
    ).toBeInTheDocument()
  })
})
