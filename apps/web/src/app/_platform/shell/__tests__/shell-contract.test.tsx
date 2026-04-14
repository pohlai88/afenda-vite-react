import { act, render, screen } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { initI18n } from "../../i18n"
import "../types/shell-route-handle"
import { AppThemeProvider } from "../../theme/app-theme-provider"
import { MarketingThemeProvider } from "../../../../pages/provider/marketing-theme-provider"

import MarketingLandingPage from "../../../../pages/components/marketing-landing-page"
import { ShellLeftSidebarLayout } from "../components/shell-left-sidebar-block"

describe("App shell layout contract", () => {
  beforeAll(async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }))
    )
    await initI18n()
  })

  it("renders marketing home without the shell sidebar wrapper", async () => {
    const router = createMemoryRouter(
      [{ path: "/", element: <MarketingLandingPage /> }],
      {
        initialEntries: ["/"],
      }
    )

    const { container } = await act(async () =>
      render(
        <MarketingThemeProvider>
          <RouterProvider router={router} />
        </MarketingThemeProvider>
      )
    )

    expect(container.querySelector('[data-slot="sidebar-wrapper"]')).toBeNull()
  })

  it("renders /app routes inside SidebarProvider chrome", async () => {
    const router = createMemoryRouter(
      [
        {
          path: "/app",
          element: <ShellLeftSidebarLayout />,
          handle: {
            shell: {
              titleKey: "breadcrumb.app",
              breadcrumbs: [
                { id: "app", labelKey: "breadcrumb.app", to: "/app" },
              ],
            },
          },
          children: [
            {
              path: "events",
              element: <div data-testid="shell-outlet-child">ok</div>,
              handle: {
                shell: {
                  titleKey: "breadcrumb.events",
                  breadcrumbs: [
                    { id: "app", labelKey: "breadcrumb.app", to: "/app" },
                    {
                      id: "events",
                      labelKey: "breadcrumb.events",
                      to: "/app/events",
                    },
                  ],
                  contextBar: {
                    tabs: [
                      {
                        id: "overview",
                        labelKey: "context_bar.events.tabs.overview",
                        kind: "link",
                        to: "/app/events",
                      },
                    ],
                    actions: [
                      {
                        id: "refresh",
                        labelKey: "context_bar.events.actions.refresh",
                        presentation: "button",
                        kind: "command",
                        commandId: "refresh-events-view",
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
      ],
      { initialEntries: ["/app/events"] }
    )

    const { container } = await act(async () =>
      render(
        <AppThemeProvider>
          <RouterProvider router={router} />
        </AppThemeProvider>
      )
    )

    expect(
      container.querySelector('[data-slot="sidebar-wrapper"]')
    ).not.toBeNull()
    expect(screen.getByTestId("shell-outlet-child")).toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="shell.context-bar"]')
    ).not.toBeNull()
  })

  it("does not render L2 context bar when route metadata omits contextBar", async () => {
    const router = createMemoryRouter(
      [
        {
          path: "/app",
          element: <ShellLeftSidebarLayout />,
          handle: {
            shell: {
              titleKey: "breadcrumb.app",
              breadcrumbs: [
                { id: "app", labelKey: "breadcrumb.app", to: "/app" },
              ],
            },
          },
          children: [
            {
              path: "audit",
              element: <div data-testid="shell-audit-child">ok</div>,
              handle: {
                shell: {
                  titleKey: "breadcrumb.audit",
                  breadcrumbs: [
                    { id: "app", labelKey: "breadcrumb.app", to: "/app" },
                    {
                      id: "audit",
                      labelKey: "breadcrumb.audit",
                      to: "/app/audit",
                    },
                  ],
                },
              },
            },
          ],
        },
      ],
      { initialEntries: ["/app/audit"] }
    )

    const { container } = await act(async () =>
      render(
        <AppThemeProvider>
          <RouterProvider router={router} />
        </AppThemeProvider>
      )
    )

    expect(screen.getByTestId("shell-audit-child")).toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="shell.context-bar"]')
    ).toBeNull()
  })
})
