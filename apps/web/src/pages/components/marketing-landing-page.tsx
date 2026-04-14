import { useTranslation } from "react-i18next"

import { MarketingExperiencePreview } from "./marketing-experience-preview"
import { MarketingIndexCssAtlas } from "./marketing-index-css-atlas"
import { MarketingLandingHero } from "./marketing-landing-hero"
import { MarketingLandingTokenPlayground } from "./marketing-landing-token-playground"

export default function MarketingLandingPage() {
  const { t } = useTranslation("shell")

  return (
    <>
      <a
        className="sr-only inline-flex rounded-md bg-background px-4 py-2 text-sm font-medium text-foreground shadow-lg focus-ring focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100"
        href="#marketing-landing-main"
      >
        {t("marketing.landing.skip_to_main")}
      </a>

      <main
        className="mx-auto w-full max-w-7xl scroll-mt-4 px-4 py-8 text-foreground sm:px-6 lg:px-8"
        id="marketing-landing-main"
        tabIndex={-1}
      >
        <div className="ui-stack-relaxed">
          <MarketingLandingHero />
          <MarketingIndexCssAtlas />
          <MarketingExperiencePreview />
          <MarketingLandingTokenPlayground />
        </div>
      </main>
    </>
  )
}
