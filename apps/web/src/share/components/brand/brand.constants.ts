import type { LogoSize } from './brand.types'

export const DEFAULT_BRAND_NAME = 'Afenda'

export interface LogoConfig {
  mark: string
  text: string
  imageSize: number
}

export const logoSizeConfig: Record<LogoSize, LogoConfig> = {
  sm: {
    mark: 'h-7 w-7 rounded-xl',
    text: 'text-base',
    imageSize: 28,
  },
  md: {
    mark: 'h-8 w-8 rounded-xl',
    text: 'text-lg',
    imageSize: 32,
  },
  lg: {
    mark: 'h-10 w-10 rounded-2xl',
    text: 'text-2xl',
    imageSize: 40,
  },
}
