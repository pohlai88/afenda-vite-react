import { cn } from "@afenda/shadcn-ui/lib/utils"

import { DEFAULT_BRAND_NAME, logoSizeConfig } from "./brand.constants"
import type { LogoMarkProps } from "./brand.types"

export function LogoMark({
  size = "md",
  className,
  brandName = DEFAULT_BRAND_NAME,
  logoUrl,
  markFallback,
}: LogoMarkProps) {
  const sizeConfig = logoSizeConfig[size]
  const containerClasses = cn(
    "flex items-center justify-center shadow-sm",
    sizeConfig.mark,
    className,
    logoUrl
      ? "overflow-hidden border border-border bg-background"
      : "ui-brand-gradient"
  )

  if (logoUrl) {
    return (
      <div className={containerClasses}>
        <img
          src={logoUrl}
          alt={brandName || "Logo"}
          width={sizeConfig.imageSize}
          height={sizeConfig.imageSize}
          className="h-full w-full object-contain"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
        />
      </div>
    )
  }

  return (
    <div className={containerClasses} aria-hidden="true">
      <span className="font-bold text-white">
        {markFallback ?? brandName.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}
