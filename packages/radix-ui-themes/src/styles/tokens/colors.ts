/**
 * Afenda ↔ Radix Themes color scale mapping.
 *
 * Radix Themes provides 30 color scales via @radix-ui/colors, each with
 * 12 steps (1–12) plus alpha variants and functional tokens (surface,
 * indicator, track, contrast).
 *
 * This module maps Afenda's domain and status colors (defined in OKLCH in
 * docs/DESIGN_SYSTEM.md §3.2) to the closest Radix color scales. This
 * mapping is used by the theme config and component wrappers to ensure
 * semantic consistency.
 *
 * For CSS-level token overrides (e.g., remapping `--indigo-9` to a custom
 * brand color), add a companion CSS file imported after
 * `@radix-ui/themes/styles.css`.
 */

export const AFENDA_COLOR_MAPPING = {
  domain: {
    finance: { radixScale: 'jade', oklch: 'oklch(58% 0.17 155)' },
    inventory: { radixScale: 'blue', oklch: 'oklch(58% 0.15 230)' },
    hr: { radixScale: 'violet', oklch: 'oklch(55% 0.18 290)' },
    sales: { radixScale: 'orange', oklch: 'oklch(65% 0.17 55)' },
    manufacturing: { radixScale: 'amber', oklch: 'oklch(70% 0.16 75)' },
    projects: { radixScale: 'indigo', oklch: 'oklch(55% 0.17 265)' },
    reporting: { radixScale: 'teal', oklch: 'oklch(58% 0.14 175)' },
    masterData: { radixScale: 'ruby', oklch: 'oklch(62% 0.19 15)' },
  },
  status: {
    success: { radixScale: 'green', oklch: 'oklch(62% 0.17 150)' },
    warning: { radixScale: 'amber', oklch: 'oklch(75% 0.16 75)' },
    destructive: { radixScale: 'red', oklch: 'oklch(58% 0.22 25)' },
    info: { radixScale: 'blue', oklch: 'oklch(62% 0.14 240)' },
  },
} as const

export type AfendaDomainColor = keyof typeof AFENDA_COLOR_MAPPING.domain
export type AfendaStatusColor = keyof typeof AFENDA_COLOR_MAPPING.status
