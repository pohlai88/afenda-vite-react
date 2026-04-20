import { Component } from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { RootErrorBoundary } from "../root-error-boundary"

vi.mock("../root-error-fallback", () => ({
  RootErrorFallback: ({
    error,
    onRetry,
  }: {
    readonly error: Error | null
    readonly onRetry: () => void
  }) => (
    <div data-testid="root-error-fallback">
      <div data-testid="fallback-message">
        {error?.message ?? "Unknown error"}
      </div>
      <button type="button" onClick={onRetry}>
        Retry
      </button>
    </div>
  ),
}))

class ExplodingComponent extends Component<{ readonly shouldThrow: boolean }> {
  override render() {
    if (this.props.shouldThrow) {
      throw new Error("Boom")
    }

    return <div>Healthy subtree</div>
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe("RootErrorBoundary", () => {
  it("renders children when no error is thrown", () => {
    render(
      <RootErrorBoundary>
        <ExplodingComponent shouldThrow={false} />
      </RootErrorBoundary>
    )

    expect(screen.getByText("Healthy subtree")).toBeInTheDocument()
  })

  it("renders fallback when a child throws", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})

    render(
      <RootErrorBoundary>
        <ExplodingComponent shouldThrow />
      </RootErrorBoundary>
    )

    expect(screen.getByTestId("root-error-fallback")).toBeInTheDocument()
    expect(screen.getByTestId("fallback-message")).toHaveTextContent("Boom")
  })

  it("resets when retry is clicked", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})

    function Harness({ shouldThrow }: { readonly shouldThrow: boolean }) {
      return (
        <RootErrorBoundary>
          <ExplodingComponent shouldThrow={shouldThrow} />
        </RootErrorBoundary>
      )
    }

    const { rerender } = render(<Harness shouldThrow />)
    expect(screen.getByTestId("fallback-message")).toHaveTextContent("Boom")

    rerender(<Harness shouldThrow={false} />)
    fireEvent.click(screen.getByRole("button", { name: "Retry" }))

    expect(screen.getByText("Healthy subtree")).toBeInTheDocument()
  })

  it("logs in componentDidCatch during development", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {})

    render(
      <RootErrorBoundary>
        <ExplodingComponent shouldThrow />
      </RootErrorBoundary>
    )

    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})
