import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeAll, describe, expect, it } from "vitest"

import PdpaPage from "../pages/legal/pdpa/pdpa-page"

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

describe("PdpaPage", () => {
  it("renders the PDPA scaffold", () => {
    render(
      <MemoryRouter>
        <PdpaPage />
      </MemoryRouter>
    )

    expect(
      screen.getByRole("heading", {
        name: /PDPA belongs inside the same trust system, not outside the product story\./i,
      })
    ).toBeInTheDocument()

    expect(
      screen.getByRole("heading", {
        name: /Regional policy pages should be specific, navigable, and operationally connected\./i,
      })
    ).toBeInTheDocument()

    expect(
      screen.getByRole("link", { name: /View Asia Pacific/i })
    ).toHaveAttribute("href", "/marketing/regional/asia-pacific")
  })
})
