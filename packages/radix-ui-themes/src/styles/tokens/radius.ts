export const AFENDA_RADIUS_SCALE = {
  sm: 'calc(var(--radius) * 0.75)',
  md: 'calc(var(--radius) * 0.875)',
  lg: 'var(--radius)',
  xl: 'calc(var(--radius) * 1.5)',
  '2xl': 'calc(var(--radius) * 2)',
} as const

export type AfendaRadiusKey = keyof typeof AFENDA_RADIUS_SCALE
