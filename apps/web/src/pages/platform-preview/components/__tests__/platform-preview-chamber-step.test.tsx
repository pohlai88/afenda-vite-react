import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RouterProvider, createMemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"

import {
  RoutePlatformPreview,
  RoutePlatformPreviewChamber,
  RoutePlatformPreviewThreshold,
} from "../../route-platform-preview"

function createRouter(pathname: string) {
  return createMemoryRouter(
    [
      {
        path: "/platform-preview",
        element: <RoutePlatformPreview />,
        children: [
          { index: true, element: <RoutePlatformPreviewThreshold /> },
          { path: ":chamber", element: <RoutePlatformPreviewChamber /> },
        ],
      },
    ],
    {
      initialEntries: [pathname],
    }
  )
}

describe("PlatformPreviewChamberStep", () => {
  it("renders all four rails and switches controller cases without changing chamber identity", async () => {
    const user = userEvent.setup()
    const router = createRouter("/platform-preview/controller")

    render(<RouterProvider router={router} />)

    const pageRoot = document.getElementById("platform-preview-page")
    expect(pageRoot).toHaveAttribute("data-chamber", "controller")
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(4)

    await user.click(
      screen.getByRole("button", { name: /xbrl tagging exception/i })
    )

    expect(pageRoot).toHaveAttribute("data-case", "xbrl-tagging")
    expect(
      screen.getByText(
        "Tagging is not decoration. When the machine-readable structure drifts, comparability and release defensibility fail together."
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        "Taxonomy validation must pass before release package is marked ready"
      )
    ).toBeInTheDocument()
  })

  it("keeps chamber vocabulary clean and renders no inspector controls", () => {
    const router = createRouter("/platform-preview/cfo")

    render(<RouterProvider router={router} />)

    expect(screen.queryByText(/inspect/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/theme/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/density/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/seat/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/journal/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/session/i)).not.toBeInTheDocument()
    expect(screen.getByText("CFO guards enterprise truth.")).toBeInTheDocument()
  })
})

