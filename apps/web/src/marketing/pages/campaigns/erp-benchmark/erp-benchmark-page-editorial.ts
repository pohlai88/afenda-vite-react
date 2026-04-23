export const erpBenchmarkEditorial = {
  shell: {
    title: "ERP Benchmark",
    tagline:
      "Benchmark-led comparison reconstructed as an editorial operating surface",
  },

  opening: {
    eyebrow: "ERP Benchmark",
    headline: "Use the benchmark names. Refuse their blind spots.",
    thesis:
      "SAP, Oracle, Zoho, and QuickBooks each teach buyers something useful. None should decide the operating standard on their own. Afenda uses the benchmark as orientation, then asks whether the record can stay attributable while the business is still moving.",
    annotation:
      "A benchmark conversation becomes serious only when it stops comparing vendor scale and starts comparing continuity, consequence, and explainability.",
    referenceAxes: [
      {
        label: "Speed",
        detail:
          "QuickBooks and Zoho normalize fast onboarding, familiar ledgers, and immediate team movement.",
      },
      {
        label: "Control",
        detail:
          "Oracle and SAP normalize governance, approval posture, and formal review discipline.",
      },
      {
        label: "Breadth",
        detail:
          "Large suites normalize module count as a proxy for seriousness and future readiness.",
      },
      {
        label: "Truth",
        detail:
          "Afenda insists the record remain bound across inventory, finance, approvals, and execution.",
      },
    ],
  },

  benchmarkFrame: {
    title: "The benchmark should orient the room, not define the decision.",
    body: [
      "Buyers do not enter the room without reference points. They use recognized systems to anchor expectations about adoption, governance, reporting, and enterprise scope.",
      "That comparison is useful until it becomes lazy. Once the conversation stops at feature breadth or brand gravity, the operating model disappears from view.",
      "Afenda keeps the reference names in the room, but forces the evaluation back onto whether the business can preserve accountable continuity while work is still happening.",
    ],
    matrix: [
      {
        name: "QuickBooks",
        benchmarkUse:
          "Speed, familiarity, and accessible ledger workflows for teams that need to move quickly.",
        missing:
          "It does not prove that operational cause and financial consequence remain coupled.",
      },
      {
        name: "Zoho",
        benchmarkUse:
          "Approachable workflow coverage and straightforward adoption across growing teams.",
        missing:
          "It does not guarantee that attribution survives across functions when process pressure rises.",
      },
      {
        name: "Oracle",
        benchmarkUse:
          "Governance, control posture, and consequence in environments that expect review rigor.",
        missing:
          "It does not automatically mean day-to-day operational truth remains continuous.",
      },
      {
        name: "SAP",
        benchmarkUse:
          "Institutional breadth, process scope, and enterprise seriousness across multiple domains.",
        missing:
          "It does not by itself answer whether one accountable record survives the full operating chain.",
      },
    ],
    footer:
      "Benchmark names are legitimate reference points. They are weak substitutes for an accountable operating model.",
  },

  evaluationModel: {
    title:
      "Judge the operating model under pressure, not the feature brochure.",
    intro:
      "Afenda changes the benchmark conversation by following the business sequence that actually has to hold.",
    trace: [
      {
        label: "Action",
        description:
          "A business action enters the system as an attributable request, order, movement, or instruction.",
      },
      {
        label: "State change",
        description:
          "Operational state moves immediately with the business cause still attached.",
      },
      {
        label: "Control",
        description:
          "Ownership, approval, and policy are applied before the chain can drift into ambiguity.",
      },
      {
        label: "Consequence",
        description:
          "Financial and reporting impact emerge from the same sequence, not from a later retelling.",
      },
      {
        label: "Evidence",
        description:
          "Review sees lineage that can be defended without spreadsheet rescue or manual explanation.",
      },
    ],
    tests: [
      {
        title: "Finance consequence",
        description:
          "Can the number defend itself without manual explanation or side-ledger repair?",
      },
      {
        title: "Inventory continuity",
        description:
          "Does stock movement preserve the business cause that changed the state?",
      },
      {
        title: "Governance readiness",
        description:
          "Can approvals, ownership, and audit evidence stay visible before review pressure arrives?",
      },
    ],
    note: "If the benchmark cannot survive this trace, it is describing software scope, not operating truth.",
  },

  positioning: {
    title: "Afenda reframes the comparison around accountable continuity.",
    body: [
      "Afenda is not trying to imitate a larger suite. It is trying to impose a stronger operating standard on the comparison itself.",
      "The question is not which vendor appears most complete in isolation. The question is which system can keep movement, control, and record continuity on the same proof surface.",
      "That is why benchmark-aware positioning still returns to one demand: the business must be able to explain itself while it is operating, not after damage has already surfaced.",
    ],
    reframes: [
      {
        benchmarkQuestion:
          "Which suite looks broad enough to replace more tools?",
        afendaStandard:
          "Which system can keep one accountable record from operational trigger to financial consequence?",
      },
      {
        benchmarkQuestion: "Which vendor feels most enterprise in the room?",
        afendaStandard:
          "Which operating model keeps governance visible inside everyday execution rather than only during review theatre?",
      },
      {
        benchmarkQuestion: "Which product seems easiest for teams to adopt?",
        afendaStandard:
          "Which workflow lets teams move quickly without severing action from consequence?",
      },
      {
        benchmarkQuestion: "Which platform can report on the business later?",
        afendaStandard:
          "Which system can defend the business now, before later becomes reconstruction work?",
      },
    ],
    markers: [
      "One accountable record",
      "Cross-domain continuity",
      "Audit-ready workflow",
      "Benchmark-aware positioning",
    ],
    closing:
      "The benchmark becomes useful once it stops asking which logo looks largest and starts asking which record can remain intact.",
  },

  cta: {
    title: "Bring the benchmark conversation onto accountable ground.",
    body: "Show buyers the systems they recognize, then move the decision onto continuity, traceability, and governed consequence.",
    actions: [
      {
        label: "View Flagship",
        to: "/marketing/flagship",
      },
      {
        label: "Open Trust Center",
        to: "/marketing/legal/trust-center",
      },
    ],
    note: "This route now behaves as an editorial benchmark dossier, not a generic campaign block sequence.",
  },
} as const
