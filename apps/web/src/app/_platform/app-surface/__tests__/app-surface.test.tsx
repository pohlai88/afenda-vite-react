import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AppSurface } from "../components/app-surface"
import type { AppSurfaceContract } from "../contract/app-surface-contract"

const contract: AppSurfaceContract = {
  kind: "truth",
  header: {
    kicker: "Truth audit",
    title: "Audit trail",
    description:
      "Every truth record stays attached to the operating change that produced it.",
  },
  metaRow: {
    items: [
      {
        id: "tenant",
        label: "Tenant",
        value: "Acme Operations",
      },
      {
        id: "window",
        label: "Recorded window",
        value: "Truth feed ordered by occurredAt descending",
      },
    ],
  },
  content: {
    sections: [{ id: "audit-feed" }],
  },
  stateSurface: {
    loading: {
      title: "Loading audit trail",
      description: "Please wait while the truth feed is assembled.",
    },
    empty: {
      title: "No truth records yet",
      description: "This tenant has no truth rows yet.",
    },
    failure: {
      title: "Audit unavailable",
      description: "Afenda could not load the truth feed right now.",
    },
    forbidden: {
      title: "Audit unavailable",
      description: "You do not have permission to inspect the truth feed.",
    },
  },
}

describe("AppSurface", () => {
  it("renders the canonical app surface header and meta row", () => {
    render(
      <AppSurface contract={contract}>
        <div>Audit body</div>
      </AppSurface>
    )

    expect(
      screen.getByRole("heading", { name: "Audit trail" })
    ).toBeInTheDocument()
    expect(screen.getByText("Truth surface")).toBeInTheDocument()
    expect(
      screen.getByText(
        "Every truth record stays attached to the operating change that produced it."
      )
    ).toBeInTheDocument()
    expect(screen.getByText("Acme Operations")).toBeInTheDocument()
    expect(screen.getByText("Audit body")).toBeInTheDocument()
  })
})
