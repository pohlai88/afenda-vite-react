/**
 * Shared prop definitions aligned with Radix Themes component APIs.
 *
 * These types mirror the upstream Radix Themes prop enums so that
 * Afenda wrapper components can constrain and default them consistently.
 */

export const AFENDA_SIZES = ['1', '2', '3', '4'] as const
export type AfendaSize = (typeof AFENDA_SIZES)[number]

export const AFENDA_RADII = ['none', 'small', 'medium', 'large', 'full'] as const
export type AfendaRadius = (typeof AFENDA_RADII)[number]

export const AFENDA_VARIANTS = [
  'classic',
  'solid',
  'soft',
  'surface',
  'outline',
  'ghost',
] as const
export type AfendaVariant = (typeof AFENDA_VARIANTS)[number]

export const AFENDA_WEIGHTS = ['light', 'regular', 'medium', 'bold'] as const
export type AfendaWeight = (typeof AFENDA_WEIGHTS)[number]
