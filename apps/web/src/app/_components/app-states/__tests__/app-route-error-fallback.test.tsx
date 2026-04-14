import { act, render, screen } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { initI18n } from "../../../_platform/i18n"

import { AppRouteErrorFallback } from "../app-route-error-fallback"

function ThrowingRoute(): never {
  throw new Error("route boom")
}

describe("AppRouteErrorFallback", () => {
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

  it("renders shell messaging and route error detail in dev", async () => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: <ThrowingRoute />,
          errorElement: <AppRouteErrorFallback />,
        },
      ],
      { initialEntries: ["/"] }
    )

    await act(async () => {
      render(<RouterProvider router={router} />)
    })

    expect(screen.getByRole("alert")).toBeInTheDocument()
    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
    expect(screen.getByTestId("app-route-error-detail")).toHaveTextContent(
      "route boom"
    )
  })
})
