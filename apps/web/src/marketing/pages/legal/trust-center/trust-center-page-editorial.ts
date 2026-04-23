export const trustCenterEditorial = {
  shell: {
    title: "Trust Center",
    tagline: "Operational trust, control visibility, and accountable review",
  },

  opening: {
    eyebrow: "Trust Center",
    headline: "Operational trust starts before audit and survives after it.",
    thesis:
      "Afenda treats trust as the visible condition of an accountable system, not as an abstract promise layer. The public trust surface should explain how records, access, control, and review remain legible while the business is operating.",
    annotation:
      "A trust page becomes credible only when it shows the underlying control logic instead of collecting reassuring words in one place.",
    rails: [
      "Attributable records",
      "Access discipline",
      "Control visibility",
      "Security posture",
    ],
  },

  trustModel: {
    title: "Trust is presented as a system, not a slogan.",
    body: [
      "The system earns trust when consequential state remains attributable to source, actor, and business consequence.",
      "Control is only meaningful if operational teams, finance, and reviewers can see where responsibility sits before the business is under pressure.",
      "Security posture matters because it protects a governed operating chain, not because it decorates a marketing claim.",
    ],
    chain: [
      {
        label: "Source",
        description:
          "Business state begins with attributable origin instead of anonymous movement.",
      },
      {
        label: "Boundary",
        description:
          "Access rules define who can see, change, and approve consequential work.",
      },
      {
        label: "Control",
        description:
          "Policy and ownership stay visible while the action is in motion.",
      },
      {
        label: "Review",
        description:
          "Finance and operations can inspect proof without reconstructing a second narrative.",
      },
      {
        label: "Assurance",
        description:
          "Trust survives because the underlying chain remained governed from the start.",
      },
    ],
  },

  signals: {
    title:
      "Public trust should show the review conditions the system is built to satisfy.",
    body: [
      "Readers do not need decorative badges. They need evidence of what the system makes visible before audit and after audit.",
      "The trust surface should therefore explain how accountability, control posture, and review readiness reinforce one another.",
    ],
    items: [
      {
        title: "Record attribution",
        detail:
          "Every consequential state can be tied back to a source condition and accountable actor.",
      },
      {
        title: "Role-aware boundaries",
        detail:
          "Teams understand who can move, view, and approve sensitive work under defined responsibility.",
      },
      {
        title: "Operational reviewability",
        detail:
          "Proof remains visible in the working system instead of surfacing only during escalation.",
      },
    ],
    closing:
      "Trust is structural when the system keeps control, visibility, and consequence on the same operating surface.",
  },

  cta: {
    title: "Follow the trust model into governance detail.",
    body: "Trust pages should move readers toward clearer governance and product evidence rather than ending in abstract reassurance.",
    actions: [
      {
        label: "Open Data Governance",
        to: "/marketing/legal/data-governance",
      },
      {
        label: "Return to Flagship",
        to: "/marketing/flagship",
      },
    ],
    note: "This route now owns a clearer trust doctrine instead of relying on a generic legal page rhythm.",
  },
} as const
