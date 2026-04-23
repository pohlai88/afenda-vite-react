export const aboutPageContent = {
  shell: {
    title: "Afenda ERP",
    tagline: "About the company — business truth as structure, not narration",
  },

  hero: {
    eyebrow: "About AFENDA",
    headline: "A company built around business truth.",
    thesis:
      "AFENDA is not a feature system. It is an operating surface designed to keep business actions, records, and consequences structurally bound.",
    annotation:
      "Most systems describe the business after it has already fragmented. AFENDA is designed to prevent that fragmentation from occurring in the first place.",
  },

  interrogation: {
    title: "Most systems explain too late.",
    body: [
      "In most organizations, actions happen in one place, records are stored in another, and meaning is reconstructed somewhere else entirely.",
      "A transaction is posted. A document is filed. An approval is recorded. But the connection between them is weak, delayed, or manually inferred.",
      "By the time reconciliation happens, the original intent has already been lost.",
      "What remains is a narrative assembled after the fact, not the truth of what actually occurred.",
      "This is not a tooling problem. It is a structural problem.",
    ],
    sideNote:
      "Fragmentation is not visible at the moment of action. It becomes visible only when the business is forced to explain itself.",
  },

  truthPositioning: {
    title: "AFENDA refuses delayed truth.",
    body: [
      "AFENDA is built on a simple conviction: a business record should never detach from the action that created it.",
      "Every document, entity, event, and decision must remain attributable, not reconstructed.",
      "The system does not wait to explain. It binds.",
      "The result is not better reporting. It is structural clarity at the moment of operation.",
    ],
    contrast:
      "Where conventional systems reconcile after the fact, AFENDA maintains truth as a continuous condition.",
    transformationLattice: [
      {
        defaultMode:
          "Fragmented actions; meaning reassembled once damage is visible.",
        afendaMode:
          "Single continuity chain: intent, change, and record stay coupled.",
      },
      {
        defaultMode:
          "Close and review become forensic reconstruction of missing links.",
        afendaMode:
          "Close and review validate lineage that was never allowed to break.",
      },
    ],
  },

  operatingModel: {
    title: "An operating model based on attributable structure.",
    intro:
      "AFENDA treats business activity as a chain of attributable elements, not isolated records.",
    chain: [
      {
        label: "Document",
        description:
          "The originating artifact that captures intent in a structured form.",
      },
      {
        label: "Entity",
        description:
          "The business subject affected by the action — customer, supplier, inventory, or account.",
      },
      {
        label: "Event",
        description:
          "The actual occurrence that modifies state within the system.",
      },
      {
        label: "Transition",
        description:
          "The controlled change between states, governed by rules and context.",
      },
      {
        label: "Decision",
        description:
          "The point at which business logic determines outcome and consequence.",
      },
      {
        label: "Record",
        description:
          "The resulting state that remains attributable to its full chain of origin.",
      },
    ],
    closing:
      "This is not a data pipeline. It is a truth-binding system where each step remains explainable and intact.",
  },

  principles: {
    title: "Principles, not positioning.",
    items: [
      {
        title: "Truth before convenience",
        description:
          "We do not simplify at the cost of losing meaning. The system must preserve what actually happened.",
      },
      {
        title: "Attribution before narration",
        description:
          "A record must be traceable to its cause, not explained retroactively.",
      },
      {
        title: "Structure before expansion",
        description:
          "We do not scale fragmentation. We enforce structure first, then grow.",
      },
      {
        title: "Resolution before reporting",
        description:
          "The system should resolve inconsistencies at the moment they arise, not surface them later.",
      },
      {
        title: "Seriousness over software theatre",
        description:
          "We do not optimize for appearance. We optimize for correctness, clarity, and consequence.",
      },
    ],
  },

  credibility: {
    title: "Trust is structural, not claimed.",
    body: [
      "AFENDA does not rely on decorative proof to establish credibility.",
      "Trust emerges from the system’s ability to remain consistent, attributable, and explainable under real operating conditions.",
      "Every record carries its origin. Every transition is governed. Every state can be traced without reconstruction.",
      "This is what makes the system reliable — not claims, but structure.",
    ],
    signals: [
      "Attributable records across all operations",
      "Deterministic transitions governed by defined rules",
      "Consistent state without post-hoc reconciliation",
      "Full traceability from action to outcome",
      "Alignment between operational activity and financial consequence",
    ],
  },

  footer: {
    title: "See how the system holds together.",
    body: "AFENDA is best understood through its structure. Explore how actions, records, and decisions remain bound in a single operating surface.",
    actions: [
      {
        label: "View product",
        to: "/marketing/product/truth-engine",
      },
      {
        label: "Request walkthrough",
        to: "/login",
      },
    ],
    note: "No abstraction. No reconstruction. Just a system that remains true while the business is moving.",
  },
} as const
