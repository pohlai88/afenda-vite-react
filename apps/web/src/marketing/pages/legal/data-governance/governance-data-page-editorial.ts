export const dataGovernanceEditorial = {
  shell: {
    title: "Data Governance",
    tagline: "Scope discipline, lineage visibility, and governed consequence",
  },

  opening: {
    eyebrow: "Data Governance",
    headline:
      "Governance pages should be precise, readable, and operationally relevant.",
    thesis:
      "Afenda's governance surface exists to explain how scope, lineage, policy, and review stay aligned inside the operating model. It should read like a control publication, not like a generic legal appendix.",
    annotation:
      "Governance becomes useful when it helps readers understand what the system preserves under review pressure and why that preservation matters.",
    rails: [
      "Scope discipline",
      "Lineage visibility",
      "Policy alignment",
      "Control narrative",
    ],
  },

  governanceModel: {
    title:
      "Data governance only matters if the business boundary and movement logic remain visible.",
    body: [
      "Truth has to stay grounded in the correct operating context, including the entity, process, and responsibility boundary the work belongs to.",
      "Governance is therefore not just about policies on paper. It is about whether the system makes state movement, ownership, and review conditions visible enough to defend.",
      "A governance page should expose that structure directly rather than restating product copy in softer legal language.",
    ],
    matrix: [
      {
        title: "Scope",
        detail:
          "Readers should understand which business boundary owns the data and where responsibility sits.",
      },
      {
        title: "Lineage",
        detail:
          "Movement should remain attributable across systems, processes, and review moments.",
      },
      {
        title: "Policy",
        detail:
          "Rules need to map back to operational behavior rather than floating above the system as doctrine.",
      },
      {
        title: "Review",
        detail:
          "Governance succeeds when review validates visible structure instead of recovering missing links.",
      },
    ],
  },

  evidence: {
    title: "Governance should show what the system refuses to lose.",
    body: [
      "Lineage visibility matters because business explanation becomes fragile the moment data movement detaches from accountable cause.",
      "Policy alignment matters because governance without visible operational consequence becomes theatre.",
    ],
    chain: [
      {
        label: "Boundary",
        description:
          "The correct entity, team, and process scope are identified before movement is treated as valid.",
      },
      {
        label: "Movement",
        description:
          "State change preserves what changed, why it changed, and who initiated the change.",
      },
      {
        label: "Rule",
        description:
          "Policy is applied while the activity is occurring, not as commentary after the fact.",
      },
      {
        label: "Review",
        description:
          "Governance can be inspected as an intact chain of evidence rather than a reconstructed one.",
      },
    ],
    closing:
      "Good governance reduces ambiguity before review begins instead of describing ambiguity more elegantly afterward.",
  },

  cta: {
    title: "Keep governance pages connected to the product story.",
    body: "Legal and trust surfaces should reinforce the operating model rather than feeling like a second website with lower structural standards.",
    actions: [
      {
        label: "Open Trust Center",
        to: "/marketing/legal/trust-center",
      },
      {
        label: "View Benchmark Campaign",
        to: "/marketing/campaigns/erp-benchmark",
      },
    ],
    note: "This route now behaves as a governance dossier instead of a generic legal block stack.",
  },
} as const
