import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeAll, describe, expect, it } from "vitest"

import BeastmodeLandingPage from "../pages/landing/11.Beastmode"

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
  it("reuses the refined flagship surface", () => {
    render(
      <MemoryRouter>
        <BeastmodeLandingPage />
      </MemoryRouter>
    )

    expect(
      screen.getByRole("heading", {
        name: /Proof Every State\.\s*Trust Every Number\./i,
      })
    ).toBeInTheDocument()

    expect(
      screen.getAllByRole("link", { name: /Enter Workspace/i })[0]
    ).toHaveAttribute("href", "/login")

    expect(
      screen.getAllByRole("link", { name: /View Canon/i })[0]
    ).toHaveAttribute("href", "/marketing/polaris")
  })
})
