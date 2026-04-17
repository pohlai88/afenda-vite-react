import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RouterProvider, createMemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"

import {
  RoutePlatformPreview,
  RoutePlatformPreviewChamber,
  RoutePlatformPreviewFallbackRedirect,
  RoutePlatformPreviewThreshold,
} from "../../route-platform-preview"

function createJourneyRouter(initialEntries: string[]) {
  return createMemoryRouter(
    [
      {
        path: "/platform-preview",
        element: <RoutePlatformPreview />,
        children: [
          { index: true, element: <RoutePlatformPreviewThreshold /> },
          { path: ":chamber", element: <RoutePlatformPreviewChamber /> },
          { path: "*", element: <RoutePlatformPreviewFallbackRedirect /> },
        ],
      },
    ],
    { initialEntries }
  )
}

describe("Platform preview chamber routes", () => {
  it("navigates threshold -> chamber and preserves back continuity", async () => {
    const user = userEvent.setup()
    const router = createJourneyRouter(["/platform-preview"])

    render(<RouterProvider router={router} />)

    await user.click(screen.getAllByRole("link", { name: /enter chamber/i })[1]!)
    expect(router.state.location.pathname).toBe("/platform-preview/controller")
    expect(screen.getByRole("heading", { name: "Controller" })).toBeInTheDocument()
    expect(screen.getByText("Controller guards reporting truth.")).toBeInTheDocument()

    await act(async () => {
      await router.navigate(-1)
    })

    expect(router.state.location.pathname).toBe("/platform-preview")
    expect(
      screen.getByText(
        "Truth does not fail at the boardroom first. It fails when posting, reporting, and governance drift apart."
      )
    ).toBeInTheDocument()
  })

  it("redirects legacy seat slugs to their chamber destinations without rendering legacy vocabulary", () => {
    const router = createJourneyRouter(["/platform-preview/operator"])

    render(<RouterProvider router={router} />)

    expect(router.state.location.pathname).toBe("/platform-preview/accountant")
    expect(screen.getByRole("heading", { name: "Accountant" })).toBeInTheDocument()
    expect(screen.queryByText(/operator/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/seat/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/session/i)).not.toBeInTheDocument()
  })

  it("redirects legacy preview URLs to default chamber without rendering legacy vocabulary", () => {
    const router = createJourneyRouter([
      "/platform-preview/journal/operator/payment-release",
    ])

    render(<RouterProvider router={router} />)

    expect(router.state.location.pathname).toBe("/platform-preview/controller")
    expect(screen.queryByText(/choose your seat/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/journal/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/executive bi/i)).not.toBeInTheDocument()
  })

  it("redirects invalid preview paths to the default controller chamber", () => {
    const router = createJourneyRouter(["/platform-preview/journal"])

    render(<RouterProvider router={router} />)

    expect(router.state.location.pathname).toBe("/platform-preview/controller")
    expect(screen.getByRole("heading", { name: "Controller" })).toBeInTheDocument()
  })
})
