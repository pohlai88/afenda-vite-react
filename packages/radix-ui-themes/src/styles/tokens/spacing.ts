/**
 * Afenda spacing scale bridge for Radix Themes.
 *
 * Radix Themes uses a numeric spacing scale (1–9) that maps to CSS custom
 * properties (`--space-1` through `--space-9`). This module documents the
 * Afenda design system spacing scale (4px base, per docs/DESIGN_SYSTEM.md
 * §5.1) and its correspondence to Radix space steps.
 *
 * Radix defaults (at 100% scaling):
 *   1 = 4px, 2 = 8px, 3 = 12px, 4 = 16px, 5 = 24px,
 *   6 = 32px, 7 = 40px, 8 = 48px, 9 = 64px
 */

export const AFENDA_SPACING_SCALE = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80] as const

export type AfendaSpacingStep = (typeof AFENDA_SPACING_SCALE)[number]

/**
 * Maps Afenda spacing values (px) to the nearest Radix Themes space step.
 * Values without a direct Radix equivalent map to `null`.
 */
export const AFENDA_TO_RADIX_SPACE: Record<AfendaSpacingStep, number | null> = {
  4: 1,
  8: 2,
  12: 3,
  16: 4,
  20: null,
  24: 5,
  32: 6,
  40: 7,
  48: 8,
  64: 9,
  80: null,
}
