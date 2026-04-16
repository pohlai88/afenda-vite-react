import type { HTMLAttributes, PropsWithChildren } from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { PlatformPreviewPage } from "../platform-preview-page"

vi.mock("framer-motion", async () => {
  const React = await import("react")

  type PassthroughProps = PropsWithChildren<Record<string, unknown>>

  const passthrough =
    (tag: string) =>
    ({ children, ...props }: PassthroughProps) =>
      React.createElement(tag, props as HTMLAttributes<HTMLElement>, children)

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    motion: {
      div: passthrough("div"),
      article: passthrough("article"),
      button: passthrough("button"),
      section: passthrough("section"),
      main: passthrough("main"),
    },
  }
})

describe("PlatformPreviewPage", () => {
  it("renders the controller intro by default", () => {
    render(<PlatformPreviewPage />)

    expect(
      screen.getByText(
        "See whether this process deserves approval before it moves."
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText(/controller \/ finance manager lens/i)
    ).toBeInTheDocument()
  })

  it("switches role when clicking a role card", () => {
    render(<PlatformPreviewPage />)

    fireEvent.click(
      screen.getByRole("button", { name: /switch to cfo \/ cto view/i })
    )

    expect(
      screen.getByText(
        "See whether this business movement rolls up into real command."
      )
    ).toBeInTheDocument()
  })

  it("switches scenario when clicking a scenario card", () => {
    render(<PlatformPreviewPage />)

    fireEvent.click(
      screen.getByRole("button", {
        name: /switch scenario to integration exception/i,
      })
    )

    expect(
      screen.getByTestId("preview-scenario-card-integration-exception")
    ).toHaveTextContent(/degraded signals/i)
  })

  it("peek-next can jump role and scenario together", () => {
    render(<PlatformPreviewPage />)

    fireEvent.click(
      screen.getByTestId("preview-role-peek-controller-executive")
    )

    const pageRoot = document.getElementById("platform-preview-page")
    expect(pageRoot).not.toBeNull()
    expect(pageRoot).toHaveAttribute("data-role", "executive")
    expect(pageRoot).toHaveAttribute("data-scenario", "month-end-close")
  })

  it("can open inspect controls", () => {
    render(<PlatformPreviewPage />)

    fireEvent.click(screen.getByTestId("preview-inspect-toggle"))

    expect(screen.getByText("Stress state")).toBeInTheDocument()
    expect(screen.getByText("Density")).toBeInTheDocument()
    expect(screen.getByText("Theme")).toBeInTheDocument()
  })

  it("announces the current role and scenario in the live region", () => {
    render(<PlatformPreviewPage />)

    expect(
      screen.getByText(
        /viewing controller \/ finance manager in payment release/i
      )
    ).toBeInTheDocument()
  })
})
