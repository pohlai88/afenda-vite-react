import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import type { FeatureTemplateRecord } from "../../types/feature-template"
import { PriorityQueuePanel } from "../priority-queue-panel"

function createRecord(
  overrides: Partial<FeatureTemplateRecord> = {}
): FeatureTemplateRecord {
  return {
    id: "REC-001",
    title: "Investigate unmatched settlement",
    description: "Review the queued reconciliation exception.",
    status: "attention",
    owner: "Finance operations",
    updatedAt: "2026-04-20T10:30:00.000Z",
    severity: "high",
    category: "Reconciliation",
    slaLabel: "Due today",
    eventTimeLabel: "10:30 ICT",
    ...overrides,
  }
}

describe("PriorityQueuePanel", () => {
  it("renders the empty state", () => {
    render(<PriorityQueuePanel records={[]} onOpenRecord={vi.fn()} />)

    expect(
      screen.getByText("No records require operator attention in this scope.")
    ).toBeInTheDocument()
  })

  it("renders record content and safe metadata", () => {
    render(
      <PriorityQueuePanel records={[createRecord()]} onOpenRecord={vi.fn()} />
    )

    expect(screen.getByText("Priority Queue")).toBeInTheDocument()
    expect(
      screen.getByText("Investigate unmatched settlement")
    ).toBeInTheDocument()
    expect(
      screen.getByText("Review the queued reconciliation exception.")
    ).toBeInTheDocument()
    expect(screen.getByText("Reconciliation")).toBeInTheDocument()
    expect(screen.getByText("High")).toBeInTheDocument()
    expect(screen.getByText("Needs attention")).toBeInTheDocument()
    expect(screen.getByText("10:30 ICT")).toBeInTheDocument()
    expect(screen.getByText("Finance operations")).toBeInTheDocument()
  })

  it("omits blank optional values and falls back for malformed dates", () => {
    render(
      <PriorityQueuePanel
        records={[
          createRecord({
            description: "   ",
            owner: "   ",
            category: "   ",
            slaLabel: "   ",
            eventTimeLabel: undefined,
            updatedAt: "bad-date",
          }),
        ]}
        onOpenRecord={vi.fn()}
      />
    )

    expect(
      screen.queryByText("Review the queued reconciliation exception.")
    ).not.toBeInTheDocument()
    expect(screen.queryByText("Finance operations")).not.toBeInTheDocument()
    expect(screen.queryByText("Reconciliation")).not.toBeInTheDocument()
    expect(screen.queryByText("SLA: Due today")).not.toBeInTheDocument()

    const time = screen.getByText("Unknown time")
    expect(time.closest("time")).not.toHaveAttribute("datetime")
  })

  it("opens the selected record", async () => {
    const user = userEvent.setup()
    const onOpenRecord = vi.fn()
    const record = createRecord()

    render(
      <PriorityQueuePanel records={[record]} onOpenRecord={onOpenRecord} />
    )

    await user.click(
      screen.getByRole("button", {
        name: `Open ${record.title}`,
      })
    )

    expect(onOpenRecord).toHaveBeenCalledWith(record)
  })
})
