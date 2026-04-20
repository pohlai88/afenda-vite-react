import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import {
  AppEmptyState,
  AppErrorState,
  AppFeedbackState,
  AppLoadingState,
} from "../app-feedback-state"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (
      _key: string,
      options?: {
        readonly defaultValue?: string
      }
    ) => options?.defaultValue ?? _key,
  }),
}))

describe("AppFeedbackState", () => {
  it("renders empty fallback copy", () => {
    render(<AppEmptyState />)

    expect(screen.getByText("Nothing here yet")).toBeInTheDocument()
    expect(
      screen.getByText("There is no data to display right now.")
    ).toBeInTheDocument()
  })

  it("renders loading fallback copy", () => {
    render(<AppLoadingState />)

    expect(screen.getByText("Loading")).toBeInTheDocument()
    expect(
      screen.getByText("Please wait while content is being prepared.")
    ).toBeInTheDocument()
  })

  it("renders error fallback copy", () => {
    render(<AppErrorState />)

    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
    expect(
      screen.getByText("We could not load this content right now.")
    ).toBeInTheDocument()
  })

  it("prefers explicit props over translation defaults", () => {
    render(
      <AppEmptyState title="Custom title" description="Custom description" />
    )

    expect(screen.getByText("Custom title")).toBeInTheDocument()
    expect(screen.getByText("Custom description")).toBeInTheDocument()
  })

  it("renders explicit actions slot", () => {
    render(
      <AppEmptyState actions={<button type="button">Create record</button>} />
    )

    expect(
      screen.getByRole("button", { name: "Create record" })
    ).toBeInTheDocument()
  })

  it("sets governed data attributes", () => {
    const { container } = render(<AppFeedbackState variant="error" />)
    const root = container.firstElementChild

    expect(root).toHaveAttribute("data-slot", "app.error-state")
    expect(root).toHaveAttribute("data-variant", "error")
  })

  it("allows slot override when required by the host surface", () => {
    const { container } = render(
      <AppEmptyState data-slot="feature.orders.empty-state" />
    )
    const root = container.firstElementChild

    expect(root).toHaveAttribute("data-slot", "feature.orders.empty-state")
  })
})
