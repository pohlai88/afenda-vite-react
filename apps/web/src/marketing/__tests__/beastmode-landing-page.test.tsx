import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeAll, describe, expect, it } from "vitest"

import BeastmodeLandingPage from "../pages/landing/beastmode-landing-page"

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

describe("BeastmodeLandingPage", () => {
  it("renders the beastmode experimental surface", () => {
    render(
      <MemoryRouter>
        <BeastmodeLandingPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/SCANNING FRAGMENTS/i)).toBeInTheDocument()

    expect(
      screen.getByRole("button", { name: /INITIALIZE PROTOCOL/i })
    ).toBeInTheDocument()
  })
})
