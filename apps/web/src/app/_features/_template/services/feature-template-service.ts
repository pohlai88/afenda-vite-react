/**
 * Feature template seed service.
 *
 * Purpose:
 * - Provide stable seeded feature-template contracts for the template feature.
 * - Keep the seed dataset immutable at the service boundary.
 * - Return cloned feature definitions so consumers cannot mutate shared seed state.
 *
 * Rules:
 * - Seed data must stay complete for every `FeatureTemplateSlug`.
 * - Service reads must return fresh objects, not shared references.
 * - Contract shape should remain ready for a future API-backed implementation.
 */
import type {
  FeatureTemplateDefinition,
  FeatureTemplateMetric,
  FeatureTemplateRecord,
  FeatureTemplateSlug,
} from "../types/feature-template"

const featureTemplateSeed: Record<
  FeatureTemplateSlug,
  FeatureTemplateDefinition
> = {
  events: {
    slug: "events",
    title: "Event log",
    description:
      "Operational stream for workflow transitions, user activity, and system-level ERP events.",
    workspaceLabel: "Acme Treasury Ltd",
    scopeLabel: "Finance / Accounts payable",
    status: "healthy",
    routePath: "/app/events",
    metrics: [
      {
        id: "events-today",
        label: "Events today",
        value: "128",
        helper: "From active workspace scopes",
        trendLabel: "+12% vs prior window",
        tone: "success",
      },
      {
        id: "events-unread",
        label: "Unread",
        value: "9",
        helper: "Needs operator review",
        trendLabel: "3 high signal",
        tone: "warning",
      },
      {
        id: "events-latency",
        label: "Median delay",
        value: "1.8s",
        helper: "Ingestion to visible timeline",
        trendLabel: "Within control limit",
        tone: "info",
      },
      {
        id: "events-sla-risk",
        label: "SLA risk",
        value: "2",
        helper: "Queue items nearing breach",
        trendLabel: "Action required",
        tone: "warning",
      },
      {
        id: "events-evidence-ready",
        label: "Evidence ready",
        value: "14",
        helper: "Reviewer packets complete",
        trendLabel: "Exportable now",
        tone: "success",
      },
    ],
    records: [
      {
        id: "evt-1028",
        title: "Invoice approval workflow advanced",
        description: "Finance moved INV-1042 from review to posting.",
        status: "healthy",
        owner: "Finance operations",
        updatedAt: "2026-04-13T08:20:00.000Z",
        severity: "low",
        category: "Workflow",
        slaLabel: "On track",
        eventTimeLabel: "08:20 ICT",
      },
      {
        id: "evt-1027",
        title: "Inventory adjustment queued",
        description: "Warehouse correction is waiting for supervisor review.",
        status: "attention",
        owner: "Warehouse control",
        updatedAt: "2026-04-13T08:05:00.000Z",
        severity: "high",
        category: "Inventory",
        slaLabel: "42m to breach",
        eventTimeLabel: "08:05 ICT",
      },
      {
        id: "evt-1026",
        title: "Payment status webhook normalized",
        description:
          "Bank connector payload was reconciled with AP ledger state.",
        status: "healthy",
        owner: "Treasury systems",
        updatedAt: "2026-04-13T07:44:00.000Z",
        severity: "medium",
        category: "Integration",
        slaLabel: "Evidence linked",
        eventTimeLabel: "07:44 ICT",
      },
    ],
  },
  audit: {
    slug: "audit",
    title: "Audit trail",
    description:
      "Traceable record of operator decisions, policy checks, and tenant-scoped data changes.",
    workspaceLabel: "Acme Treasury Ltd",
    scopeLabel: "Audit / Control review",
    status: "attention",
    routePath: "/app/audit",
    metrics: [
      {
        id: "audit-open",
        label: "Open findings",
        value: "6",
        helper: "Across finance and inventory",
        trendLabel: "2 due this week",
        tone: "warning",
      },
      {
        id: "audit-evidence",
        label: "Evidence packs",
        value: "14",
        helper: "Ready for reviewer export",
        trendLabel: "9 complete",
        tone: "success",
      },
      {
        id: "audit-sla",
        label: "SLA risk",
        value: "2",
        helper: "Needs action this week",
        trendLabel: "Escalate today",
        tone: "danger",
      },
      {
        id: "audit-coverage",
        label: "Control coverage",
        value: "96%",
        helper: "Required checks observed",
        trendLabel: "+4 pts",
        tone: "success",
      },
    ],
    records: [
      {
        id: "aud-410",
        title: "Policy override requires justification",
        description:
          "A settlement threshold override is missing reviewer notes.",
        status: "attention",
        owner: "Internal audit",
        updatedAt: "2026-04-13T07:55:00.000Z",
        severity: "high",
        category: "Policy",
        slaLabel: "Due today",
        eventTimeLabel: "07:55 ICT",
      },
      {
        id: "aud-409",
        title: "Tenant scope change confirmed",
        description: "Subsidiary visibility update was approved and logged.",
        status: "healthy",
        owner: "Platform administration",
        updatedAt: "2026-04-12T17:30:00.000Z",
        severity: "low",
        category: "Access",
        slaLabel: "Complete",
        eventTimeLabel: "17:30 ICT",
      },
    ],
  },
  partners: {
    slug: "partners",
    title: "Partner integrations",
    description:
      "Integration readiness for connected banks, logistics providers, marketplaces, and tax systems.",
    workspaceLabel: "Acme Treasury Ltd",
    scopeLabel: "Integrations / Partner operations",
    status: "blocked",
    routePath: "/app/partners",
    metrics: [
      {
        id: "partners-live",
        label: "Live connectors",
        value: "4",
        helper: "Production data exchange enabled",
        trendLabel: "Stable",
        tone: "success",
      },
      {
        id: "partners-pending",
        label: "Pending reviews",
        value: "3",
        helper: "Awaiting credentials or approval",
        trendLabel: "2 owner actions",
        tone: "warning",
      },
      {
        id: "partners-failures",
        label: "Sync failures",
        value: "1",
        helper: "Payment status webhook retrying",
        trendLabel: "Retrying",
        tone: "danger",
      },
      {
        id: "partners-latency",
        label: "Median sync",
        value: "4.2s",
        helper: "Provider to ledger visible",
        trendLabel: "Healthy",
        tone: "info",
      },
    ],
    records: [
      {
        id: "int-204",
        title: "Bank feed webhook retrying",
        description:
          "The settlement webhook failed signature verification twice.",
        status: "blocked",
        owner: "Integrations",
        updatedAt: "2026-04-13T06:40:00.000Z",
        severity: "high",
        category: "Webhook",
        slaLabel: "Blocked",
        eventTimeLabel: "06:40 ICT",
      },
      {
        id: "int-203",
        title: "Marketplace catalog sync ready",
        description: "Product catalog push passed validation in sandbox.",
        status: "healthy",
        owner: "Commerce operations",
        updatedAt: "2026-04-12T16:15:00.000Z",
        severity: "medium",
        category: "Marketplace",
        slaLabel: "Ready",
        eventTimeLabel: "16:15 ICT",
      },
    ],
  },
} as const satisfies Record<FeatureTemplateSlug, FeatureTemplateDefinition>

function cloneFeatureTemplateMetric(
  metric: FeatureTemplateMetric
): FeatureTemplateMetric {
  return { ...metric }
}

function cloneFeatureTemplateRecord(
  record: FeatureTemplateRecord
): FeatureTemplateRecord {
  return { ...record }
}

function cloneFeatureTemplateDefinition(
  feature: FeatureTemplateDefinition
): FeatureTemplateDefinition {
  return {
    ...feature,
    metrics: feature.metrics.map(cloneFeatureTemplateMetric),
    records: feature.records.map(cloneFeatureTemplateRecord),
  }
}

function readFeatureTemplateSeed(
  slug: FeatureTemplateSlug
): FeatureTemplateDefinition {
  return featureTemplateSeed[slug]
}

export async function fetchFeatureTemplate(
  slug: FeatureTemplateSlug
): Promise<FeatureTemplateDefinition> {
  return cloneFeatureTemplateDefinition(readFeatureTemplateSeed(slug))
}
