import type { ReactNode } from "react"

import { ArrowRight } from "lucide-react"
import { NavLink } from "react-router-dom"

import { Badge, Button } from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"
import {
  MARKETING_PAGE_HREFS,
  marketingPageDirectoryNavigation,
  marketingShellNavigation,
} from "../../marketing-page-registry"

const DEFAULT_BADGES = [
  "Finance, Inventory, Operations",
  "Benchmark-Aligned",
] as const

const MARKETING_NAV_LINK_BASE_CLASS_NAME = cn(
  "marketing-nav-link",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
)

function getMarketingNavLinkClassName(isActive: boolean) {
  return cn(
    MARKETING_NAV_LINK_BASE_CLASS_NAME,
    isActive
      ? "border-primary/30 bg-primary/10 text-foreground"
      : "border-border/70 bg-background/70 text-muted-foreground hover:text-foreground"
  )
}

function MarketingAmbientLayer() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.12]">
        <div className="flagship-grid absolute inset-0" />
      </div>
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.06]">
        <div className="flagship-grain absolute inset-0" />
      </div>
    </>
  )
}

export interface MarketingPageShellProps {
  readonly children: ReactNode
  readonly mainId?: string
  readonly title?: string
  readonly tagline?: string
  readonly badges?: readonly string[]
  readonly navigationItems?: readonly {
    readonly label: string
    readonly to: string
  }[]
  readonly footerNavigationItems?: readonly {
    readonly label: string
    readonly to: string
  }[]
  readonly className?: string
  readonly mainClassName?: string
}

export function MarketingPageShell({
  children,
  mainId = "main-content",
  title = "Afenda ERP",
  tagline = "Business ERP with proof-led operations",
  badges = DEFAULT_BADGES,
  navigationItems = marketingShellNavigation,
  footerNavigationItems = marketingPageDirectoryNavigation,
  className,
  mainClassName,
}: MarketingPageShellProps) {
  const mobileNavigationItems =
    footerNavigationItems.length > 0 ? footerNavigationItems : navigationItems

  return (
    <div
      className={cn(
        "relative min-h-dvh overflow-x-hidden bg-background text-foreground selection:bg-primary selection:text-primary-foreground",
        className
      )}
    >
      <a className="marketing-skip-link" href={`#${mainId}`}>
        Skip to content
      </a>

      <MarketingAmbientLayer />

      <header className="marketing-safe-rail marketing-shell-header">
        <div className="marketing-container marketing-shell-header-row">
          <NavLink
            to={MARKETING_PAGE_HREFS.flagship}
            className="flex min-w-0 items-center gap-4 rounded-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
          >
            <div className="marketing-shell-brand-mark">
              <span translate="no">A</span>
            </div>
            <div className="min-w-0">
              <div
                className="text-sm font-semibold tracking-[-0.02em]"
                translate="no"
              >
                {title}
              </div>
              <div className="text-xs text-muted-foreground">{tagline}</div>
            </div>
          </NavLink>

          <div className="flex items-center gap-3">
            {navigationItems.length > 0 ? (
              <nav
                aria-label="Marketing navigation"
                className="hidden items-center gap-2 xl:flex"
              >
                {navigationItems.map((item) => (
                  <NavLink
                    key={`${item.label}:${item.to}`}
                    to={item.to}
                    className={({ isActive }) =>
                      getMarketingNavLinkClassName(isActive)
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            ) : null}

            {badges.length > 0 ? (
              <div className="hidden items-center gap-3 md:flex xl:hidden">
                {badges.map((badge) => (
                  <Badge
                    key={badge}
                    variant="outline"
                    className="marketing-shell-badge"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            ) : null}

            <Button asChild size="sm" className="touch-manipulation">
              <NavLink to="/login">
                Enter Workspace
                <ArrowRight aria-hidden="true" className="size-4" />
              </NavLink>
            </Button>
          </div>
        </div>

        {mobileNavigationItems.length > 0 ? (
          <div className="border-t border-border/60 xl:hidden">
            <nav
              aria-label="Marketing page directory"
              className="marketing-container marketing-nav-scroller marketing-shell-nav-row"
            >
              {mobileNavigationItems.map((item) => (
                <NavLink
                  key={`mobile:${item.label}:${item.to}`}
                  to={item.to}
                  className={({ isActive }) =>
                    cn("shrink-0", getMarketingNavLinkClassName(isActive))
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        ) : null}
      </header>

      <main
        id={mainId}
        className={cn("marketing-shell-main relative z-10", mainClassName)}
      >
        {children}
      </main>

      {footerNavigationItems.length > 0 ? (
        <footer className="relative z-10 border-t border-border/60 bg-background/70">
          <div className="marketing-container marketing-safe-b marketing-shell-footer-row">
            <div className="max-w-2xl">
              <div className="text-sm font-semibold tracking-[-0.02em] text-foreground">
                Flagship is the marketing entrypoint.
              </div>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Product, company, campaign, legal, and regional surfaces stay
                wired to the same route system so the public marketing tree
                reads as one product story instead of isolated pages.
              </p>
            </div>

            <nav
              aria-label="Marketing footer navigation"
              className="flex flex-wrap gap-2"
            >
              {footerNavigationItems.map((item) => (
                <NavLink
                  key={`footer:${item.label}:${item.to}`}
                  to={item.to}
                  className={({ isActive }) =>
                    getMarketingNavLinkClassName(isActive)
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </footer>
      ) : null}
    </div>
  )
}
