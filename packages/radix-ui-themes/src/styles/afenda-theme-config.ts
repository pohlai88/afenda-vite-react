import type {
  AfendaAccentColor,
  AfendaGrayColor,
  AfendaRadius,
} from '../props/index.js'

/**
 * Afenda default theme configuration for Radix Themes.
 *
 * These values are applied to the root `<Theme>` provider when consumers
 * use `<AfendaTheme>` without overriding individual props. They align with
 * the Afenda Design System (docs/DESIGN_SYSTEM.md) and Brand Guidelines.
 *
 * Radix Themes accent "indigo" maps well to the Afenda Projects domain
 * color (oklch 55% 0.17 265 ≈ indigo). Gray "slate" provides the warm
 * neutral tone documented in the design system (hue ~260).
 */

export interface AfendaThemeConfig {
  readonly accentColor: AfendaAccentColor
  readonly grayColor: AfendaGrayColor
  readonly radius: AfendaRadius
  readonly scaling: '90%' | '95%' | '100%' | '105%' | '110%'
  readonly appearance: 'inherit' | 'light' | 'dark'
  readonly panelBackground: 'solid' | 'translucent'
  readonly hasBackground: boolean
}

export const AFENDA_THEME_DEFAULTS = {
  accentColor: 'indigo',
  grayColor: 'slate',
  radius: 'medium',
  scaling: '100%',
  appearance: 'inherit',
  panelBackground: 'translucent',
  hasBackground: true,
} as const satisfies AfendaThemeConfig
