import { lazy, Suspense } from "react"

import { isRandomHomeEnabled } from "./marketing.config"
import { MarketingLoadingFallback } from "./marketing-loading-fallback"
import MarketingRandomHome from "./marketing-random-home"

const FlagshipPage = lazy(
  () => import("./pages/landing/flagship/afenda-flagship-page")
)

/** Index route: random landing rotation or flagship hero. */
export function MarketingConfiguredHome() {
  if (isRandomHomeEnabled()) {
    return <MarketingRandomHome />
  }

  return (
    <Suspense fallback={<MarketingLoadingFallback />}>
      <FlagshipPage />
    </Suspense>
  )
}
