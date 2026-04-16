import type { PlatformPreviewFixture } from "../types/platform-preview-types"

/**
 * PLATFORM PREVIEW FIXTURES
 *
 * Curated public showcase data for the AFENDA platform preview.
 * This is static storytelling content designed to feel credible,
 * operational, and enterprise-grade without coupling to app runtime.
 */

export const platformPreviewFixture: PlatformPreviewFixture = {
  id: "platform-preview-primary",
  slug: "platform-preview",
  density: "compact",

  hero: {
    eyebrow: "Operational truth, staged clearly",
    title:
      "ERP that keeps business state, operator action, and audit evidence visible in one workspace.",
    description:
      "AFENDA is designed for serious operations. Instead of scattering context across disconnected screens, it stages scope, controls, evidence, and workflow signals together so finance teams can act with confidence.",
    badges: [
      "Evidence-linked workflows",
      "Structured active scope",
      "Control-visible operations",
      "Enterprise density without chaos",
    ],
    metrics: [
      {
        id: "hero-metric-1",
        label: "Active scope visibility",
        value: "100%",
        caption: "tenant · entity · function · module surfaced before action",
        tone: "success",
        trend: "flat",
      },
      {
        id: "hero-metric-2",
        label: "Event-to-evidence continuity",
        value: "Full-path",
        caption: "operator trace stays attached to the business event",
        tone: "info",
        trend: "up",
      },
      {
        id: "hero-metric-3",
        label: "Workflow posture",
        value: "Controlled",
        caption: "signals, controls, and notes remain visible in context",
        tone: "accent",
        trend: "flat",
      },
    ],
    actions: [
      {
        id: "hero-action-demo",
        label: "Book a demo",
        kind: "primary",
        href: "/contact",
      },
      {
        id: "hero-action-explore",
        label: "Explore the platform",
        kind: "secondary",
        href: "/platform-preview",
      },
    ],
  },

  scope: {
    tenant: "Acme Holdings",
    legalEntity: "Acme Treasury Ltd",
    functionName: "Finance",
    module: "Accounts payable",
    role: "Regional controller",
    region: "SEA",
    periodLabel: "Q2 close window",
    chips: [
      {
        id: "scope-chip-tenant",
        label: "Tenant",
        value: "Acme Holdings",
        tone: "default",
      },
      {
        id: "scope-chip-entity",
        label: "Legal entity",
        value: "Acme Treasury Ltd",
        tone: "default",
      },
      {
        id: "scope-chip-role",
        label: "Role",
        value: "Regional controller",
        tone: "muted",
      },
      {
        id: "scope-chip-period",
        label: "Period",
        value: "Q2 close window",
        tone: "accent",
      },
    ],
  },

  nav: [
    {
      id: "workspace",
      label: "Workspace",
      description: "Active operational view",
      iconKey: "layout-dashboard",
      active: true,
      children: [
        {
          id: "workspace-overview",
          label: "Overview",
        },
        {
          id: "workspace-event-log",
          label: "Event log",
          active: true,
          badge: "2",
        },
        {
          id: "workspace-exceptions",
          label: "Exceptions",
        },
      ],
    },
    {
      id: "controls",
      label: "Controls",
      description: "Governed workflow posture",
      iconKey: "shield-check",
      children: [
        {
          id: "controls-audit-trail",
          label: "Audit trail",
          active: true,
        },
        {
          id: "controls-policy-checks",
          label: "Policy checks",
          badge: "6",
        },
        {
          id: "controls-signoffs",
          label: "Sign-offs",
        },
      ],
    },
    {
      id: "integrations",
      label: "Integrations",
      description: "Connected business signals",
      iconKey: "plug-zap",
      children: [
        {
          id: "integrations-partners",
          label: "Partner integrations",
          active: true,
        },
        {
          id: "integrations-webhooks",
          label: "Webhooks",
        },
        {
          id: "integrations-reconciliation",
          label: "Reconciliation",
          badge: "1",
        },
      ],
    },
  ],

  events: [
    {
      id: "evt-1026",
      eyebrow: "Governed ingress",
      title: "Webhook normalized into governed business event",
      description:
        "The inbound banking payload was reconciled with AP ledger context, classified into a governed event shape, and linked to the active operating scope before any downstream workflow advanced.",
      actor: "Treasury systems",
      timestamp: "07:44 ICT",
      sla: "Evidence linked",
      status: "normalized",
      tone: "info",
      tags: ["connector", "ledger-linked", "active scope"],
      evidence: [
        {
          id: "evt-1026-evidence-1",
          label: "Source",
          value: "HSBC payment webhook",
          status: "verified",
          tone: "default",
        },
        {
          id: "evt-1026-evidence-2",
          label: "Scope binding",
          value: "Acme Treasury Ltd · Accounts payable",
          status: "verified",
          tone: "success",
        },
        {
          id: "evt-1026-evidence-3",
          label: "Operator visibility",
          value: "Visible before release",
          status: "healthy",
          tone: "accent",
        },
      ],
      actions: [
        {
          id: "evt-1026-action-view",
          label: "View evidence",
          kind: "ghost",
        },
      ],
    },
    {
      id: "evt-1027",
      eyebrow: "Controlled progression",
      title: "Payment state aligned before release approval",
      description:
        "Control checks confirmed actor attribution, posting path, and workflow readiness before the payment moved forward. The event remains connected to both the operator context and the control posture that allowed progression.",
      actor: "Workflow bus",
      timestamp: "07:46 ICT",
      sla: "Control complete",
      status: "verified",
      tone: "success",
      tags: ["approval", "control", "workflow"],
      evidence: [
        {
          id: "evt-1027-evidence-1",
          label: "Control posture",
          value: "All required checks passed",
          status: "healthy",
          tone: "success",
        },
        {
          id: "evt-1027-evidence-2",
          label: "Actor trace",
          value: "Regional controller · delegated lane",
          status: "verified",
          tone: "default",
        },
        {
          id: "evt-1027-evidence-3",
          label: "Release state",
          value: "Ready for treasury handoff",
          status: "nominal",
          tone: "info",
        },
      ],
      actions: [
        {
          id: "evt-1027-action-review",
          label: "Review workflow",
          kind: "ghost",
        },
      ],
    },
    {
      id: "evt-1028",
      eyebrow: "Operational commentary",
      title: "Operator notes preserved with event lineage",
      description:
        "Review commentary was attached directly to the event path rather than stored as disconnected communication, preserving business meaning, timing, and ownership for later audit and operational follow-through.",
      actor: "AP operations",
      timestamp: "07:51 ICT",
      sla: "Trace preserved",
      status: "healthy",
      tone: "accent",
      tags: ["notes", "lineage", "follow-through"],
      evidence: [
        {
          id: "evt-1028-evidence-1",
          label: "Comment visibility",
          value: "Context-linked to source event",
          status: "verified",
          tone: "success",
        },
        {
          id: "evt-1028-evidence-2",
          label: "Attribution",
          value: "Named operator and time preserved",
          status: "verified",
          tone: "default",
        },
      ],
    },
  ],

  signals: [
    {
      id: "signal-ingestion",
      label: "Ingestion",
      status: "live",
      description:
        "Inbound connector activity is flowing into governed event intake.",
      value: "12 active feeds",
      trend: "up",
      tone: "success",
    },
    {
      id: "signal-audit-writer",
      label: "Audit writer",
      status: "synced",
      description:
        "Control and operator evidence remain attached at write time.",
      value: "No drift detected",
      trend: "flat",
      tone: "info",
    },
    {
      id: "signal-workflow-bus",
      label: "Workflow bus",
      status: "nominal",
      description:
        "State transitions are progressing without unresolved conflicts.",
      value: "4 governed lanes",
      trend: "flat",
      tone: "default",
    },
    {
      id: "signal-reconciliation",
      label: "Reconciliation",
      status: "healthy",
      description:
        "Business-visible state remains aligned with connector activity.",
      value: "98.7% aligned",
      trend: "up",
      tone: "accent",
    },
  ],

  insights: [
    {
      id: "insight-audit-coverage",
      eyebrow: "Evidence posture",
      title: "Audit coverage is visible before work is finished",
      description:
        "Policy checks, scope lineage, and actor attribution are surfaced inside the workflow itself so teams do not need to reconstruct the operating path after the fact.",
      meta: "controls · scope · actor trace",
      value: "Pre-completion evidence",
      tone: "success",
      action: {
        id: "insight-audit-action",
        label: "See control posture",
        kind: "ghost",
      },
    },
    {
      id: "insight-integration-signals",
      eyebrow: "Business meaning",
      title: "Integration events stay tied to ledger-visible truth",
      description:
        "Connector activity is not left as transport noise. AFENDA stages it as governed business movement with context, impact, and follow-through.",
      meta: "connector · ledger · workflow",
      value: "Signal with business meaning",
      tone: "info",
    },
    {
      id: "insight-operator-notes",
      eyebrow: "Operational continuity",
      title: "Operator notes remain part of the event lineage",
      description:
        "Comments and handoff context stay linked to the underlying event path so responsibility survives escalations, approvals, and reconciliations.",
      meta: "notes · ownership · continuity",
      value: "Lineage retained",
      tone: "accent",
    },
  ],

  proofStrip: [
    {
      id: "proof-1",
      label: "Structured active scope",
      description:
        "Tenant, entity, role, and module remain visible during work.",
      tone: "default",
    },
    {
      id: "proof-2",
      label: "Evidence-linked workflow",
      description: "Signals and controls stay tied to the business event path.",
      tone: "success",
    },
    {
      id: "proof-3",
      label: "Operator-visible controls",
      description:
        "Teams can see the posture before they act, not after incidents.",
      tone: "info",
    },
    {
      id: "proof-4",
      label: "Integration traceability",
      description: "Inbound activity becomes business-meaningful state.",
      tone: "accent",
    },
    {
      id: "proof-5",
      label: "Dense, long-hour ergonomics",
      description: "Operational detail stays readable without becoming noisy.",
      tone: "muted",
    },
  ],

  storyPanels: [
    {
      id: "story-workspace",
      kind: "workspace",
      eyebrow: "Workspace posture",
      title: "A shell that feels operational, not decorative",
      description:
        "The interface is staged like a real working environment: explicit scope, dense but calm surfaces, and visible control posture without dashboard theatre.",
      bullets: [
        "Context remains visible across the workspace",
        "Panels feel structured instead of ornamental",
        "Density supports long operational sessions",
      ],
      metrics: [
        {
          id: "story-workspace-metric-1",
          label: "Interaction posture",
          value: "Calm density",
          tone: "accent",
        },
      ],
      tone: "accent",
    },
    {
      id: "story-audit",
      kind: "audit",
      eyebrow: "Audit narrative",
      title: "Evidence is attached during action, not reconstructed later",
      description:
        "AFENDA reduces forensic rework by keeping operator trace, state movement, and control posture connected at the point where the business event changes.",
      bullets: [
        "Actor attribution is preserved in context",
        "Control posture stays near workflow state",
        "Review commentary remains event-linked",
      ],
      metrics: [
        {
          id: "story-audit-metric-1",
          label: "Reconstruction burden",
          value: "Reduced",
          tone: "success",
          trend: "down",
        },
      ],
      tone: "success",
      action: {
        id: "story-audit-action",
        label: "Explore audit posture",
        kind: "secondary",
      },
    },
    {
      id: "story-control",
      kind: "control",
      eyebrow: "Control clarity",
      title: "Control posture is staged as part of the work surface",
      description:
        "Instead of burying control status in secondary systems, the product makes workflow readiness, signal health, and release posture directly visible inside the workspace.",
      bullets: [
        "Signals are compact but legible",
        "Release posture is easy to scan",
        "Escalation context remains attached",
      ],
      tone: "info",
    },
    {
      id: "story-integration",
      kind: "integration",
      eyebrow: "Integration discipline",
      title: "Events arrive as business signals, not disconnected plumbing",
      description:
        "The preview shows integrations as part of the operating system of the business rather than as technical noise that only engineers can decode.",
      bullets: [
        "Connector activity becomes governed movement",
        "Ledger meaning stays visible",
        "Downstream workflow keeps context intact",
      ],
      metrics: [
        {
          id: "story-integration-metric-1",
          label: "Signal readability",
          value: "Business-first",
          tone: "info",
        },
      ],
      tone: "default",
    },
  ],

  cta: {
    title:
      "See how AFENDA turns operational complexity into visible business truth.",
    description:
      "Walk through a product experience built for finance, control, and audit-heavy teams that need more than transactions and dashboards.",
    actions: [
      {
        id: "cta-book-demo",
        label: "Book a demo",
        kind: "primary",
        href: "/contact",
      },
      {
        id: "cta-talk-sales",
        label: "Talk to sales",
        kind: "secondary",
        href: "/contact",
      },
    ],
  },
}
