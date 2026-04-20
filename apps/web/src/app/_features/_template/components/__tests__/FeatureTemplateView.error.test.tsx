import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

import { featureTemplateCommands } from "../../actions/feature-template-actions"
import { useFeatureTemplate } from "../../hooks/use-feature-template"
import { FeatureTemplateView } from "../FeatureTemplateView"

vi.mock("../../hooks/use-feature-template", () => ({
  useFeatureTemplate: vi.fn(),
}))

const mockedUseFeatureTemplate = vi.mocked(useFeatureTemplate)

describe("FeatureTemplateView error state", () => {
  it("renders a retryable error surface when the feature fails to load", async () => {
    const reload = vi.fn()
    const user = userEvent.setup()

    mockedUseFeatureTemplate.mockReturnValue({
      feature: null,
      isLoading: false,
      errorMessage: "Feature fetch failed",
      actionResult: null,
      commands: featureTemplateCommands,
      runCommand: vi.fn(),
      reload,
    })

    render(
      <MemoryRouter>
        <FeatureTemplateView slug="events" />
      </MemoryRouter>
    )

    expect(screen.getByText("Feature unavailable")).toBeInTheDocument()
    expect(screen.getByText("Feature fetch failed")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Try again" }))

    expect(reload).toHaveBeenCalledTimes(1)
  })
})
