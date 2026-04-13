import { render, screen } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { initI18n } from "@/app/_platform/i18n"
import "@/app/_platform/shell/types/shell-route-handle"

import { AppShellLayout } from "../components/app-shell-layout"
import Home from "@/pages/Home"

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
      }))
    )
    await initI18n()
  })

  it("renders marketing home without the shell sidebar wrapper", () => {
    const router = createMemoryRouter([{ path: "/", element: <Home /> }], {
      initialEntries: ["/"],
    })

    const { container } = render(<RouterProvider router={router} />)

    expect(container.querySelector('[data-slot="sidebar-wrapper"]')).toBeNull()
  })

  it("renders /app routes inside SidebarProvider chrome", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/app",
          element: <AppShellLayout />,
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
                },
              },
            },
          ],
        },
      ],
      { initialEntries: ["/app/events"] }
    )

    const { container } = render(<RouterProvider router={router} />)

    expect(
      container.querySelector('[data-slot="sidebar-wrapper"]')
    ).not.toBeNull()
    expect(screen.getByTestId("shell-outlet-child")).toBeInTheDocument()
  })
})
