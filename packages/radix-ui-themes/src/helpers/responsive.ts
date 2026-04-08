/**
 * Responsive prop utilities for Radix Themes integration.
 *
 * Radix Themes supports responsive objects on most visual props:
 * `{ initial: '1', sm: '2', md: '3', lg: '4', xl: '5' }`
 *
 * These helpers build class names from responsive prop values,
 * matching the breakpoint system used by Radix Themes.
 */

export const BREAKPOINTS = ['initial', 'xs', 'sm', 'md', 'lg', 'xl'] as const

export type Breakpoint = (typeof BREAKPOINTS)[number]

export type Responsive<T> = T | Partial<Record<Breakpoint, T>>

/**
 * Resolves a responsive prop value at a given breakpoint,
 * falling back through the cascade: requested → initial → undefined.
 */
export function resolveResponsiveValue<T>(
  value: Responsive<T> | undefined,
  breakpoint: Breakpoint = 'initial',
): T | undefined {
  if (value === undefined || value === null) return undefined

  if (typeof value !== 'object') return value as T

  const responsive = value as Partial<Record<Breakpoint, T>>
  if (breakpoint in responsive) return responsive[breakpoint]

  return responsive.initial
}

/**
 * Builds a CSS class name string for a responsive prop,
 * using the Radix Themes naming convention: `rt-r-{prop}-{value}`.
 */
export function buildResponsiveClassName(
  prop: string,
  value: Responsive<string> | undefined,
  prefix = 'rt-r',
): string {
  if (value === undefined || value === null) return ''

  if (typeof value === 'string') {
    return `${prefix}-${prop}-${value}`
  }

  const responsive: Partial<Record<Breakpoint, string>> = value
  return Object.entries(responsive)
    .filter(([, v]) => v !== undefined)
    .map(([bp, v]) =>
      bp === 'initial' ? `${prefix}-${prop}-${v}` : `${prefix}-${bp}-${prop}-${v}`,
    )
    .join(' ')
}
