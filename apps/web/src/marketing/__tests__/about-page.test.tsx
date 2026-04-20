import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeAll, describe, expect, it } from "vitest"

import AboutPage from "../pages/company/about-page"

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

describe("AboutPage", () => {
  it("renders the company page scaffold", () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>
    )

    expect(
      screen.getByRole("heading", {
        name: /Afenda exists to make business truth harder to lose\./i,
      })
    ).toBeInTheDocument()

    expect(screen.getByText(/Company Position/i)).toBeInTheDocument()

    expect(
      screen.getByRole("link", { name: /Visit Trust Center/i })
    ).toHaveAttribute("href", "/marketing/legal/trust-center")
  })
})
