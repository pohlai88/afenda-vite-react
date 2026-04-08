export const AFENDA_SHADOWS = {
  xs: '0 1px 2px oklch(0% 0 0 / 0.06)',
  sm: '0 1px 3px oklch(0% 0 0 / 0.08), 0 1px 2px oklch(0% 0 0 / 0.04)',
  md: '0 4px 10px oklch(0% 0 0 / 0.12), 0 2px 6px oklch(0% 0 0 / 0.08)',
  lg: '0 12px 24px oklch(0% 0 0 / 0.16), 0 6px 12px oklch(0% 0 0 / 0.1)',
  xl: '0 20px 40px oklch(0% 0 0 / 0.2), 0 10px 20px oklch(0% 0 0 / 0.12)',
} as const

export type AfendaShadowKey = keyof typeof AFENDA_SHADOWS
