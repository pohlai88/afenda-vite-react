import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"

import type { FeatureTemplateSlug } from "../../types/feature-template"
import { FeatureTemplateView } from "../FeatureTemplateView"

function renderFeatureTemplate(slug: FeatureTemplateSlug = "events") {
  return render(
    <MemoryRouter>
      <FeatureTemplateView slug={slug} />
    </MemoryRouter>
  )
}

describe("FeatureTemplateView", () => {
  it("renders the command-center workbench for event operations", async () => {
    renderFeatureTemplate()

    expect(
      await screen.findByRole("heading", { name: "Event log" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("region", { name: "Operational intelligence" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "Priority Queue" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "Event Timeline" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "Evidence & Actions" })
    ).toBeInTheDocument()
    expect(screen.getByText("Evidence ready")).toBeInTheDocument()
  })

  it("announces command feedback from the evidence action panel", async () => {
    const user = userEvent.setup()
    renderFeatureTemplate()

    const exportButtons = await screen.findAllByRole("button", {
      name: /export evidence/i,
    })

    await user.click(exportButtons[0])

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Prepared 3 records from Event log for export."
      )
    })
  })
})
