import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeAll, describe, expect, it } from "vitest"

import AboutPage from "../pages/company/about/about-page"

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
  it("renders the company editorial page and expected navigation", () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>
    )

    expect(
      screen.getByRole("heading", {
        name: /A company built around business truth\./i,
      })
    ).toBeInTheDocument()

    expect(
      screen.getByRole("heading", { name: /Most systems explain too late\./i })
    ).toBeInTheDocument()

    expect(screen.getByRole("link", { name: /View product/i })).toHaveAttribute(
      "href",
      "/marketing/product/truth-engine"
    )
  })
})
