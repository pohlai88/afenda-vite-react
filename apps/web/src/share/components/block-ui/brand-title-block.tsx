import { cn } from "@afenda/shadcn-ui/lib/utils"

import { Logo } from "../brand"
import { ShellTitle } from "../shell-ui"

export interface BrandTitleBlockProps {
  className?: string
  logoClassName?: string
  titleClassName?: string
  fallbackTitle?: string
  brandName?: string
  logoUrl?: string | null
  logoHref?: string | null
}

export function BrandTitleBlock({
  className,
  logoClassName,
  titleClassName,
  fallbackTitle,
  brandName,
  logoUrl,
  logoHref = null,
}: BrandTitleBlockProps) {
  const containerClasses = cn("flex min-w-0 items-center gap-3", className)

  return (
    <div className={containerClasses}>
      <Logo
        className={logoClassName}
        brandName={brandName}
        logoUrl={logoUrl}
        href={logoHref}
      />
      <div className="min-w-0 flex-1">
        <ShellTitle className={titleClassName} fallback={fallbackTitle} />
      </div>
    </div>
  )
}
