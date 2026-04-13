/**
 * TOKEN SOURCE
 *
 * Canonical source of token values.
 */

import { parseThemeTokenSource } from './token-contract'
import { colorTokenValues } from './token-constants'
import type { ColorToken, ThemeMode } from './token-constants'

type ColorLayerPartial = Readonly<Partial<Record<ColorToken, string>>>

type ThemeColorLayerPartials = Readonly<{
  primitive: Readonly<Record<ThemeMode, ColorLayerPartial>>
  derived: Readonly<Record<ThemeMode, ColorLayerPartial>>
}>

export function fullColorRecord(
  partial: ColorLayerPartial,
  merged: ColorLayerPartial,
): Record<ColorToken, string> {
  const out = {} as Record<ColorToken, string>

  for (const key of colorTokenValues) {
    const value = partial[key] ?? merged[key]
    if (value === undefined) {
      throw new Error(`Missing color token: ${key}`)
    }
    out[key] = value
  }

  return out
}

const themeColorLayersPartial = {
  primitive: {
    light: {
      background: 'oklch(98.8% 0.006 185)',
      foreground: 'oklch(22% 0.018 210)',
      card: 'oklch(100% 0 0)',
      'card-foreground': 'oklch(22% 0.018 210)',
      popover: 'oklch(100% 0 0)',
      'popover-foreground': 'oklch(22% 0.018 210)',

      primary: 'oklch(47% 0.135 185)',
      'primary-foreground': 'oklch(99% 0.004 185)',
      secondary: 'oklch(94% 0.025 160)',
      'secondary-foreground': 'oklch(28% 0.045 170)',
      muted: 'oklch(95.5% 0.01 205)',
      'muted-foreground': 'oklch(48% 0.018 215)',
      accent: 'oklch(70% 0.145 34)',
      'accent-foreground': 'oklch(17% 0.02 35)',
      destructive: 'oklch(57% 0.22 25)',
      'destructive-foreground': 'oklch(99% 0.004 25)',

      border: 'oklch(89.5% 0.012 205)',
      input: 'oklch(89.5% 0.012 205)',
      ring: 'oklch(47% 0.135 185)',
      'ring-offset': 'oklch(98.8% 0.006 185)',

      'chart-1': 'oklch(55% 0.13 185)',
      'chart-2': 'oklch(62% 0.18 330)',
      'chart-3': 'oklch(70% 0.15 75)',
      'chart-4': 'oklch(58% 0.14 240)',
      'chart-5': 'oklch(60% 0.14 145)',

      sidebar: 'oklch(97% 0.012 185)',
      'sidebar-foreground': 'oklch(24% 0.02 210)',
      'sidebar-primary': 'oklch(47% 0.135 185)',
      'sidebar-primary-foreground': 'oklch(99% 0.004 185)',
      'sidebar-accent': 'oklch(92% 0.022 170)',
      'sidebar-accent-foreground': 'oklch(25% 0.04 175)',
      'sidebar-border': 'oklch(88.5% 0.014 205)',
      'sidebar-ring': 'oklch(47% 0.135 185)',

      success: 'oklch(60% 0.16 150)',
      'success-foreground': 'oklch(99% 0.004 150)',
      warning: 'oklch(73% 0.15 80)',
      'warning-foreground': 'oklch(18% 0.03 80)',
      info: 'oklch(55% 0.14 230)',
      'info-foreground': 'oklch(99% 0.004 230)',
    },

    dark: {
      background: 'oklch(13.5% 0.012 205)',
      foreground: 'oklch(96% 0.006 185)',
      card: 'oklch(18% 0.015 205)',
      'card-foreground': 'oklch(96% 0.006 185)',
      popover: 'oklch(18% 0.015 205)',
      'popover-foreground': 'oklch(96% 0.006 185)',

      primary: 'oklch(70% 0.12 185)',
      'primary-foreground': 'oklch(12% 0.02 195)',
      secondary: 'oklch(24% 0.035 165)',
      'secondary-foreground': 'oklch(94% 0.008 165)',
      muted: 'oklch(22% 0.018 210)',
      'muted-foreground': 'oklch(74% 0.014 205)',
      accent: 'oklch(72% 0.15 34)',
      'accent-foreground': 'oklch(14% 0.02 35)',
      destructive: 'oklch(62% 0.18 25)',
      'destructive-foreground': 'oklch(12% 0.018 25)',

      border: 'oklch(27% 0.018 210)',
      input: 'oklch(27% 0.018 210)',
      ring: 'oklch(70% 0.12 185)',
      'ring-offset': 'oklch(13.5% 0.012 205)',

      'chart-1': 'oklch(72% 0.12 205)',
      'chart-2': 'oklch(74% 0.15 330)',
      'chart-3': 'oklch(78% 0.14 80)',
      'chart-4': 'oklch(72% 0.12 240)',
      'chart-5': 'oklch(72% 0.13 145)',

      sidebar: 'oklch(11.5% 0.012 205)',
      'sidebar-foreground': 'oklch(94% 0.008 185)',
      'sidebar-primary': 'oklch(70% 0.12 185)',
      'sidebar-primary-foreground': 'oklch(12% 0.02 195)',
      'sidebar-accent': 'oklch(22% 0.03 170)',
      'sidebar-accent-foreground': 'oklch(94% 0.008 165)',
      'sidebar-border': 'oklch(25% 0.017 210)',
      'sidebar-ring': 'oklch(70% 0.12 185)',

      success: 'oklch(70% 0.14 150)',
      'success-foreground': 'oklch(12% 0.02 150)',
      warning: 'oklch(78% 0.15 80)',
      'warning-foreground': 'oklch(15% 0.03 80)',
      info: 'oklch(70% 0.12 230)',
      'info-foreground': 'oklch(12% 0.02 230)',
    },
  },

  derived: {
    light: {
      'primary-50':
        'color-mix(in oklab, var(--color-primary) 8%, var(--color-background))',
      'primary-100':
        'color-mix(in oklab, var(--color-primary) 15%, var(--color-background))',
      'primary-200':
        'color-mix(in oklab, var(--color-primary) 26%, var(--color-background))',
      'primary-300':
        'color-mix(in oklab, var(--color-primary) 40%, var(--color-background))',
      'primary-400':
        'color-mix(in oklab, var(--color-primary) 65%, var(--color-background))',
      'primary-500': 'var(--color-primary)',
      'primary-600':
        'color-mix(in oklab, var(--color-primary) 88%, var(--color-foreground))',
      'primary-700':
        'color-mix(in oklab, var(--color-primary) 74%, var(--color-foreground))',
      'primary-800':
        'color-mix(in oklab, var(--color-primary) 60%, var(--color-foreground))',
      'primary-900':
        'color-mix(in oklab, var(--color-primary) 48%, var(--color-foreground))',
      'primary-950':
        'color-mix(in oklab, var(--color-primary) 36%, var(--color-foreground))',

      surface: 'var(--color-background)',
      'surface-foreground': 'var(--color-foreground)',
      code: 'color-mix(in oklab, var(--color-muted) 80%, var(--color-background))',
      'code-foreground': 'var(--color-foreground)',
      'code-highlight':
        'color-mix(in oklab, var(--color-primary) 10%, var(--color-background))',
      'code-number': 'var(--color-muted-foreground)',
      selection: 'var(--color-primary-100)',
      'selection-foreground': 'var(--color-primary-foreground)',

      'surface-hover':
        'color-mix(in oklab, var(--color-foreground) 4%, var(--color-background))',
      'surface-active':
        'color-mix(in oklab, var(--color-foreground) 7%, var(--color-background))',
      'surface-selected':
        'color-mix(in oklab, var(--color-primary) 12%, var(--color-background))',
      'surface-disabled':
        'color-mix(in oklab, var(--color-foreground) 3%, var(--color-background))',
      'surface-readonly':
        'color-mix(in oklab, var(--color-muted) 72%, var(--color-background))',
      'surface-focus':
        'color-mix(in oklab, var(--color-primary) 14%, var(--color-background))',

      'border-muted':
        'color-mix(in oklab, var(--color-border) 62%, var(--color-background))',
      'border-strong':
        'color-mix(in oklab, var(--color-foreground) 18%, var(--color-background))',
      'border-grid':
        'color-mix(in oklab, var(--color-border) 84%, var(--color-background))',
      'border-focus': 'var(--color-ring)',

      'table-header':
        'color-mix(in oklab, var(--color-foreground) 4%, var(--color-background))',
      'table-row-hover': 'var(--color-surface-hover)',
      'table-row-selected': 'var(--color-surface-selected)',
      'table-row-stripe':
        'color-mix(in oklab, var(--color-primary) 2.5%, var(--color-background))',
      'table-cell-focus': 'var(--color-surface-focus)',
      'table-pinned':
        'color-mix(in oklab, var(--color-card) 94%, var(--color-foreground))',
    },

    dark: {
      'primary-50':
        'color-mix(in oklab, var(--color-primary) 10%, var(--color-background))',
      'primary-100':
        'color-mix(in oklab, var(--color-primary) 16%, var(--color-background))',
      'primary-200':
        'color-mix(in oklab, var(--color-primary) 24%, var(--color-background))',
      'primary-300':
        'color-mix(in oklab, var(--color-primary) 36%, var(--color-background))',
      'primary-400':
        'color-mix(in oklab, var(--color-primary) 55%, var(--color-background))',
      'primary-500': 'var(--color-primary)',
      'primary-600':
        'color-mix(in oklab, var(--color-primary) 88%, var(--color-background))',
      'primary-700':
        'color-mix(in oklab, var(--color-primary) 76%, var(--color-background))',
      'primary-800':
        'color-mix(in oklab, var(--color-primary) 62%, var(--color-background))',
      'primary-900':
        'color-mix(in oklab, var(--color-primary) 48%, var(--color-background))',
      'primary-950': 'color-mix(in oklab, var(--color-primary) 34%, black)',

      surface: 'var(--color-background)',
      'surface-foreground': 'var(--color-foreground)',
      code: 'color-mix(in oklab, var(--color-muted) 85%, var(--color-background))',
      'code-foreground': 'var(--color-foreground)',
      'code-highlight':
        'color-mix(in oklab, var(--color-primary) 18%, var(--color-background))',
      'code-number': 'var(--color-muted-foreground)',
      selection: 'var(--color-primary-100)',
      'selection-foreground': 'var(--color-primary-foreground)',

      'surface-hover':
        'color-mix(in oklab, var(--color-foreground) 6%, var(--color-background))',
      'surface-active':
        'color-mix(in oklab, var(--color-foreground) 9%, var(--color-background))',
      'surface-selected':
        'color-mix(in oklab, var(--color-primary) 16%, var(--color-background))',
      'surface-disabled':
        'color-mix(in oklab, var(--color-foreground) 4%, var(--color-background))',
      'surface-readonly':
        'color-mix(in oklab, var(--color-muted) 78%, var(--color-background))',
      'surface-focus':
        'color-mix(in oklab, var(--color-primary) 20%, var(--color-background))',

      'border-muted':
        'color-mix(in oklab, var(--color-border) 68%, var(--color-background))',
      'border-strong':
        'color-mix(in oklab, var(--color-foreground) 24%, var(--color-background))',
      'border-grid':
        'color-mix(in oklab, var(--color-border) 88%, var(--color-background))',
      'border-focus': 'var(--color-ring)',

      'table-header':
        'color-mix(in oklab, var(--color-foreground) 5.5%, var(--color-background))',
      'table-row-hover': 'var(--color-surface-hover)',
      'table-row-selected': 'var(--color-surface-selected)',
      'table-row-stripe':
        'color-mix(in oklab, var(--color-primary) 4%, var(--color-background))',
      'table-cell-focus': 'var(--color-surface-focus)',
      'table-pinned':
        'color-mix(in oklab, var(--color-card) 92%, var(--color-foreground))',
    },
  },
} as const satisfies ThemeColorLayerPartials

