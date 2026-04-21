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
 * Editorial content contract for the flagship landing page.
 * Keep copy grouped by section, preserve the stable exports consumed by the page,
 * and treat this module as the single source of truth for flagship narrative edits.
 */

type FlagshipNarrativeCopy = Readonly<{
  operatingLawsLead: string
  benchmarkDescription: string
  scopeDescription: string
  proofDescription: string
  canonDescription: string
  finalDescription: string
}>

type FlagshipTextPoint = Readonly<{
  title: string
  body: string
}>

type FlagshipIconPoint = FlagshipTextPoint &
  Readonly<{
    icon: LucideIcon
  }>

type FlagshipCanonFragment = Readonly<{
  label: string
  note: string
  desktopClassName: string
}>

type FlagshipLink = Readonly<{
  label: string
  to: string
}>

type FlagshipContentModel = Readonly<{
  copy: FlagshipNarrativeCopy
  heroLaws: readonly FlagshipTextPoint[]
  benchmarkProofPoints: readonly FlagshipTextPoint[]
  productScope: readonly FlagshipIconPoint[]
  practicePoints: readonly string[]
  proofModel: readonly FlagshipIconPoint[]
  canon: Readonly<{
    fragments: readonly FlagshipCanonFragment[]
    evidence: readonly string[]
  }>
  finalCallToActionLinks: readonly FlagshipLink[]
}>

const FLAGSHIP_CANON_HREF = MARKETING_PAGE_HREFS.canon

