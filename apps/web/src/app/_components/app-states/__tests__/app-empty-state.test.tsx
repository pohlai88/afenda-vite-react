import { act, render, screen } from "@testing-library/react"
import { Inbox } from "lucide-react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { initI18n } from "../../../_platform/i18n"

import { AppEmptyState } from "../app-empty-state"

describe("AppEmptyState", () => {
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

  it("renders default shell copy when title and description are omitted", async () => {
    await act(async () => {
      render(<AppEmptyState />)
    })

    expect(screen.getByText("Nothing here yet")).toBeInTheDocument()
    expect(
      screen.getByText(
        "There are no items to show. Adjust filters or check back later."
      )
    ).toBeInTheDocument()
  })

  it("renders overrides and optional icon", async () => {
    await act(async () => {
      render(
        <AppEmptyState
          title="Custom title"
          description="Custom body"
          icon={<Inbox aria-label="inbox" />}
        />
      )
    })

    expect(screen.getByText("Custom title")).toBeInTheDocument()
    expect(screen.getByText("Custom body")).toBeInTheDocument()
    expect(screen.getByLabelText("inbox")).toBeInTheDocument()
  })
})
