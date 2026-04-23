/**
 * Flagship page editorial contract.
 * Owns page-local marketing copy and content data only.
 * Do not place JSX, layout logic, or motion policy here.
 */
import type { LucideIcon } from "lucide-react"
import {
  ArrowLeftRight,
  BookCheck,
  Boxes,
  FileSearch,
  Fingerprint,
  ScanSearch,
  ShieldAlert,
  Workflow,
} from "lucide-react"

import { MARKETING_PAGE_HREFS } from "../../../marketing-page-registry"

/**
 * Editorial contract for the marketing flagship page: copy, icons, and public
 * navigation targets only. No environment values, credentials, or internal
 * implementation detail — import layout/motion from companion modules instead.
 */

export type FlagshipPageNarrative = Readonly<{
  immutableLawsHeading: string
  operatingLawsLead: string
  benchmarkDescription: string
  /** Plain-language disclaimer for third-party statistics cited in Benchmark rows. */
  benchmarkThirdPartyAttribution: string
  scopeDescription: string
  proofDescription: string
  canonDescription: string
  finalDescription: string
}>

export type FlagshipPageHeroEditorial = Readonly<{
  shellTitle: string
  shellTagline: string
  regionLabel: string
  navTitle: string
  navTagline: string
  phaseOneEyebrow: string
  phaseOneHeading: string
  phaseOneSupport: string
  phaseTwoEyebrow: string
  phaseTwoHeading: string
  phaseTwoSupport: string
  finalEyebrow: string
  finalStatusLabel: string
  finalHeading: string
  finalBody: string
  finalProofPoints: readonly string[]
  machineStateLabel: string
  machineStateItems: readonly string[]
}>

export type FlagshipPageTextCard = Readonly<{
  title: string
  body: string
}>

export type FlagshipOperatingLaw = Readonly<{
  code: string
  title: string
  body: string
}>

export type FlagshipPageIconCard = FlagshipPageTextCard &
  Readonly<{
    icon: LucideIcon
  }>

export type FlagshipPageCornerNote = Readonly<{
  label: string
  note: string
}>

export type FlagshipPageCta = Readonly<{
  label: string
  to: string
}>

export type FlagshipPageEditorial = Readonly<{
  hero: FlagshipPageHeroEditorial
  narrative: FlagshipPageNarrative
  operatingLaws: readonly FlagshipOperatingLaw[]
  marketRealityCards: readonly FlagshipPageTextCard[]
  continuityScopeCards: readonly FlagshipPageIconCard[]
  fieldPracticeLines: readonly string[]
  accountableRecordCards: readonly FlagshipPageIconCard[]
  bindingStructure: Readonly<{
    cornerNotes: readonly FlagshipPageCornerNote[]
    evidenceLines: readonly string[]
  }>
  closingActionLinks: readonly FlagshipPageCta[]
}>

