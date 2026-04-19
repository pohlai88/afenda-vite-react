import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeAll, describe, expect, it } from "vitest"

import MonumentLandingPage from "../pages/landing/10.Monument"

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

describe("MonumentLandingPage", () => {
  it("renders the promoted monument variant", async () => {
    render(
      <MemoryRouter>
        <MonumentLandingPage />
      </MemoryRouter>
    )

    expect(
      await screen.findByRole(
        "heading",
        {
          name: /UNVERIFIED\s*INPUT/i,
        },
        {
          timeout: 5000,
        }
      )
    ).toBeInTheDocument()

    expect(
      await screen.findByRole("heading", {
        name: /DOCTRINE\s+IS/i,
      })
    ).toBeInTheDocument()

    expect(
      screen.getByRole("link", { name: /INITIALIZE PROTOCOL/i })
    ).toHaveAttribute("href", "/marketing/flagship")
  })
})
