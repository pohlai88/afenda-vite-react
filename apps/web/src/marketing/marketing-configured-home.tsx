import { lazy, Suspense } from "react"

import { isRandomHomeEnabled } from "./marketing.config"
import { MarketingLoadingFallback } from "./marketing-loading-fallback"
import { loadMarketingFlagshipPage } from "./marketing-page-registry"
import MarketingRandomHome from "./marketing-random-home"

const FlagshipPage = lazy(loadMarketingFlagshipPage)

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
