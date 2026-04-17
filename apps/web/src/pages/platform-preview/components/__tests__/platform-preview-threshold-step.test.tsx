import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"

import { PlatformPreviewThresholdStep } from "../platform-preview-threshold-step"

describe("PlatformPreviewThresholdStep", () => {
  it("renders exactly three chamber doors and no old preview language", () => {
    render(
      <MemoryRouter>
        <PlatformPreviewThresholdStep />
      </MemoryRouter>
    )

    expect(screen.getAllByRole("link", { name: /enter chamber/i })).toHaveLength(3)
    expect(screen.getByRole("heading", { name: "Accountant" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Controller" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "CFO" })).toBeInTheDocument()
    expect(screen.queryByText(/choose your seat/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/role showcase/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/open cfo bi/i)).not.toBeInTheDocument()
  })
})

