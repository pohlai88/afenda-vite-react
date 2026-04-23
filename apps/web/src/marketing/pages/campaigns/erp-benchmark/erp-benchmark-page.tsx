import { useReducedMotion } from "framer-motion"

import { MarketingPageShell } from "../../../components"
import { erpBenchmarkEditorial } from "./erp-benchmark-page-editorial"
import { ErpBenchmarkPageSectionBenchmarkFrame } from "./erp-benchmark-page-section-benchmark-frame"
import { ErpBenchmarkPageSectionClosingCta } from "./erp-benchmark-page-section-closing-cta"
import { ErpBenchmarkPageSectionEvaluationModel } from "./erp-benchmark-page-section-evaluation-model"
import { ErpBenchmarkPageSectionIdentity } from "./erp-benchmark-page-section-identity"
import { ErpBenchmarkPageSectionPositioning } from "./erp-benchmark-page-section-positioning"

export default function ErpBenchmarkPage() {
  const reduceMotion = !!useReducedMotion()
  const { shell } = erpBenchmarkEditorial

  return (
    <MarketingPageShell title={shell.title} tagline={shell.tagline}>
      <ErpBenchmarkPageSectionIdentity reduceMotion={reduceMotion} />
      <ErpBenchmarkPageSectionBenchmarkFrame reduceMotion={reduceMotion} />
      <ErpBenchmarkPageSectionEvaluationModel reduceMotion={reduceMotion} />
      <ErpBenchmarkPageSectionPositioning reduceMotion={reduceMotion} />
      <ErpBenchmarkPageSectionClosingCta reduceMotion={reduceMotion} />
    </MarketingPageShell>
  )
}