const FLAGSHIP_CONTENT = {
  // Long-form narrative copy
  copy: {
    operatingLawsLead:
      "Most systems can store activity. Far fewer can defend it. Afenda begins where ordinary software becomes expensive: when a record must survive scrutiny, causality, and consequence without narrative repair.",
    benchmarkDescription:
      "is built against the real failure line of enterprise software: fragmented records, manual reconciliation, delayed close, and weak source-to-report continuity. The problem is rarely transaction volume. It is truth breaking apart between document, operation, finance, and review.",
    scopeDescription:
      "does not treat finance, inventory, operations, and evidence as separate stories stitched together later. It enforces continuity where business consequence is created, so execution can move without letting record integrity decay.",
    proofDescription:
      "is designed around a harsher standard than workflow completion: whether the resulting state can still explain itself. If origin, causality, and continuity cannot survive forward motion, the record is not strong enough to trust.",
    canonDescription:
      "NexusCanon is the binding structure behind Afenda. Document, entity, event, and transition do not drift into parallel narratives. They remain attributable, queryable, and explainable as a single accountable business truth surface.",
    finalDescription:
      "is for operators done paying the hidden tax of fragmented systems: delay, adjustment, exception handling, audit drag, and reconstructed explanation. The objective is not prettier software. It is a record that can stand.",
  },

  // Hero laws
  heroLaws: [
    {
      title: "No record without origin",
      body: "Every consequential record must resolve to a source, an actor, and an attributable beginning. If origin is missing, trust is already compromised.",
    },
    {
      title: "No transition without cause",
      body: "State is not allowed to drift. Every movement must carry the event, logic, or business action that caused it, not as commentary but as structure.",
    },
    {
      title: "No truth without continuity",
      body: "A record is not credible if it fractures across finance, operations, and review. Truth must survive the next step without reconciliation theatre.",
    },
  ],

  // Benchmark proof points
  benchmarkProofPoints: [
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

  // Product scope
  productScope: [
    {
      icon: Boxes,
      title: "Operations that remain accountable",
      body: "Inventory movement, workflow execution, internal transfer, posting, and fulfillment should not create orphaned business states. Afenda keeps activity bound to consequence.",
    },
    {
      icon: ArrowLeftRight,
      title: "Finance that does not wait for cleanup",
      body: "Financial meaning should not be reconstructed in a later layer. It stays tied to the originating document, event path, and resulting state.",
    },
    {
      icon: FileSearch,
      title: "Evidence that survives scrutiny",
      body: "Teams should not have to assemble proof from fragments. Afenda keeps attributable context near the record so review does not begin from manual reconstruction.",
    },
    {
      icon: Workflow,
      title: "State transition with continuity",
      body: "What changed, why it changed, and what it changed into should remain visible through the same truth chain. This is where ordinary systems begin splitting into parallel stories.",
    },
  ],

  // Practice points
  practicePoints: [
    "A purchase flow should not end in a number that only becomes explainable later through spreadsheets, chat memory, or operator folklore.",
    "An internal transfer should preserve source, causality, and resulting position, not just update quantities and leave interpretation to humans.",
    "A financial posting should still know which document, event, and transition made it necessary.",
    "An exception should expose the broken continuity itself, not arrive as a generic error or late-stage adjustment.",
    "An audit trail should be a living structural property of the record, not a retrospective storytelling exercise.",
    "A business state should become harder to dispute as it moves forward, not harder to understand.",
  ],

  // Proof model
  proofModel: [
    {
      icon: ShieldAlert,
      title: "Contradiction is surfaced early",
      body: "If state continuity breaks, the system should surface the fracture near execution, before the organization absorbs it as delay, adjustment, or policy leakage.",
    },
    {
      icon: ScanSearch,
      title: "Explainability stays attached",
      body: "Origin, movement, and consequence should remain queryable from the same truth chain. Review should not depend on memory, screenshots, or parallel exports.",
    },
    {
      icon: Fingerprint,
      title: "Attribution is structural",
      body: "A serious record must answer who acted, what changed, and under which business event boundary. Afenda treats this as a design condition, not an optional enhancement.",
    },
    {
      icon: BookCheck,
      title: "Confidence is earned in motion",
      body: "The objective is not just a clean report at the end. It is a record that becomes more defensible as it moves through the enterprise.",
    },
  ],

  // NexusCanon fragments and evidence
  canon: {
    fragments: [
      {
        label: "Document",
        note: "The initiating artifact that introduces business intent, instruction, or claim.",
        desktopClassName: "left-[4%] top-[8%]",
      },
      {
        label: "Entity",
        note: "The accountable subject carrying ownership, obligation, or operational position.",
        desktopClassName: "right-[6%] top-[18%]",
      },
      {
        label: "Event",
        note: "The action boundary that creates change, movement, recognition, or exception.",
        desktopClassName: "left-[10%] bottom-[18%]",
      },
      {
        label: "Transition",
        note: "The resulting state movement that must stay causally attached, not separately narrated.",
        desktopClassName: "right-[3%] bottom-[8%]",
      },
    ],
    evidence: [
      "One business record should not require multiple systems and human interpretation before it becomes believable.",
      "When document, entity, event, and transition split apart, reconciliation begins and confidence starts decaying.",
      "NexusCanon is designed to keep the record bound tightly enough that review can interrogate reality instead of reconstruct it.",
      "This is not a cosmetic data-model decision. It is the difference between systems that produce outputs and systems that can defend them.",
    ],
  },

  // Final CTA links
  finalCallToActionLinks: [
    { label: "Explore NexusCanon", to: FLAGSHIP_CANON_HREF },
    { label: "See the proof model", to: `${FLAGSHIP_CANON_HREF}#proof` },
    {
      label: "Read the operating doctrine",
      to: `${FLAGSHIP_CANON_HREF}#doctrine`,
    },
  ],
} as const satisfies FlagshipContentModel

export const FLAGSHIP_COPY = FLAGSHIP_CONTENT.copy
export const HERO_OPERATING_LAWS = FLAGSHIP_CONTENT.heroLaws
export const BENCHMARK_POINTS = FLAGSHIP_CONTENT.benchmarkProofPoints
export const PRODUCT_SCOPE = FLAGSHIP_CONTENT.productScope
export const PRACTICE_POINTS = FLAGSHIP_CONTENT.practicePoints
export const PROOF_POINTS = FLAGSHIP_CONTENT.proofModel
export const CANON_FRAGMENTS = FLAGSHIP_CONTENT.canon.fragments
export const CANON_EVIDENCE_POINTS = FLAGSHIP_CONTENT.canon.evidence
export const FINAL_ACTION_LINKS = FLAGSHIP_CONTENT.finalCallToActionLinks