/** Canonical marketing copy and lists for the flagship route. */
export const FLAGSHIP_PAGE_CONTENT = {
  hero: {
    shellTitle: "Afenda Truth Layer",
    shellTagline: "Accountable business truth under pressure.",
    regionLabel: "Chaos is common. Truth is engineered.",
    navTitle: "Afenda Truth Layer",
    navTagline: "Accountable business truth under pressure.",
    phaseOneEyebrow: "Fragmented truth",
    phaseOneHeading: "Chaos is common.",
    phaseOneSupport:
      "Records split between document, operation, finance, and review.",
    phaseTwoEyebrow: "Enforcement layer",
    phaseTwoHeading: "Truth is engineered.",
    phaseTwoSupport:
      "NexusCanon binds origin, cause, and continuity before the record advances.",
    finalEyebrow: "Afenda Truth Layer",
    finalStatusLabel: "Canon chamber",
    finalHeading: "Chaos is common. Truth is engineered.",
    finalBody:
      "Afenda binds document, entity, event, and transition into one accountable business surface, so enterprise state can survive scrutiny without narrative repair.",
    finalProofPoints: [
      "Attributable origin stays attached to every consequential value.",
      "Causality survives approval, posting, and state transition.",
      "Continuity holds across finance, operations, inventory, and evidence.",
    ],
    machineStateLabel: "Machine state",
    machineStateItems: ["Origin bound", "Chain preserved", "Continuity locked"],
  },

  narrative: {
    immutableLawsHeading: "Immutable Laws",
    operatingLawsLead:
      "Afenda begins where an event must still prove itself while work is moving.",
    benchmarkDescription:
      "is built against the real failure line of events operations: fragmented queues, delayed counterparty response, manual reconciliation, and weak audit continuity. The problem is rarely activity volume. It is truth breaking apart between operator action, outside dependency, and evidence.",
    benchmarkThirdPartyAttribution:
      "Figures and vendor statements below cite named third-party research as summarized in public reports; they illustrate industry context, not Afenda performance guarantees. Review the primary sources for methodology, scope, and currency before relying on them for decisions.",
    scopeDescription:
      "does not treat the queue, the counterparty desk, and the audit trail as separate stories stitched together later. It keeps continuity at the point where an event changes state, so execution can move without losing evidence.",
    proofDescription:
      "is designed around a harsher standard than workflow completion: whether the resulting event can still explain itself to operations, finance, and audit. If origin, causality, and continuity cannot survive forward motion, the record is not strong enough to trust.",
    canonDescription:
      "NexusCanon is the binding structure behind Afenda. Event, actor, counterparty dependency, and transition do not drift into parallel narratives. They remain attributable, queryable, and explainable as one accountable operating surface.",
    finalDescription:
      "is for operators done paying the hidden tax of fragmented event systems: delay, escalation drag, counterparty ambiguity, audit friction, and reconstructed explanation. The objective is not prettier software. It is an operating record that can stand.",
  },

  operatingLaws: [
    {
      code: "ORIGIN",
      title: "No record without origin",
      body: "Each record resolves to source, actor, and start.",
    },
    {
      code: "CAUSE",
      title: "No transition without cause",
      body: "Every state change carries its business cause.",
    },
    {
      code: "CONTINUITY",
      title: "No truth without continuity",
      body: "Truth survives the next step without repair.",
    },
  ] as const satisfies readonly FlagshipOperatingLaw[],

  marketRealityCards: [
    {
      title: "Bad data is not cosmetic. It is expensive.",
      body: "IBM cites Gartner's estimate that poor data quality costs organizations an average of $12.9 million a year. In IBM's 2025 IBV reporting, more than a quarter of organizations estimated losses above $5 million, and 7% reported losses above $25 million. Afenda starts from the premise that broken continuity is a financial problem, not a reporting inconvenience.",
    },
    {
      title: "Fragmentation turns finance into repair work.",
      body: "Deloitte notes that organizations eliminating fragmented data sources and manual reconciliation gain faster, clearer financial insight. The real enterprise tax is not transaction processing. It is time spent proving that disconnected systems still agree after the fact.",
    },
    {
      title: "The close is still slowed by exception gravity.",
      body: "Oracle reports that 57% reduced days to close per cycle with modernized close tooling. The deeper signal is that confidence still arrives too late. Afenda moves upstream: keep state explainable while work is still moving, and downstream correction becomes less necessary.",
    },
    {
      title: "Traceability is now operating infrastructure.",
      body: "PwC's recent work in banking points to rising demand for source-to-report traceability and multi-year explainability. Once records cross systems, jurisdictions, or controls, explainability stops being an audit specialty and becomes operating infrastructure.",
    },
  ],

  continuityScopeCards: [
    {
      icon: Boxes,
      title: "Events that remain accountable",
      body: "A live event should not become a disconnected queue item. Afenda keeps operator action bound to consequence from intake through resolution.",
    },
    {
      icon: ArrowLeftRight,
      title: "Counterparty coordination that stays attached",
      body: "Outside counterparties should not live in a different story from the event they are blocking. Afenda keeps counterparty dependency visible beside the live queue.",
    },
    {
      icon: FileSearch,
      title: "Evidence that survives scrutiny",
      body: "Teams should not have to assemble proof after the fact. Afenda keeps attributable context close to the event so review does not begin from manual reconstruction.",
    },
    {
      icon: Workflow,
      title: "State transition with continuity",
      body: "What changed, why it changed, and what it changed into should remain visible through the same event chain. This is where ordinary systems begin splitting into parallel stories.",
    },
  ],

  fieldPracticeLines: [
    "A queue item should not become explainable only through chat memory, spreadsheets, or operator folklore.",
    "A counterparty escalation should preserve source, causality, and resulting state, not just create another disconnected ticket.",
    "A finance-ready event should still know which actor, counterparty dependency, and transition made it necessary.",
    "An exception should expose the broken continuity itself, not arrive as a generic error or late-stage adjustment.",
    "An audit trail should be a living structural property of the event, not a retrospective storytelling exercise.",
    "An operating record should become harder to dispute as it moves forward, not harder to understand.",
  ],

  accountableRecordCards: [
    {
      icon: ShieldAlert,
      title: "Contradiction is surfaced early",
      body: "If event continuity breaks, the system should surface the fracture near execution, before the organization absorbs it as delay, escalation drag, or policy leakage.",
    },
    {
      icon: ScanSearch,
      title: "Explainability stays attached",
      body: "Origin, movement, and consequence should remain queryable from the same truth chain. Review should not depend on memory, screenshots, or parallel exports.",
    },
    {
      icon: Fingerprint,
      title: "Attribution is structural",
      body: "A serious operating record must answer who acted, what changed, and under which event boundary. Afenda treats this as a design condition, not an optional enhancement.",
    },
    {
      icon: BookCheck,
      title: "Confidence is earned in motion",
      body: "The objective is not just a clean report at the end. It is an event record that becomes more defensible as it moves through the enterprise.",
    },
  ],

  bindingStructure: {
    cornerNotes: [
      {
        label: "Document",
        note: "The initiating artifact that introduces business intent, instruction, or claim.",
      },
      {
        label: "Entity",
        note: "The accountable subject carrying ownership, obligation, or operational position.",
      },
      {
        label: "Event",
        note: "The action boundary that creates change, movement, recognition, or exception.",
      },
      {
        label: "Transition",
        note: "The resulting state movement that must stay causally attached, not separately narrated.",
      },
    ],
    evidenceLines: [
      "One business record should not require multiple systems and human interpretation before it becomes believable.",
      "When document, entity, event, and transition split apart, reconciliation begins and confidence starts decaying.",
      "NexusCanon is designed to keep the record bound tightly enough that review can interrogate reality instead of reconstruct it.",
      "This is not a cosmetic data-model decision. It is the difference between systems that produce outputs and systems that can defend them.",
    ],
  },

  closingActionLinks: [
    { label: "Explore NexusCanon", to: MARKETING_PAGE_HREFS.canon },
    { label: "See the proof model", to: `${MARKETING_PAGE_HREFS.canon}#proof` },
  ],
} as const satisfies FlagshipPageEditorial
