import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { featureTemplateCommands } from "../../actions/feature-template-actions"
import type { FeatureTemplateDefinition } from "../../types/feature-template"
import { FeatureCommandHeader } from "../feature-command-header"

function createFeature(
  overrides: Partial<FeatureTemplateDefinition> = {}
): FeatureTemplateDefinition {
  return {
    slug: "events",
    title: "Event log",
    description: "Operational stream for ERP events.",
    workspaceLabel: "Acme Treasury Ltd",
    scopeLabel: "Finance / Accounts payable",
    status: "healthy",
    routePath: "/app/events",
    metrics: [],
    records: [
      {
        id: "evt-1028",
        title: "Invoice approval workflow advanced",
        description: "Finance moved INV-1042 from review to posting.",
        status: "healthy",
        owner: "Finance operations",
        updatedAt: "2026-04-13T08:20:00.000Z",
      },
    ],
    ...overrides,
  }
}

describe("FeatureCommandHeader", () => {
  it("renders workspace and scope labels from the feature contract", () => {
    render(
      <FeatureCommandHeader
        feature={createFeature()}
        commands={featureTemplateCommands}
        onRunCommand={vi.fn()}
      />
    )

    expect(screen.getByText("Acme Treasury Ltd")).toBeInTheDocument()
    expect(screen.getByText("Finance / Accounts payable")).toBeInTheDocument()
    expect(screen.getByText(/Last sync/)).toBeInTheDocument()
  })

  it("falls back cleanly when no records are available", () => {
    render(
      <FeatureCommandHeader
        feature={createFeature({ records: [] })}
        commands={featureTemplateCommands}
        onRunCommand={vi.fn()}
      />
    )

    expect(screen.getByText("No records observed")).toBeInTheDocument()
  })

  it("runs the curated command actions", async () => {
    const user = userEvent.setup()
    const onRunCommand = vi.fn()

    render(
      <FeatureCommandHeader
        feature={createFeature()}
        commands={featureTemplateCommands}
        onRunCommand={onRunCommand}
      />
    )

    await user.click(screen.getByRole("button", { name: "Refresh" }))
    await user.click(screen.getByRole("button", { name: "Export evidence" }))
    await user.click(screen.getByRole("button", { name: "More" }))

    expect(onRunCommand).toHaveBeenNthCalledWith(1, "refresh-view")
    expect(onRunCommand).toHaveBeenNthCalledWith(2, "export-audit-pack")
    expect(onRunCommand).toHaveBeenNthCalledWith(3, "review-queue")
  })
})
