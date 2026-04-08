import type { ComponentType } from 'react'
import { cn } from '../../lib/utils/cn.js'

/**
 * Higher-order component that injects Afenda-specific default props
 * onto any upstream Radix Themes component.
 *
 * Use this to create thin wrappers that enforce Afenda defaults
 * (e.g., default variant, size, color) while still allowing consumers
 * to override any prop.
 *
 * @example
 * ```tsx
 * import { Button } from '@radix-ui/themes'
 *
 * export const AfendaButton = withAfendaDefaults(Button, {
 *   variant: 'solid',
 *   size: '2',
 * })
 * ```
 */
export function withAfendaDefaults<P extends Record<string, unknown>>(
  Component: ComponentType<P>,
  defaults: Partial<P>,
  displayName?: string,
): ComponentType<P> {
  function Wrapped(props: P) {
    const merged = { ...defaults, ...props }

    if ('className' in defaults && 'className' in props) {
      ;(merged as Record<string, unknown>).className = cn(
        (defaults as Record<string, unknown>).className as string | undefined,
        (props as Record<string, unknown>).className as string | undefined,
      )
    }

    return <Component {...merged} />
  }

  Wrapped.displayName =
    displayName ??
    `Afenda(${Component.displayName ?? Component.name ?? 'Component'})`

  return Wrapped
}
