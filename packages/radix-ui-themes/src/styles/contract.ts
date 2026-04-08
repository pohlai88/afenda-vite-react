import { AFENDA_THEME_DEFAULTS } from './afenda-theme-config.js'
import {
  AFENDA_MOTION_DURATIONS,
  AFENDA_MOTION_EASING,
} from './tokens/motion.js'
import { AFENDA_NEUTRAL_RAMP } from './tokens/neutrals.js'
import { AFENDA_RADIUS_SCALE } from './tokens/radius.js'
import { AFENDA_SHADOWS } from './tokens/shadows.js'
import {
  AFENDA_SPACING_SCALE,
  AFENDA_TO_RADIX_SPACE,
} from './tokens/spacing.js'
import { AFENDA_COLOR_MAPPING } from './tokens/colors.js'
import { AFENDA_TYPOGRAPHY_SCALE } from './tokens/typography.js'

/**
 * Documents the styling ownership boundary between the shared package and the
 * app host stylesheet. This keeps the package authoritative without pulling
 * Tailwind bootstrapping into the library.
 */
export const AFENDA_STYLE_OWNERSHIP = {
  packageOwns: [
    'Radix Themes provider defaults',
    'Afenda token scales and semantic color mappings',
    'Reusable primitive class recipes and variants',
    'Shared helper APIs for theme-aware components',
  ],
  appOwns: [
    'Tailwind v4 imports, plugins, and @source directives',
    'Product-shell semantic aliases and app-level utilities',
    'Route and feature-specific layout selectors',
    'Global host stylesheet orchestration in apps/web/src/index.css',
  ],
} as const

/**
 * Single exported contract for package consumers and internal contributors.
 * It ties together provider defaults, token families, and styling ownership.
 */
export const AFENDA_THEME_CONTRACT = {
  provider: AFENDA_THEME_DEFAULTS,
  tokenFamilies: {
    colors: AFENDA_COLOR_MAPPING,
    neutrals: AFENDA_NEUTRAL_RAMP,
    spacing: {
      scale: AFENDA_SPACING_SCALE,
      radixMapping: AFENDA_TO_RADIX_SPACE,
    },
    typography: AFENDA_TYPOGRAPHY_SCALE,
    radius: AFENDA_RADIUS_SCALE,
    shadows: AFENDA_SHADOWS,
    motion: {
      durations: AFENDA_MOTION_DURATIONS,
      easing: AFENDA_MOTION_EASING,
    },
  },
  ownership: AFENDA_STYLE_OWNERSHIP,
} as const

export type AfendaThemeContract = typeof AFENDA_THEME_CONTRACT
