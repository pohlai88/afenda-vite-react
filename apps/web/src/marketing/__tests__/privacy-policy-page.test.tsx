import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeAll, describe, expect, it } from "vitest"

import PrivacyPolicyPage from "../pages/legal/privacy-policy/privacy-policy-page"

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

describe("PrivacyPolicyPage", () => {
  it("renders the privacy policy scaffold", () => {
    render(
      <MemoryRouter>
        <PrivacyPolicyPage />
      </MemoryRouter>
    )

    expect(
      screen.getByRole("heading", {
        name: /Privacy should read as a control model, not a wall of disclaimers\./i,
      })
    ).toBeInTheDocument()

    expect(
      screen.getByRole("heading", {
        name: /The public privacy page should expose how data responsibility is framed\./i,
      })
    ).toBeInTheDocument()

    expect(screen.getByRole("link", { name: /Open PDPA/i })).toHaveAttribute(
      "href",
      "/marketing/legal/pdpa"
    )
  })
})
