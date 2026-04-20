import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/design-system/ui-primitives"
import { motion, useReducedMotion } from "framer-motion"
import {
  Database,
  Eye,
  LockKeyhole,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"

import {
  MarketingCallToActionPanel,
  MarketingPageSection,
  MarketingPageShell,
  MarketingSectionHeading,
  getMarketingReveal,
} from "../_components"
import { MARKETING_PAGE_HREFS } from "../../marketing-page-registry"

type PrivacySurface = {
  readonly title: string
  readonly body: string
  readonly icon: LucideIcon
}

const PRIVACY_SURFACES: readonly PrivacySurface[] = [
  {
    title: "Purpose-bound data handling",
    body: "Privacy posture starts with making collection and processing legible against a real business purpose.",
    icon: Database,
  },
  {
    title: "Visible access boundaries",
    body: "Teams should understand who can see sensitive information and under what operating responsibility.",
    icon: Eye,
  },
  {
    title: "Protection by control",
    body: "Security promises should map to clear control surfaces instead of vague reassurance copy.",
    icon: LockKeyhole,
  },
  {
    title: "Review readiness",
    body: "A privacy page should help readers understand governance posture before they need to escalate into audit or legal review.",
    icon: ShieldCheck,
  },
] as const

export default function PrivacyPolicyPage() {
  const reduceMotion = !!useReducedMotion()

  return (
    <MarketingPageShell
      badges={["Legal and Trust", "Privacy Policy"]}
      tagline="Privacy posture, control visibility, and data handling intent"
    >
      <MarketingPageSection
        className="relative overflow-hidden border-b border-border/70"
        containerClassName="pb-16 pt-28 md:pb-20 lg:pb-24 lg:pt-32"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/8" />
        <motion.div className="relative" {...getMarketingReveal(reduceMotion)}>
          <MarketingSectionHeading
            as="h1"
            kicker="Legal"
            title="Privacy should read as a control model, not a wall of disclaimers."
            description={
              <>
                This page presents the public privacy stance in the same system
                language as the rest of the marketing tree: clear scope, clear
                responsibility, and clear governance intent.
              </>
            }
            titleClassName="max-w-5xl text-[clamp(3rem,8vw,5.8rem)] leading-[0.9] tracking-[-0.07em]"
          />
        </motion.div>
      </MarketingPageSection>

      <MarketingPageSection className="border-b border-border/70">
        <motion.div {...getMarketingReveal(reduceMotion)}>
          <MarketingSectionHeading
            kicker="Privacy Posture"
            title="The page explains how data responsibility is framed before policy detail expands."
            description={
              <>
                Legal surfaces need readable structure because trust is lost
                when policy content becomes impossible to scan under pressure.
              </>
            }
          />
        </motion.div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {PRIVACY_SURFACES.map(({ title, body, icon: Icon }, index) => (
            <motion.div
              key={title}
              {...getMarketingReveal(reduceMotion, index * 0.05)}
            >
              <Card className="h-full border-border/70 bg-card/90 shadow-sm">
                <CardHeader className="gap-4">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10">
                    <Icon aria-hidden="true" className="size-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl tracking-[-0.03em]">
                    {title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-7 text-pretty">
                    {body}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </MarketingPageSection>

      <MarketingPageSection>
        <motion.div {...getMarketingReveal(reduceMotion)}>
          <MarketingCallToActionPanel
            kicker="Privacy CTA"
            title="Follow the privacy posture into PDPA and trust governance."
            description={
              <>
                Privacy pages should help the reader reach the next relevant
                control surface instead of stopping at a static legal dead end.
              </>
            }
            links={[
              { label: "Open PDPA", to: MARKETING_PAGE_HREFS.pdpa },
              {
                label: "Visit Trust Center",
                to: MARKETING_PAGE_HREFS.trustCenter,
                variant: "outline",
              },
            ]}
            aside={
              <>
                This is a public legal surface, not a full contract. It is
                structured to keep the policy route coherent inside the broader
                marketing system.
              </>
            }
          />
        </motion.div>
      </MarketingPageSection>
    </MarketingPageShell>
  )
}
