import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { initI18n } from "../../../../i18n"
import type { ShellContextBarResolvedModel } from "../../../contract/shell-context-bar-contract"
import { ShellContextBar } from "../shell-context-bar"

const MODEL: ShellContextBarResolvedModel = {
  tabs: [
    {
      id: "overview",
      labelKey: "context_bar.events.tabs.overview",
      label: "Overview",
      kind: "link",
      to: "/app/events",
      commandId: undefined,
      badgeCount: undefined,
      visibility: "always",
      disabled: false,
      isActive: true,
    },
  ],
  actions: [
    {
      id: "refresh",
      labelKey: "context_bar.events.actions.refresh",
      label: "Refresh",
      presentation: "button",
      kind: "command",
      to: undefined,
      commandId: "refresh-events-view",
      visibility: "always",
      disabled: false,
      iconName: undefined,
      group: undefined,
    },
    {
      id: "open-audit",
      labelKey: "context_bar.events.actions.open_audit",
      label: "Open audit",
      presentation: "icon",
      kind: "link",
      to: "/app/audit",
      commandId: undefined,
      iconName: "ShieldIcon",
      visibility: "always",
      disabled: false,
      group: undefined,
    },
  ],
}

const MULTI_TAB_MODEL: ShellContextBarResolvedModel = {
  ...MODEL,
  tabs: [
    MODEL.tabs[0]!,
    {
      id: "audit",
      labelKey: "context_bar.events.tabs.audit",
      label: "Audit",
      kind: "link",
      to: "/app/events/audit",
      commandId: undefined,
      badgeCount: undefined,
      visibility: "always",
      disabled: false,
      isActive: false,
    },
  ],
}

describe("ShellContextBar", () => {
  beforeAll(async () => {
    await initI18n()
  })

  it("renders link tabs and action links", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/app/events",
          element: <ShellContextBar model={MODEL} />,
        },
      ],
      { initialEntries: ["/app/events"] }
    )

    render(<RouterProvider router={router} />)

    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "href",
      "/app/events"
    )
    expect(screen.getByRole("link", { name: "Open audit" })).toHaveAttribute(
      "href",
      "/app/audit"
    )
  })

  it("dispatches command actions via callback", async () => {
    const user = userEvent.setup()
    const onCommandAction = vi.fn()

    const router = createMemoryRouter(
      [
        {
          path: "/app/events",
          element: (
            <ShellContextBar model={MODEL} onCommandAction={onCommandAction} />
          ),
        },
      ],
      { initialEntries: ["/app/events"] }
    )

    render(<RouterProvider router={router} />)
    await user.click(screen.getByRole("button", { name: "Refresh" }))

    expect(onCommandAction).toHaveBeenCalledWith("refresh-events-view")
  })

  it("focus mode sets data-focus-mode and keeps a single tab as inline title", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/app/events",
          element: <ShellContextBar model={MODEL} focusMode />,
        },
      ],
      { initialEntries: ["/app/events"] }
    )

    const { container } = render(<RouterProvider router={router} />)

    expect(container.querySelector('[data-focus-mode="true"]')).toBeTruthy()
    expect(screen.getByText("Overview")).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Sections" })
    ).not.toBeInTheDocument()
  })

  it("focus mode uses a sections menu when multiple tabs exist", async () => {
    const user = userEvent.setup()
    const router = createMemoryRouter(
      [
        {
          path: "/app/events",
          element: <ShellContextBar model={MULTI_TAB_MODEL} focusMode />,
        },
      ],
      { initialEntries: ["/app/events"] }
    )

    render(<RouterProvider router={router} />)

    const sectionsTrigger = screen.getByRole("button", { name: "Sections" })
    await user.click(sectionsTrigger)

    expect(screen.getByRole("menuitem", { name: "Audit" })).toBeInTheDocument()
  })
})
