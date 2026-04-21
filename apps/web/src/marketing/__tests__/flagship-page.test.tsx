import { render, screen, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeAll, describe, expect, it } from "vitest"

import AfendaFlagshipPage from "../pages/landing/flagship/flagship-page"

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

describe("AfendaFlagshipPage", () => {
  it("renders the canonical flagship sections and entry actions", () => {
    render(
      <MemoryRouter>
        <AfendaFlagshipPage />
      </MemoryRouter>
    )

    const heroRegion = screen.getByRole("region", {
      name: /Chaos is common\.\s*Truth is engineered\./i,
    })
    const operatingLawsRegion = screen.getByRole("region", {
      name: /Immutable Laws/i,
    })

    expect(
      screen.getByRole("heading", {
        name: /Chaos is common\.\s*Truth is engineered\./i,
      })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("heading", {
        name: /Afenda\s*ERP\s*Proof-Led Operations\./i,
      })
    ).not.toBeInTheDocument()

    expect(
      screen.getByText(/enforces the immutable laws/i, {
        selector: "p",
      })
    ).toBeInTheDocument()
    expect(screen.getByText(/Truth is engineered\./i)).toBeInTheDocument()
    for (const brandName of screen.getAllByText("Afenda", {
      selector: "span",
    })) {
      expect(brandName).toHaveAttribute("translate", "no")
    }
    expect(
      screen.getByText(/Chaos Interrogated • Truth Preserved/i)
    ).toBeInTheDocument()
    expect(screen.getAllByText("CHECK_001")).not.toHaveLength(0)
    expect(screen.getAllByText("CHECK_003")).not.toHaveLength(0)
    expect(
      within(heroRegion).queryByText("Assume Nothing")
    ).not.toBeInTheDocument()
    expect(
      within(operatingLawsRegion).getByText("Assume Nothing")
    ).toBeInTheDocument()
    expect(
      within(operatingLawsRegion).getByText("Reject Reconstruction")
    ).toBeInTheDocument()

    expect(
      screen.getByRole("heading", {
        name: /Where business truth breaks first\./i,
      })
    ).toBeInTheDocument()

    expect(
      screen.getByRole("heading", {
        name: /Enforce truth where activity becomes consequence\./i,
      })
    ).toBeInTheDocument()

    expect(screen.getByText(/In practice/i)).toBeInTheDocument()

    expect(
      screen.getByRole("heading", {
        name: /False state cannot survive forward motion\./i,
      })
    ).toBeInTheDocument()

    expect(screen.getAllByText(/NexusCanon/i).length).toBeGreaterThan(0)

    expect(
      screen.getByRole("heading", {
        name: /This is where the record stops fragmenting\./i,
      })
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        /Put immutable truth between activity and every record you trust\./i
      )
    ).toBeInTheDocument()

    expect(screen.getByText("Final State")).toBeInTheDocument()
    expect(screen.queryByText(/Enter System/i)).not.toBeInTheDocument()

    expect(
      screen.getAllByRole("link", { name: /Enter Workspace/i }).length
    ).toBeGreaterThanOrEqual(3)

    expect(
      screen.getAllByRole("link", { name: /Enter Workspace/i })[0]
    ).toHaveAttribute("href", "/login")

    expect(
      screen.getByRole("link", { name: /See the truth engine/i })
    ).toHaveAttribute("href", "/marketing/product/truth-engine")

    expect(
      screen.getAllByRole("link", { name: /See how Afenda works/i })[0]
    ).toHaveAttribute("href", "/marketing/polaris")

    expect(
      screen.getByRole("link", { name: /Explore ERP Benchmarks/i })
    ).toHaveAttribute("href", "/marketing/benchmark-erp")

    expect(
      screen.getAllByRole("link", { name: /Truth Engine/i })[0]
    ).toHaveAttribute("href", "/marketing/product/truth-engine")

    expect(
      screen.getAllByRole("link", { name: /Trust Center/i })[0]
    ).toHaveAttribute("href", "/marketing/legal/trust-center")
  })
})
