import type {
  FeatureTemplateDefinition,
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
    status: "healthy",
    routePath: "/app/events",
    metrics: [
      {
        id: "events-today",
        label: "Events today",
        value: "128",
        helper: "From active workspace scopes",
      },
      {
        id: "events-unread",
        label: "Unread",
        value: "9",
        helper: "Needs operator review",
      },
      {
        id: "events-latency",
        label: "Median delay",
        value: "1.8s",
        helper: "Ingestion to visible timeline",
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
      },
      {
        id: "evt-1027",
        title: "Inventory adjustment queued",
        description: "Warehouse correction is waiting for supervisor review.",
        status: "attention",
        owner: "Warehouse control",
        updatedAt: "2026-04-13T08:05:00.000Z",
      },
    ],
  },
  audit: {
    slug: "audit",
    title: "Audit trail",
    description:
      "Traceable record of operator decisions, policy checks, and tenant-scoped data changes.",
    status: "attention",
    routePath: "/app/audit",
    metrics: [
      {
        id: "audit-open",
        label: "Open findings",
        value: "6",
        helper: "Across finance and inventory",
      },
      {
        id: "audit-evidence",
        label: "Evidence packs",
        value: "14",
        helper: "Ready for reviewer export",
      },
      {
        id: "audit-sla",
        label: "SLA risk",
        value: "2",
        helper: "Needs action this week",
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
      },
      {
        id: "aud-409",
        title: "Tenant scope change confirmed",
        description: "Subsidiary visibility update was approved and logged.",
        status: "healthy",
        owner: "Platform administration",
        updatedAt: "2026-04-12T17:30:00.000Z",
      },
    ],
  },
  partners: {
    slug: "partners",
    title: "Partner integrations",
    description:
      "Integration readiness for connected banks, logistics providers, marketplaces, and tax systems.",
    status: "blocked",
    routePath: "/app/partners",
    metrics: [
      {
        id: "partners-live",
        label: "Live connectors",
        value: "4",
        helper: "Production data exchange enabled",
      },
      {
        id: "partners-pending",
        label: "Pending reviews",
        value: "3",
        helper: "Awaiting credentials or approval",
      },
      {
        id: "partners-failures",
        label: "Sync failures",
        value: "1",
        helper: "Payment status webhook retrying",
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
      },
      {
        id: "int-203",
        title: "Marketplace catalog sync ready",
        description: "Product catalog push passed validation in sandbox.",
        status: "healthy",
        owner: "Commerce operations",
        updatedAt: "2026-04-12T16:15:00.000Z",
      },
    ],
  },
}

export async function fetchFeatureTemplate(
  slug: FeatureTemplateSlug
): Promise<FeatureTemplateDefinition> {
  return featureTemplateSeed[slug]
}
