/**
 * Warm neutral ramp (OKLCH) aligned with docs/DESIGN_SYSTEM.md.
 * Hue target is around 260 for ERP readability.
 */
export const AFENDA_NEUTRAL_RAMP = {
  1: 'oklch(99% 0.003 260)',
  2: 'oklch(97% 0.005 260)',
  3: 'oklch(94% 0.008 260)',
  4: 'oklch(90% 0.01 260)',
  5: 'oklch(80% 0.01 260)',
  6: 'oklch(55% 0.01 260)',
  7: 'oklch(40% 0.012 260)',
  8: 'oklch(25% 0.015 260)',
  9: 'oklch(18% 0.015 260)',
  10: 'oklch(14% 0.012 260)',
  11: 'oklch(10% 0.01 260)',
  12: 'oklch(6% 0.008 260)',
} as const

export type AfendaNeutralStep = keyof typeof AFENDA_NEUTRAL_RAMP
