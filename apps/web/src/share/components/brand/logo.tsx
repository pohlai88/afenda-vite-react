import { Link } from "react-router-dom"

import { cn } from "@afenda/shadcn-ui/lib/utils"
import { DEFAULT_BRAND_NAME } from "./brand.constants"
import type { LogoProps } from "./brand.types"
import { LogoMark } from "./logo-mark"
import { LogoWordmark } from "./logo-wordmark"

export function Logo({
  size = "md",
  showText = true,
  href = null,
  className,
  ariaLabel,
  brandName = DEFAULT_BRAND_NAME,
  logoUrl,
  markFallback,
}: LogoProps) {
  const containerClasses = cn("inline-flex items-center gap-2", className)
  const content = (
    <>
      <LogoMark
        size={size}
        brandName={brandName}
        logoUrl={logoUrl}
        markFallback={markFallback}
      />
      {showText && <LogoWordmark size={size} brandName={brandName} />}
    </>
  )

  const label = ariaLabel ?? (showText ? brandName : `${brandName} logo`)

  if (href) {
    return (
      <Link to={href} className={containerClasses} aria-label={label}>
        {content}
      </Link>
    )
  }

  return (
    <div className={containerClasses} aria-label={label}>
      {content}
    </div>
  )
}
