import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { MarketingLoadingFallback } from "../marketing-loading-fallback"

describe("MarketingLoadingFallback", () => {
  it("renders an accessible busy state for lazy marketing chunks", () => {
    render(<MarketingLoadingFallback />)

    const region = screen.getByLabelText("Loading marketing experience")
    expect(region).toHaveAttribute("aria-busy", "true")
    expect(region).toHaveTextContent("Loading")
  })
})
