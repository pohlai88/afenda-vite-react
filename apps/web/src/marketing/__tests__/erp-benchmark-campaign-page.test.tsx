import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeAll, describe, expect, it } from "vitest"

import ErpBenchmarkCampaignPage from "../pages/campaigns/erp-benchmark/erp-benchmark-page"

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

describe("ErpBenchmarkCampaignPage", () => {
  it("renders the reusable campaign shell", () => {
    render(
      <MemoryRouter>
        <ErpBenchmarkCampaignPage />
      </MemoryRouter>
    )

    expect(
      screen.getByRole("heading", {
        name: /Use the benchmark names\. Refuse their blind spots\./i,
      })
    ).toBeInTheDocument()

    expect(
      screen.getByText(/SAP, Oracle, Zoho, and QuickBooks/i)
    ).toBeInTheDocument()

    expect(
      screen.getByRole("link", { name: /Open Trust Center/i })
    ).toHaveAttribute("href", "/marketing/legal/trust-center")
  })
})
