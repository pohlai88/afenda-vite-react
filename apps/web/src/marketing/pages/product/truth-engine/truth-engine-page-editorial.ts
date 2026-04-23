import { MARKETING_PAGE_HREFS } from "@/marketing/marketing-page-registry"

export const truthEngineEditorial = {
  shell: {
    title: "Truth Engine",
    tagline: "Product architecture and accountable operating logic",
  },

  opening: {
    eyebrow: "Product",
    headline: "The truth engine is the operating logic behind Afenda.",
    thesis:
      "Afenda does not treat proof as a report generated after work is complete. The truth engine is the product logic that keeps source, state change, control, and consequence structurally attached while the business is still moving.",
    annotation:
      "What the flagship states editorially, this route explains mechanically: the system is designed so consequential records do not become after-images of workflow.",
    identityLines: [
      "Origin stays attributable",
      "State change stays causal",
      "Cross-domain context stays intact",
      "Reporting stays defensible",
    ],
  },

  operatingLaw: {
    title:
      "Afenda does not treat the record as an after-image of the workflow.",
    body: [
      "If a business state matters, the system should preserve the evidence that made it true before that evidence has time to fragment.",
      "Orders, approvals, movement, and ledger consequence should not depend on later reconstruction to become explainable.",
      "The product is therefore biased toward attributable continuity, not convenience at the cost of meaning.",
    ],
    laws: [
      {
        title: "Origin before output",
        description:
          "A consequential number does not earn trust unless its source, actor, and decision path remain visible.",
      },
      {
        title: "Causality before state",
        description:
          "A changed state has to remain attached to the business event that made the change valid.",
      },
      {
        title: "Continuity before reporting",
        description:
          "Finance, inventory, and operations should read from one chain instead of three stitched explanations.",
      },
    ],
  },

  continuityModel: {
    title:
      "The engine works by preserving one continuity chain across the operating sequence.",
    intro:
      "This page is not describing a reporting layer. It is describing the product discipline that prevents the record from becoming detached from the business cause.",
    chain: [
      {
        label: "Origin",
        description:
          "The initiating request, order, or instruction enters the system with accountable source context.",
      },
      {
        label: "Validation",
        description:
          "Rules, ownership, and approval logic verify that the action is permitted before state is allowed to move.",
      },
      {
        label: "Transition",
        description:
          "Operational state changes while the original cause remains attached to the event.",
      },
      {
        label: "Consequence",
        description:
          "Financial and reporting impact arise from the same chain rather than from a later interpretation.",
      },
      {
        label: "Proof",
        description:
          "Review sees lineage that can still defend itself without spreadsheet rescue or manual narration.",
      },
    ],
    note: "This continuity chain is the product stance: every output is only as trustworthy as the chain that remained intact beneath it.",
  },

  proofSurface: {
    title:
      "Proof matters because the underlying chain can still explain itself.",
    body: [
      "Reporting is defensible only when the underlying record has not drifted away from its source conditions.",
      "Cross-domain clarity depends on finance, operations, and inventory reading from the same attributable movement instead of reconciling parallel truths.",
      "That is why the truth engine is product architecture, not a message layer.",
    ],
    conditions: [
      {
        title: "Record integrity",
        detail:
          "The system can show what changed, who moved it, and under what authority without opening a side narrative.",
      },
      {
        title: "Cross-domain continuity",
        detail:
          "Inventory movement, approvals, and ledger consequence remain bound instead of forking into separate stories.",
      },
      {
        title: "Review readiness",
        detail:
          "Audit and management review validate an intact chain rather than reconstructing a missing one.",
      },
    ],
    closing:
      "The truth engine is valuable because it preserves the preconditions of trust, not because it produces a prettier output layer.",
  },

  cta: {
    title:
      "See the product logic in the flagship, then test it against the benchmark.",
    body: "Product pages should explain the mechanism clearly enough that the narrative and benchmark routes can pressure-test the same operating claim.",
    actions: [
      {
        label: "Open Flagship",
        to: "/marketing/flagship",
      },
      {
        label: "View Benchmark ERP",
        to: MARKETING_PAGE_HREFS.benchmarkErp,
      },
    ],
    note: "This route owns product meaning. It does not borrow campaign, legal, or regional framing to explain what the system actually is.",
  },
} as const
