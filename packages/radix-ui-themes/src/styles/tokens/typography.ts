export const AFENDA_TYPOGRAPHY_SCALE = {
  xs: { size: '0.75rem', lineHeight: '1rem', weight: 400, tracking: 'normal' },
  sm: { size: '0.875rem', lineHeight: '1.25rem', weight: 400, tracking: 'normal' },
  base: { size: '1rem', lineHeight: '1.5rem', weight: 400, tracking: 'normal' },
  lg: { size: '1.125rem', lineHeight: '1.75rem', weight: 500, tracking: 'normal' },
  xl: { size: '1.25rem', lineHeight: '1.75rem', weight: 600, tracking: '-0.01em' },
  '2xl': { size: '1.5rem', lineHeight: '2rem', weight: 600, tracking: '-0.02em' },
  '3xl': { size: '1.875rem', lineHeight: '2.25rem', weight: 600, tracking: '-0.025em' },
  '4xl': { size: '2.25rem', lineHeight: '2.5rem', weight: 700, tracking: '-0.03em' },
} as const

export type AfendaTypographyKey = keyof typeof AFENDA_TYPOGRAPHY_SCALE
