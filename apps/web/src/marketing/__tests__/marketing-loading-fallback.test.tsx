import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { MarketingLoadingFallback } from "../marketing-loading-fallback"

describe("MarketingLoadingFallback", () => {
  it("renders an accessible busy state for lazy marketing chunks", () => {
    render(<MarketingLoadingFallback />)

    const region = screen.getByRole("status", {
      name: "Loading marketing experience",
    })

    expect(region).toHaveAttribute("aria-busy", "true")
    expect(region).toHaveAttribute("aria-live", "polite")
    expect(region).toHaveAttribute("aria-atomic", "true")
    expect(region).toHaveTextContent("Loading…")
  })
})
