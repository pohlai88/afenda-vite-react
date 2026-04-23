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
      screen.getByText(
        /Afenda binds document, entity, event, and transition/i,
        {
          selector: "p",
        }
      )
    ).toBeInTheDocument()
    expect(
      screen.getAllByText(/Truth is engineered\./i).length
    ).toBeGreaterThan(0)
    for (const brandName of screen.getAllByText("Afenda", {
      selector: "span",
    })) {
      expect(brandName).toHaveAttribute("translate", "no")
    }
    expect(
      screen.getByText(/Accountable business truth under pressure\./i)
    ).toBeInTheDocument()
    expect(screen.getAllByText("CHECK_001")).not.toHaveLength(0)
    expect(screen.getAllByText("CHECK_003")).not.toHaveLength(0)
    expect(
      within(heroRegion).queryByText("Assume Nothing")
    ).not.toBeInTheDocument()
    expect(
      within(operatingLawsRegion).getByText("No record without origin")
    ).toBeInTheDocument()
    expect(
      within(operatingLawsRegion).getByText("No truth without continuity")
    ).toBeInTheDocument()

    expect(
      screen.getByRole("heading", {
        name: /Where enterprise records fail first\./i,
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
        /Put accountable truth between every event and every decision it drives\./i
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
      screen.getByRole("link", { name: /Explore NexusCanon/i })
    ).toHaveAttribute("href", "/marketing/polaris")

    expect(
      screen.getByRole("link", { name: /See the proof model/i })
    ).toHaveAttribute("href", "/marketing/polaris#proof")
  })
})
