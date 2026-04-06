import type { ReactNode } from 'react'

export type LogoSize = 'sm' | 'md' | 'lg'

export interface BrandIdentityProps {
  brandName?: string
  logoUrl?: string | null
  markFallback?: ReactNode
}

export interface BaseLogoProps {
  size?: LogoSize
  className?: string
}

export interface LogoMarkProps extends BrandIdentityProps, BaseLogoProps {}

export interface LogoWordmarkProps extends BaseLogoProps {
  brandName?: string
}

export interface LogoProps extends BrandIdentityProps, BaseLogoProps {
  showText?: boolean
  href?: string | null
  ariaLabel?: string
}
