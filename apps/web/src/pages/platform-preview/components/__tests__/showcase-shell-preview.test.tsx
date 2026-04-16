import type { HTMLAttributes, PropsWithChildren } from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ShowcaseShellPreview } from "../showcase-shell-preview"

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

describe("ShowcaseShellPreview", () => {
  it("renders controller stage copy for controller lens", () => {
    render(
      <ShowcaseShellPreview
        role="controller"
        scenario="payment-release"
        inspectState={{
          mode: "preview",
          theme: "light",
          density: "compact",
          stress: "default",
        }}
      />
    )

    expect(
      screen.getByText("Control posture before approval")
    ).toBeInTheDocument()
    expect(screen.getByText("Evidence focus for approval")).toBeInTheDocument()
  })

  it("renders executive stage copy for executive lens", () => {
    render(
      <ShowcaseShellPreview
        role="executive"
        scenario="month-end-close"
        inspectState={{
          mode: "preview",
          theme: "light",
          density: "compact",
          stress: "default",
        }}
      />
    )

    expect(
      screen.getByText("Roll-up confidence without losing the business truth")
    ).toBeInTheDocument()
    expect(
      screen.getAllByText("Signal focus for command").length
    ).toBeGreaterThan(0)
  })

  it("renders empty-state copy when stress is empty", () => {
    render(
      <ShowcaseShellPreview
        role="operator"
        scenario="payment-release"
        inspectState={{
          mode: "inspect",
          theme: "light",
          density: "compact",
          stress: "empty",
        }}
      />
    )

    expect(
      screen.getByText("Quiet surface, still readable")
    ).toBeInTheDocument()
  })

  it("degrades ingestion signal when stress is degraded", () => {
    render(
      <ShowcaseShellPreview
        role="operator"
        scenario="integration-exception"
        inspectState={{
          mode: "inspect",
          theme: "light",
          density: "compact",
          stress: "degraded",
        }}
      />
    )

    expect(screen.getByText("Degraded")).toBeInTheDocument()
  })

  it("calls onRoleJump when a stage bridge is clicked", () => {
    const onRoleJump = vi.fn()

    render(
      <ShowcaseShellPreview
        role="controller"
        scenario="payment-release"
        inspectState={{
          mode: "preview",
          theme: "light",
          density: "compact",
          stress: "default",
        }}
        onRoleJump={onRoleJump}
      />
    )

    fireEvent.click(
      screen.getByRole("button", {
        name: /see how this release looks to executive/i,
      })
    )

    expect(onRoleJump).toHaveBeenCalled()
  })
})
