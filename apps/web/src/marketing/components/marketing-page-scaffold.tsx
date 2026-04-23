import type { ReactNode } from "react"

import {
  MarketingPageShell,
  type MarketingPageShellProps,
} from "./marketing-page-shell"

export interface MarketingPageScaffoldProps extends Omit<
  MarketingPageShellProps,
  "children"
> {
  readonly hero: ReactNode
  readonly sections?: readonly ReactNode[]
  readonly footer?: ReactNode
}

/**
 * Structural-only page scaffold for the common marketing route shape:
 * hero, ordered sections, then a closing footer block.
 */
export function MarketingPageScaffold({
  hero,
  sections = [],
  footer,
  ...shellProps
}: MarketingPageScaffoldProps) {
  return (
    <MarketingPageShell {...shellProps}>
      {hero}
      {sections}
      {footer}
    </MarketingPageShell>
  )
}
