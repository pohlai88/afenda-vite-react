import {
  AFENDA_COLOR_MAPPING,
  type AfendaDomainColor,
  type AfendaStatusColor,
} from '../styles/tokens/colors.js'

/**
 * Afenda color prop definitions mapping to Radix Themes accent colors.
 *
 * Radix Themes ships 30 accent colors from @radix-ui/colors. This module
 * defines the subset used across Afenda, plus semantic mappings from
 * Afenda domain/status roles to specific Radix color scales.
 *
 * See docs/DESIGN_SYSTEM.md §3.2 for the full Afenda palette.
 */

export const AFENDA_ACCENT_COLORS = [
  'tomato',
  'red',
  'ruby',
  'crimson',
  'pink',
  'plum',
  'purple',
  'violet',
  'iris',
  'indigo',
  'blue',
  'cyan',
  'teal',
  'jade',
  'green',
  'grass',
  'lime',
  'mint',
  'sky',
  'yellow',
  'amber',
  'orange',
  'brown',
  'bronze',
  'gold',
  'gray',
] as const

export type AfendaAccentColor = (typeof AFENDA_ACCENT_COLORS)[number]

export const AFENDA_GRAY_COLORS = [
  'auto',
  'gray',
  'mauve',
  'slate',
  'sage',
  'olive',
  'sand',
] as const

export type AfendaGrayColor = (typeof AFENDA_GRAY_COLORS)[number]

/**
 * Maps Afenda ERP domain roles to Radix accent color scales.
 * These are the recommended accent colors when rendering domain-specific UI.
 */
export const DOMAIN_COLOR_MAP = {
  finance: AFENDA_COLOR_MAPPING.domain.finance.radixScale,
  inventory: AFENDA_COLOR_MAPPING.domain.inventory.radixScale,
  hr: AFENDA_COLOR_MAPPING.domain.hr.radixScale,
  sales: AFENDA_COLOR_MAPPING.domain.sales.radixScale,
  manufacturing: AFENDA_COLOR_MAPPING.domain.manufacturing.radixScale,
  projects: AFENDA_COLOR_MAPPING.domain.projects.radixScale,
  reporting: AFENDA_COLOR_MAPPING.domain.reporting.radixScale,
  masterData: AFENDA_COLOR_MAPPING.domain.masterData.radixScale,
} as const satisfies Record<AfendaDomainColor, AfendaAccentColor>

export type AfendaDomain = AfendaDomainColor

/**
 * Maps Afenda status semantics to Radix accent color scales.
 */
export const STATUS_COLOR_MAP = {
  success: AFENDA_COLOR_MAPPING.status.success.radixScale,
  warning: AFENDA_COLOR_MAPPING.status.warning.radixScale,
  destructive: AFENDA_COLOR_MAPPING.status.destructive.radixScale,
  info: AFENDA_COLOR_MAPPING.status.info.radixScale,
} as const satisfies Record<AfendaStatusColor, AfendaAccentColor>

export type AfendaStatus = AfendaStatusColor