const mergedThemeColorLight = {
  ...themeColorLayersPartial.primitive.light,
  ...themeColorLayersPartial.derived.light,
} satisfies ColorLayerPartial

const mergedThemeColorDark = {
  ...themeColorLayersPartial.primitive.dark,
  ...themeColorLayersPartial.derived.dark,
} satisfies ColorLayerPartial

export const themeTokenSource = parseThemeTokenSource({
  colors: {
    primitive: {
      light: fullColorRecord(
        themeColorLayersPartial.primitive.light,
        mergedThemeColorLight,
      ),
      dark: fullColorRecord(
        themeColorLayersPartial.primitive.dark,
        mergedThemeColorDark,
      ),
    },
    derived: {
      light: fullColorRecord(
        themeColorLayersPartial.derived.light,
        mergedThemeColorLight,
      ),
      dark: fullColorRecord(
        themeColorLayersPartial.derived.dark,
        mergedThemeColorDark,
      ),
    },
  },

  radius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    '4xl': '2rem',
  },

  containers: {
    xs: '20rem',
    sm: '24rem',
    md: '28rem',
    lg: '32rem',
    xl: '36rem',
    '2xl': '44rem',
  },

  breakpoints: {
    '3xl': '1600px',
    '4xl': '2000px',
  },

  fonts: {
    sans: 'Geist, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
    mono: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    heading: 'var(--font-sans)',
    serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  },

  runtime: {
    density: {
      compact: '0.875',
      comfortable: '1',
      spacious: '1.125',
    },
    controlSizes: {
      'control-xs': '1.75rem',
      'control-sm': '2rem',
      'control-md': '2.375rem',
      'control-lg': '2.875rem',
      'toolbar-height': '2.75rem',
      'table-row-height': '2.375rem',
      'table-header-height': '2.625rem',
    },
    componentSpacing: {
      'panel-padding': '1rem',
      'form-gap': '0.875rem',
    },
    textSizes: {
      'ui-xs': '0.75rem',
      'ui-sm': '0.875rem',
      'ui-md': '1rem',
      'ui-lg': '1.125rem',
      label: '0.875rem',
      helper: '0.75rem',
      table: '0.875rem',
      'section-title': '1rem',
      metric: '1.5rem',
    },
  },

  animations: {
    'fade-in': 'fade-in 160ms cubic-bezier(0.16, 1, 0.3, 1)',
    'fade-out': 'fade-out 120ms cubic-bezier(0.7, 0, 0.84, 0)',
    'slide-in': 'slide-in 220ms cubic-bezier(0.16, 1, 0.3, 1)',
    'slide-out': 'slide-out 160ms cubic-bezier(0.7, 0, 0.84, 0)',
    'dialog-in': 'dialog-in 180ms cubic-bezier(0.16, 1, 0.3, 1)',
    'dialog-out': 'dialog-out 140ms cubic-bezier(0.7, 0, 0.84, 0)',
  },

  keyframes: {
    'fade-in': {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
    'fade-out': {
      from: { opacity: '1' },
      to: { opacity: '0' },
    },
    'slide-in': {
      from: {
        transform: 'translateY(-0.375rem)',
        opacity: '0',
      },
      to: {
        transform: 'translateY(0)',
        opacity: '1',
      },
    },
    'slide-out': {
      from: {
        transform: 'translateY(0)',
        opacity: '1',
      },
      to: {
        transform: 'translateY(-0.375rem)',
        opacity: '0',
      },
    },
    'dialog-in': {
      from: {
        opacity: '0',
        transform: 'scale(0.97) translateY(-0.375rem)',
      },
      to: {
        opacity: '1',
        transform: 'scale(1) translateY(0)',
      },
    },
    'dialog-out': {
      from: {
        opacity: '1',
        transform: 'scale(1) translateY(0)',
      },
      to: {
        opacity: '0',
        transform: 'scale(0.97) translateY(-0.375rem)',
      },
    },
  },
})
