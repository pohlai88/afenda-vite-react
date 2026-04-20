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
        name: /NO\s*GUESSWORK/i,
      })
    ).toBeInTheDocument()

    expect(
      screen.getByText(/Most systems record outcomes\./i, { selector: "p" })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Afenda records causality\./i, { selector: "p" })
    ).toBeInTheDocument()
    expect(screen.getByText("System State")).toBeInTheDocument()
    expect(screen.getByText("Operational")).toBeInTheDocument()
    expect(screen.getByText("Bound")).toBeInTheDocument()
    expect(screen.getByText("Verified")).toBeInTheDocument()
    expect(screen.getByText("No reconstruction")).toBeInTheDocument()

    expect(
      screen.getByRole("heading", {
        name: /You do not need more tools\.\s*You need one system that holds\./i,
      })
    ).toBeInTheDocument()

    expect(
      screen.getByRole("heading", {
        name: /One system for the workflows that carry real consequence\./i,
      })
    ).toBeInTheDocument()

    expect(screen.getByText(/In practice/i)).toBeInTheDocument()

    expect(
      screen.getByRole("heading", {
        name: /Every state change arrives with its own explanation\./i,
      })
    ).toBeInTheDocument()

    expect(screen.getAllByText(/NexusCanon/i).length).toBeGreaterThan(0)

    expect(
      screen.getByRole("heading", {
        name: /This is where the record stops fragmenting\./i,
      })
    ).toBeInTheDocument()

    expect(
      screen.getByText(/Stop explaining the system\./i)
    ).toBeInTheDocument()

    expect(
      screen.getByText(/Use one that explains itself\./i)
    ).toBeInTheDocument()

    expect(screen.getByText("Final State")).toBeInTheDocument()

    expect(
      screen.getAllByRole("link", { name: /Enter System/i })[0]
    ).toHaveAttribute("href", "/login")

    expect(
      screen.getAllByRole("link", { name: /See How Afenda Works/i })[0]
    ).toHaveAttribute("href", "/marketing/polaris")

    expect(
      screen.getByRole("link", { name: /Explore ERP Benchmarks/i })
    ).toHaveAttribute("href", "/marketing/benchmark-erp")

    expect(
      screen.getAllByRole("link", { name: /Trust Center/i })[0]
    ).toHaveAttribute("href", "/marketing/legal/trust-center")

    expect(
      screen.getByRole("link", { name: /View Campaign/i })
    ).toHaveAttribute("href", "/marketing/campaigns/erp-benchmark")
  })
})
