import { cn } from '@afenda/ui/lib/utils'

import { DEFAULT_BRAND_NAME, logoSizeConfig } from './brand.constants'
import type { LogoWordmarkProps } from './brand.types'

export function LogoWordmark({
  size = 'md',
  className,
  brandName = DEFAULT_BRAND_NAME,
}: LogoWordmarkProps) {
  const classes = cn(
    'ui-brand-gradient-text bg-clip-text font-bold tracking-tight text-transparent',
    logoSizeConfig[size].text,
    className,
  )

  return <span className={classes}>{brandName}</span>
}
