export const pdpaEditorial = {
  shell: {
    title: "PDPA",
    tagline: "Regional privacy obligations inside the same trust system",
  },

  opening: {
    eyebrow: "Legal",
    headline:
      "PDPA belongs inside the same trust system, not outside the product story.",
    thesis:
      "Afenda's PDPA route should make regional privacy obligations readable without dropping the structural standards set by the wider trust and governance surfaces. It exists to show how regional policy still maps back to operating controls.",
    annotation:
      "A region-specific policy page is only credible when it stays connected to the same accountability logic as the rest of the public system.",
    rails: [
      "Regional privacy clarity",
      "Control mapping",
      "Governance accountability",
      "Readable evidence",
    ],
  },

  regionalFrame: {
    title:
      "Regional policy pages should be specific, navigable, and operationally connected.",
    body: [
      "PDPA is not only a compliance acronym. It is a regional signal that organizations need readable privacy obligations in context.",
      "Readers should be able to see how those obligations connect to ownership, control posture, and reviewability instead of landing on an isolated legal island.",
    ],
    matrix: [
      {
        title: "Jurisdiction",
        detail:
          "The page should make regional privacy scope visible for organizations operating in or with Southeast Asia.",
      },
      {
        title: "Control mapping",
        detail:
          "Policy expectations need to connect to operational controls and data-handling behavior.",
      },
      {
        title: "Ownership",
        detail:
          "Regional posture still has to show who is accountable for the operating standard.",
      },
      {
        title: "Readability",
        detail:
          "If the route cannot be scanned under review pressure, it is failing the job legal content is meant to do.",
      },
    ],
  },

  continuity: {
    title:
      "Regional policy stays useful when it remains part of the same continuity chain.",
    intro:
      "PDPA should reinforce cumulative trust across routes rather than introducing a separate public logic for the region.",
    chain: [
      {
        label: "Region",
        description:
          "The route anchors privacy obligations to the regional operating context instead of treating them as generic compliance language.",
      },
      {
        label: "Purpose",
        description:
          "Readers can understand why data handling expectations exist and what they are meant to govern.",
      },
      {
        label: "Control",
        description:
          "Policy obligations are tied back to operational controls and responsible ownership.",
      },
      {
        label: "Review",
        description:
          "Regional policy remains connected to privacy and trust surfaces so scrutiny can escalate without fragmentation.",
      },
    ],
    note: "PDPA should extend the trust tree, not fork it into a separate campaign or legal aesthetic.",
  },

  cta: {
    title:
      "Move from regional policy into broader privacy and regional rollout context.",
    body: "Region-specific pages should connect policy detail back to the wider public system so trust remains cumulative across routes.",
    actions: [
      {
        label: "Open Privacy Policy",
        to: "/marketing/legal/privacy-policy",
      },
      {
        label: "View Asia Pacific",
        to: "/marketing/regional/asia-pacific",
      },
    ],
    note: "This route now behaves like a governed regional policy surface rather than a temporary legal placeholder.",
  },
} as const
