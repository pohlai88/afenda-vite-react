import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import {
  AuditTrailPage,
  CounterpartyRosterPage,
  EventsOpsPage,
} from "../components/events-workspace-pages"
import type {
  OpsAuditFeedResponse,
  OpsCounterpartyFeedResponse,
  OpsEventsWorkspaceFeedResponse,
} from "../types/workspace-ops"
import shellEn from "@/app/_platform/i18n/locales/en/shell.json"

const claimEventMock = vi.fn(async () => undefined)
const advanceEventMock = vi.fn(async () => undefined)

function flattenMessages(
  input: Record<string, unknown>,
  prefix = ""
): Record<string, string> {
  return Object.entries(input).reduce<Record<string, string>>(
    (accumulator, [key, value]) => {
      const nextKey = prefix ? `${prefix}.${key}` : key
      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        Object.assign(
          accumulator,
          flattenMessages(value as Record<string, unknown>, nextKey)
        )
      } else if (typeof value === "string") {
        accumulator[nextKey] = value
      }
      return accumulator
    },
    {}
  )
}

const shellMessages = flattenMessages(shellEn as Record<string, unknown>)

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (
      key: string,
      options?: Record<string, string | number | undefined>
    ): string => {
      const template = shellMessages[key] ?? key
      if (!options) {
        return template
      }

      return Object.entries(options).reduce(
        (result, [name, value]) =>
          result.replaceAll(`{{${name}}}`, String(value ?? "")),
        template
      )
    },
  }),
}))

const eventsWorkspaceFeed: OpsEventsWorkspaceFeedResponse = {
  eventsWorkspace: {
    tenantId: "tenant-1",
    tenantName: "Acme Operations",
    summaryLine:
      "Queue, counterparty, and audit context in one operating surface.",
    operatingWindowLabel: "Operating window: 07:00 to 19:00 ICT",
    highlightedEventId: "evt-4301",
    lastUpdatedAt: "2026-04-22T09:20:00.000Z",
    metrics: [
      {
        id: "events-open",
        label: "Open events",
        value: "3",
        helper: "Events still moving through the queue",
        tone: "warning",
      },
    ],
  },
  events: [
    {
      id: "evt-4301",
      code: "EVT-4301",
      title: "Revenue pack is waiting on carrier proof",
      summary: "Proof-of-delivery is still missing from the counterparty.",
      priority: "critical",
      status: "draft",
      stageLabel: "Captured",
      ownerLabel: null,
      counterpartyId: "counterparty-northstar",
      sourceLabel: "OMS",
      slaLabel: "15m to breach",
      updatedAt: "2026-04-22T09:20:00.000Z",
      progress: {
        currentStep: 1,
        totalSteps: 5,
        steps: ["Captured", "Assigned", "In progress", "Completed", "Closed"],
      },
    },
    {
      id: "evt-4298",
      code: "EVT-4298",
      title: "Refund event needs finance approval",
      summary: "Finance still needs to complete the approval.",
      priority: "high",
      status: "in_progress",
      stageLabel: "In progress",
      ownerLabel: "Mina Santos",
      counterpartyId: "counterparty-atlas",
      sourceLabel: "CRM",
      slaLabel: "Review today",
      updatedAt: "2026-04-22T08:45:00.000Z",
      progress: {
        currentStep: 3,
        totalSteps: 5,
        steps: ["Captured", "Assigned", "In progress", "Completed", "Closed"],
      },
    },
  ],
  recentAuditEntries: [
    {
      id: "audit-1",
      eventId: "evt-4301",
      eventCode: "EVT-4301",
      title: "Counterparty evidence request issued",
      description: "Operations requested the missing proof packet.",
      actorLabel: "Rhea Coleman",
      actorRole: "Events operations lead",
      actionLabel: "Counterparty follow-up",
      occurredAt: "2026-04-22T09:16:00.000Z",
    },
  ],
  counterparties: [
    {
      id: "counterparty-northstar",
      code: "NSL",
      name: "Northstar Logistics",
      regionLabel: "APAC",
      ownerLabel: "Counterparty desk",
      channelLabel: "Carrier proof API",
      responseLabel: "Responds within 20m",
      health: "attention",
      activeEventIds: ["evt-4301"],
    },
  ],
}

