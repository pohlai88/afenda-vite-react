/**
 * TOKEN SOURCE
 *
 * Canonical source of token values.
 *
 * Business stance:
 * - calm, premium, long-session enterprise UI
 * - single neutral backbone
 * - clearer operational structure for forms/tables
 * - primitive colors are source-authority semantic anchors
 * - derived colors are computed / projected tokens only
 */

import { parseThemeTokenSource } from './token-contract'
import type {
  ColorToken,
  DerivedColorToken,
  PrimitiveColorToken,
  ThemeMode,
} from './token-constants'
import { colorTokenValues } from './token-constants'
import type { ColorTokenRecord } from './token-types'

type PrimitiveColorLayer = Readonly<Record<PrimitiveColorToken, string>>
type DerivedColorLayer = Readonly<Record<DerivedColorToken, string>>

type ThemeColorLayers = Readonly<{
  primitive: Readonly<Record<ThemeMode, PrimitiveColorLayer>>
  derived: Readonly<Record<ThemeMode, DerivedColorLayer>>
}>

export const themeColorLayers = {
  primitive: {
    light: {
      background: 'oklch(97.2% 0.006 210)',
      foreground: 'oklch(22% 0.012 210)',

      card: 'oklch(99.2% 0.004 210)',
      'card-foreground': 'oklch(22% 0.012 210)',

      popover: 'oklch(99.5% 0.003 210)',
      'popover-foreground': 'oklch(22% 0.012 210)',

      primary: 'oklch(48% 0.11 210)',
      'primary-foreground': 'oklch(98% 0.002 210)',

      secondary: 'oklch(94% 0.01 210)',
      'secondary-foreground': 'oklch(30% 0.01 210)',

      muted: 'oklch(95.5% 0.006 210)',
      'muted-foreground': 'oklch(48% 0.01 210)',

      accent: 'oklch(72% 0.10 35)',
      'accent-foreground': 'oklch(20% 0.01 35)',

      destructive: 'oklch(56% 0.18 25)',
      'destructive-foreground': 'oklch(98% 0.002 25)',

      border: 'oklch(86% 0.012 210)',
      input: 'oklch(86% 0.012 210)',
      ring: 'oklch(48% 0.11 210)',
      'ring-offset': 'oklch(97.2% 0.006 210)',

      'chart-1': 'oklch(56% 0.12 210)',
      'chart-2': 'oklch(60% 0.13 250)',
      'chart-3': 'oklch(62% 0.13 160)',
      'chart-4': 'oklch(68% 0.14 80)',
      'chart-5': 'oklch(58% 0.14 20)',

      sidebar: 'oklch(96.2% 0.006 210)',
      'sidebar-foreground': 'oklch(24% 0.012 210)',
      'sidebar-primary': 'oklch(48% 0.11 210)',
      'sidebar-primary-foreground': 'oklch(98% 0.002 210)',
      'sidebar-accent': 'oklch(93% 0.008 210)',
      'sidebar-accent-foreground': 'oklch(28% 0.01 210)',
      'sidebar-border': 'oklch(85% 0.012 210)',
      'sidebar-ring': 'oklch(48% 0.11 210)',

      success: 'oklch(58% 0.14 150)',
      'success-foreground': 'oklch(98% 0.002 150)',
      warning: 'oklch(70% 0.13 80)',
      'warning-foreground': 'oklch(22% 0.01 80)',
      info: 'oklch(54% 0.11 230)',
      'info-foreground': 'oklch(98% 0.002 230)',
    },

    dark: {
      background: 'oklch(15% 0.008 210)',
      foreground: 'oklch(94% 0.004 210)',

      card: 'oklch(18.5% 0.01 210)',
      'card-foreground': 'oklch(94% 0.004 210)',

      popover: 'oklch(19.5% 0.009 210)',
      'popover-foreground': 'oklch(94% 0.004 210)',

      primary: 'oklch(70% 0.11 210)',
      'primary-foreground': 'oklch(14% 0.01 210)',

      secondary: 'oklch(24% 0.012 210)',
      'secondary-foreground': 'oklch(92% 0.004 210)',

      muted: 'oklch(22% 0.01 210)',
      'muted-foreground': 'oklch(72% 0.008 210)',

      accent: 'oklch(74% 0.10 35)',
      'accent-foreground': 'oklch(16% 0.01 35)',

      destructive: 'oklch(63% 0.17 25)',
      'destructive-foreground': 'oklch(14% 0.01 25)',

      border: 'oklch(29% 0.012 210)',
      input: 'oklch(29% 0.012 210)',
      ring: 'oklch(70% 0.11 210)',
      'ring-offset': 'oklch(15% 0.008 210)',

      'chart-1': 'oklch(70% 0.11 210)',
      'chart-2': 'oklch(74% 0.12 250)',
      'chart-3': 'oklch(72% 0.12 160)',
      'chart-4': 'oklch(78% 0.13 80)',
      'chart-5': 'oklch(68% 0.14 20)',

      sidebar: 'oklch(13.5% 0.008 210)',
      'sidebar-foreground': 'oklch(92% 0.004 210)',
      'sidebar-primary': 'oklch(70% 0.11 210)',
      'sidebar-primary-foreground': 'oklch(14% 0.01 210)',
      'sidebar-accent': 'oklch(23% 0.01 210)',
      'sidebar-accent-foreground': 'oklch(90% 0.004 210)',
      'sidebar-border': 'oklch(27% 0.012 210)',
      'sidebar-ring': 'oklch(70% 0.11 210)',

      success: 'oklch(68% 0.13 150)',
      'success-foreground': 'oklch(14% 0.01 150)',
      warning: 'oklch(76% 0.13 80)',
      'warning-foreground': 'oklch(16% 0.01 80)',
      info: 'oklch(68% 0.11 230)',
      'info-foreground': 'oklch(14% 0.01 230)',
    },
  },

  derived: {
    light: {
      'primary-50':
        'color-mix(in oklab, var(--color-primary) 8%, var(--color-background))',
      'primary-100':
        'color-mix(in oklab, var(--color-primary) 14%, var(--color-background))',
      'primary-200':
        'color-mix(in oklab, var(--color-primary) 24%, var(--color-background))',
      'primary-300':
        'color-mix(in oklab, var(--color-primary) 36%, var(--color-background))',
      'primary-400':
        'color-mix(in oklab, var(--color-primary) 52%, var(--color-background))',
      'primary-500': 'var(--color-primary)',
      'primary-600':
        'color-mix(in oklab, var(--color-primary) 84%, var(--color-foreground))',
      'primary-700':
        'color-mix(in oklab, var(--color-primary) 70%, var(--color-foreground))',
      'primary-800':
        'color-mix(in oklab, var(--color-primary) 56%, var(--color-foreground))',
      'primary-900':
        'color-mix(in oklab, var(--color-primary) 44%, var(--color-foreground))',
      'primary-950':
        'color-mix(in oklab, var(--color-primary) 32%, var(--color-foreground))',

      surface: 'var(--color-background)',
      'surface-foreground': 'var(--color-foreground)',
      code: 'color-mix(in oklab, var(--color-muted) 82%, var(--color-background))',
      'code-foreground': 'var(--color-foreground)',
      'code-highlight':
        'color-mix(in oklab, var(--color-primary) 10%, var(--color-background))',
      'code-number': 'var(--color-muted-foreground)',
      selection: 'var(--color-primary-100)',
      'selection-foreground': 'var(--color-primary-foreground)',

      'surface-hover':
        'color-mix(in oklab, var(--color-foreground) 3%, var(--color-background))',
      'surface-active':
        'color-mix(in oklab, var(--color-foreground) 5%, var(--color-background))',
      'surface-selected':
        'color-mix(in oklab, var(--color-primary) 9%, var(--color-background))',
      'surface-disabled':
        'color-mix(in oklab, var(--color-foreground) 2.5%, var(--color-background))',
      'surface-readonly':
        'color-mix(in oklab, var(--color-muted) 78%, var(--color-background))',
      'surface-focus':
        'color-mix(in oklab, var(--color-primary) 12%, var(--color-background))',

      'border-muted':
        'color-mix(in oklab, var(--color-border) 68%, var(--color-background))',
      'border-strong':
        'color-mix(in oklab, var(--color-foreground) 16%, var(--color-background))',
      'border-grid':
        'color-mix(in oklab, var(--color-border) 88%, var(--color-background))',
      'border-focus': 'var(--color-ring)',

      'table-header':
        'color-mix(in oklab, var(--color-foreground) 2.5%, var(--color-background))',
      'table-row-hover': 'var(--color-surface-hover)',
      'table-row-selected': 'var(--color-surface-selected)',
      'table-row-stripe':
        'color-mix(in oklab, var(--color-foreground) 1.2%, var(--color-background))',
      'table-cell-focus': 'var(--color-surface-focus)',
      'table-pinned':
        'color-mix(in oklab, var(--color-card) 96%, var(--color-foreground))',
    },

    dark: {
      'primary-50':
        'color-mix(in oklab, var(--color-primary) 10%, var(--color-background))',
      'primary-100':
        'color-mix(in oklab, var(--color-primary) 16%, var(--color-background))',
      'primary-200':
        'color-mix(in oklab, var(--color-primary) 24%, var(--color-background))',
      'primary-300':
        'color-mix(in oklab, var(--color-primary) 34%, var(--color-background))',
      'primary-400':
        'color-mix(in oklab, var(--color-primary) 46%, var(--color-background))',
      'primary-500': 'var(--color-primary)',
      'primary-600':
        'color-mix(in oklab, var(--color-primary) 86%, var(--color-background))',
      'primary-700':
        'color-mix(in oklab, var(--color-primary) 72%, var(--color-background))',
      'primary-800':
        'color-mix(in oklab, var(--color-primary) 58%, var(--color-background))',
      'primary-900':
        'color-mix(in oklab, var(--color-primary) 44%, var(--color-background))',
      'primary-950': 'color-mix(in oklab, var(--color-primary) 30%, black)',

      surface: 'var(--color-background)',
      'surface-foreground': 'var(--color-foreground)',
      code: 'color-mix(in oklab, var(--color-muted) 86%, var(--color-background))',
      'code-foreground': 'var(--color-foreground)',
      'code-highlight':
        'color-mix(in oklab, var(--color-primary) 16%, var(--color-background))',
      'code-number': 'var(--color-muted-foreground)',
      selection: 'var(--color-primary-100)',
      'selection-foreground': 'var(--color-primary-foreground)',

      'surface-hover':
        'color-mix(in oklab, var(--color-foreground) 5%, var(--color-background))',
      'surface-active':
        'color-mix(in oklab, var(--color-foreground) 8%, var(--color-background))',
      'surface-selected':
        'color-mix(in oklab, var(--color-primary) 13%, var(--color-background))',
      'surface-disabled':
        'color-mix(in oklab, var(--color-foreground) 3%, var(--color-background))',
      'surface-readonly':
        'color-mix(in oklab, var(--color-muted) 80%, var(--color-background))',
      'surface-focus':
        'color-mix(in oklab, var(--color-primary) 18%, var(--color-background))',

      'border-muted':
        'color-mix(in oklab, var(--color-border) 72%, var(--color-background))',
      'border-strong':
        'color-mix(in oklab, var(--color-foreground) 20%, var(--color-background))',
      'border-grid':
        'color-mix(in oklab, var(--color-border) 90%, var(--color-background))',
      'border-focus': 'var(--color-ring)',

      'table-header':
        'color-mix(in oklab, var(--color-foreground) 4%, var(--color-background))',
      'table-row-hover': 'var(--color-surface-hover)',
      'table-row-selected': 'var(--color-surface-selected)',
      'table-row-stripe':
        'color-mix(in oklab, var(--color-foreground) 1.8%, var(--color-background))',
      'table-cell-focus': 'var(--color-surface-focus)',
      'table-pinned':
        'color-mix(in oklab, var(--color-card) 93%, var(--color-foreground))',
    },
  },
} as const satisfies ThemeColorLayers

export const themeTokenSource = parseThemeTokenSource({
  colors: themeColorLayers,

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

/**
 * Merge partial color overrides with a base record and require every `colorTokenValues` key.
 * Used by tests and tooling that need a full flat color record.
 */
export function fullColorRecord(
  partial: Readonly<Partial<Record<ColorToken, string>>>,
  merged: Readonly<Partial<Record<ColorToken, string>>>,
): ColorTokenRecord {
  const combined: Record<string, string | undefined> = {
    ...merged,
    ...partial,
  } as Record<string, string | undefined>

  for (const key of colorTokenValues) {
    const value = combined[key]
    if (value === undefined) {
      throw new Error(`Missing color token: ${key}`)
    }
  }

  return combined as ColorTokenRecord
}
