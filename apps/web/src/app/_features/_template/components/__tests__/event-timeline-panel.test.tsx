import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { FeatureTemplateRecord } from "../../types/feature-template"
import { resolveTimelineIconKind } from "../event-timeline-icon"
import { EventTimelinePanel } from "../event-timeline-panel"

function createRecord(
  overrides: Partial<FeatureTemplateRecord> = {}
): FeatureTemplateRecord {
  return {
    id: "REC-001",
    title: "Primary evidence event",
    description: "The canonical event description.",
    status: "attention",
    owner: "Operations Control",
    updatedAt: "2026-04-20T09:30:00.000Z",
    category: "Workflow",
    eventTimeLabel: "09:30 ICT",
    ...overrides,
  }
}

describe("resolveTimelineIconKind", () => {
  it("maps integration categories", () => {
    expect(resolveTimelineIconKind("Integration")).toBe("integration")
    expect(resolveTimelineIconKind("Webhook")).toBe("integration")
  })

  it("maps workflow categories", () => {
    expect(resolveTimelineIconKind("Workflow")).toBe("workflow")
    expect(resolveTimelineIconKind("Policy")).toBe("workflow")
  })

  it("falls back to default for unknown categories", () => {
    expect(resolveTimelineIconKind("Unknown")).toBe("default")
    expect(resolveTimelineIconKind(undefined)).toBe("default")
  })
})

describe("EventTimelinePanel", () => {
  it("renders the empty state", () => {
    render(<EventTimelinePanel records={[]} />)

    expect(
      screen.getByText("No timeline events were found.")
    ).toBeInTheDocument()
  })

  it("renders record content", () => {
    render(<EventTimelinePanel records={[createRecord()]} />)

    expect(screen.getByText("Event Timeline")).toBeInTheDocument()
    expect(screen.getByText("Primary evidence event")).toBeInTheDocument()
    expect(
      screen.getByText("The canonical event description.")
    ).toBeInTheDocument()
    expect(screen.getByText("09:30 ICT")).toBeInTheDocument()
    expect(screen.getByText("Needs attention")).toBeInTheDocument()
    expect(screen.getByText(/REC-001/)).toBeInTheDocument()
    expect(screen.getByText(/Operations Control/)).toBeInTheDocument()
  })

  it("renders unknown time for malformed updatedAt", () => {
    render(
      <EventTimelinePanel
        records={[
          createRecord({
            eventTimeLabel: undefined,
            updatedAt: "bad-date",
          }),
        ]}
      />
    )

    const time = screen.getByText("Unknown time")
    expect(time).toBeInTheDocument()
    expect(time.closest("time")).not.toHaveAttribute("datetime")
  })

  it("does not render an empty description block when description is blank", () => {
    render(
      <EventTimelinePanel
        records={[
          createRecord({
            description: "   ",
          }),
        ]}
      />
    )

    expect(
      screen.queryByText("The canonical event description.")
    ).not.toBeInTheDocument()
  })

  it("does not render owner separator when owner is missing", () => {
    render(
      <EventTimelinePanel
        records={[
          createRecord({
            owner: "   ",
          }),
        ]}
      />
    )

    expect(screen.getByText("REC-001")).toBeInTheDocument()
    expect(screen.queryByText(/Operations Control/)).not.toBeInTheDocument()
  })

  it("renders all timeline items", () => {
    render(
      <EventTimelinePanel
        records={[
          createRecord({ id: "REC-001", title: "First event" }),
          createRecord({ id: "REC-002", title: "Second event" }),
        ]}
      />
    )

    expect(
      screen.getByRole("list", { name: "Event timeline entries" })
    ).toBeInTheDocument()
    expect(screen.getByText("First event")).toBeInTheDocument()
    expect(screen.getByText("Second event")).toBeInTheDocument()
    expect(screen.getAllByRole("listitem")).toHaveLength(2)
  })
})
