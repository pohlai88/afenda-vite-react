import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeAll, describe, expect, it } from "vitest"

import AfendaFlagshipPage from "../pages/landing/flagship/afenda-flagship-page"

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

    expect(
      screen.getByRole("heading", {
        name: /Proof Every State\.\s*Trust Every Number\./i,
      })
    ).toBeInTheDocument()

    expect(screen.getByText("Operational Proof System")).toBeInTheDocument()

    expect(
      screen.getByRole("heading", {
        name: /Ordinary Systems Fail at the Handoff\./i,
      })
    ).toBeInTheDocument()

    expect(
      screen.getByRole("heading", {
        name: /One Canonical Record\.\s*No Parallel Stories\./i,
      })
    ).toBeInTheDocument()

    expect(
      screen.getAllByText("NexusCanon", { exact: false })[0]
    ).toBeInTheDocument()

    expect(
      screen.getByRole("heading", {
        name: /Built for Finance, Inventory & Operations\./i,
      })
    ).toBeInTheDocument()

    expect(
      screen.getByText(/Run the business on evidence, not reconstruction\./i)
    ).toBeInTheDocument()

    expect(screen.getByText("Final Invitation")).toBeInTheDocument()

    expect(
      screen.getAllByRole("link", { name: /Enter Workspace/i })[0]
    ).toHaveAttribute("href", "/login")

    expect(
      screen.getAllByRole("link", { name: /View Canon/i })[0]
    ).toHaveAttribute("href", "/marketing/polaris")
  })
})
