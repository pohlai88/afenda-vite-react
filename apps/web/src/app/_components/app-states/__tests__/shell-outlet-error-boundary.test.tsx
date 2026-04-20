import { Component } from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"

import { APP_SHELL_DEFAULT_HOME_HREF } from "../app-route-error-fallback"
import {
  ShellOutletErrorBoundary,
  ShellOutletErrorFallback,
} from "../shell-outlet-error-boundary"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue ?? _key,
  }),
}))

class ExplodingComponent extends Component<{ readonly shouldThrow: boolean }> {
  override render() {
    if (this.props.shouldThrow) {
      throw new Error("Boom")
    }

    return <div>Healthy shell outlet</div>
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe("ShellOutletErrorBoundary", () => {
  it("renders children when no error is thrown", () => {
    render(
      <MemoryRouter>
        <ShellOutletErrorBoundary>
          <ExplodingComponent shouldThrow={false} />
        </ShellOutletErrorBoundary>
      </MemoryRouter>
    )

    expect(screen.getByText("Healthy shell outlet")).toBeInTheDocument()
  })

  it("renders fallback content when the outlet crashes", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})

    render(
      <MemoryRouter>
        <ShellOutletErrorBoundary>
          <ExplodingComponent shouldThrow />
        </ShellOutletErrorBoundary>
      </MemoryRouter>
    )

    expect(screen.getByRole("alert")).toBeInTheDocument()
    expect(
      screen.getByText("This section failed to render")
    ).toBeInTheDocument()
    expect(screen.getByTestId("shell-outlet-error-detail")).toHaveTextContent(
      "Boom"
    )
    expect(
      screen.getByRole("link", { name: "Back to workspace" })
    ).toHaveAttribute("href", APP_SHELL_DEFAULT_HOME_HREF)
  })

  it("resets when retry is clicked", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})

    function Harness({ shouldThrow }: { readonly shouldThrow: boolean }) {
      return (
        <MemoryRouter>
          <ShellOutletErrorBoundary>
            <ExplodingComponent shouldThrow={shouldThrow} />
          </ShellOutletErrorBoundary>
        </MemoryRouter>
      )
    }

    const { rerender } = render(<Harness shouldThrow />)
    expect(
      screen.getByText("This section failed to render")
    ).toBeInTheDocument()

    rerender(<Harness shouldThrow={false} />)
    fireEvent.click(screen.getByRole("button", { name: "Try again" }))

    expect(screen.getByText("Healthy shell outlet")).toBeInTheDocument()
  })

  it("logs in componentDidCatch during development", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {})

    render(
      <MemoryRouter>
        <ShellOutletErrorBoundary>
          <ExplodingComponent shouldThrow />
        </ShellOutletErrorBoundary>
      </MemoryRouter>
    )

    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})

describe("ShellOutletErrorFallback", () => {
  it("omits the dev detail block for blank-looking errors", () => {
    render(
      <MemoryRouter>
        <ShellOutletErrorFallback error={new Error("   ")} onRetry={vi.fn()} />
      </MemoryRouter>
    )

    expect(
      screen.getByRole("alert", { name: /this section failed to render/i })
    ).toHaveAttribute("data-slot", "app.shell-outlet-error-fallback")
    expect(
      screen.queryByTestId("shell-outlet-error-detail")
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Back to workspace" })
    ).toHaveAttribute("href", APP_SHELL_DEFAULT_HOME_HREF)
  })
})