const auditFeed: OpsAuditFeedResponse = {
  audit: {
    tenantId: "tenant-1",
    tenantName: "Acme Operations",
    summaryLine:
      "Truth records preserve who acted, what changed, and which operating doctrine governed the decision.",
    recordedWindowLabel: "Truth feed ordered by occurredAt descending",
    lastRecordedAt: "2026-04-22T09:16:00.000Z",
  },
  entries: [
    {
      id: "audit-1",
      tenantId: "tenant-1",
      occurredAt: "2026-04-22T09:16:00.000Z",
      commandType: "ops.event.claim",
      actionLabel: "Claimed event",
      entityType: "ops_event",
      entityId: "evt-4301",
      eventCode: "EVT-4301",
      title: "Counterparty evidence request issued",
      summary: "Operations requested the missing proof packet.",
      doctrineRef: "ops.truth.claim",
      invariantRefs: [],
      actorLabel: "Rhea Coleman",
      actorRole: "Events operations lead",
      metadata: {},
    },
  ],
  page: {
    limit: 30,
    nextBefore: null,
  },
}

const counterpartyFeed: OpsCounterpartyFeedResponse = {
  counterparties: {
    tenantId: "tenant-1",
    tenantName: "Acme Operations",
    summaryLine:
      "Outside counterparties stay visible as live operational dependencies, not detached relationship records.",
    operatingWindowLabel: "Operating window: 07:00 to 19:00 ICT",
    lastUpdatedAt: "2026-04-22T09:20:00.000Z",
    metrics: eventsWorkspaceFeed.eventsWorkspace.metrics,
  },
  items: eventsWorkspaceFeed.counterparties,
  events: eventsWorkspaceFeed.events,
}

vi.mock("../hooks/use-events-workspace", () => ({
  useEventsWorkspace: () => ({
    data: eventsWorkspaceFeed,
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(async () => undefined),
    claimEvent: claimEventMock,
    advanceEvent: advanceEventMock,
    isClaimingEvent: false,
    isAdvancingEvent: false,
  }),
}))

vi.mock("../hooks/use-ops-audit-feed", () => ({
  useOpsAuditFeed: () => ({
    data: auditFeed,
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(async () => undefined),
  }),
}))

vi.mock("../hooks/use-ops-counterparty-feed", () => ({
  useOpsCounterpartyFeed: () => ({
    data: counterpartyFeed,
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(async () => undefined),
  }),
}))

describe("events workspace pages", () => {
  it("renders the events operations page with a selectable queue and actions", () => {
    render(<EventsOpsPage />)

    expect(
      screen.getByRole("heading", { name: "Events operations" })
    ).toBeInTheDocument()
    expect(
      screen.getAllByText("Revenue pack is waiting on carrier proof").length
    ).toBeGreaterThan(0)
    expect(
      screen.getByRole("button", { name: "Claim event" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Advance stage" })
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Claim event" }))
    fireEvent.click(screen.getByRole("button", { name: "Advance stage" }))

    expect(claimEventMock).toHaveBeenCalledWith("evt-4301")
    expect(advanceEventMock).toHaveBeenCalledWith("evt-4301")

    fireEvent.click(
      screen.getByRole("button", {
        name: /Refund event needs finance approval/i,
      })
    )
    expect(screen.getAllByText("In progress").length).toBeGreaterThan(0)
  })

  it("renders dedicated audit and counterparty support pages", () => {
    render(<AuditTrailPage />)

    expect(
      screen.getByRole("heading", { name: "Audit trail" })
    ).toBeInTheDocument()
    expect(
      screen.getByText("Counterparty evidence request issued")
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        "Auditability is a truth-read surface, not workspace residue."
      )
    ).toBeInTheDocument()

    render(<CounterpartyRosterPage />)

    expect(
      screen.getByRole("heading", { name: "Operational counterparties" })
    ).toBeInTheDocument()
    expect(screen.getByText("Northstar Logistics")).toBeInTheDocument()
    expect(screen.getAllByText("EVT-4301").length).toBeGreaterThan(0)
  })
})
