import { Theme } from '@radix-ui/themes'
import { resolveAfendaThemeProps } from './resolve-afenda-theme-props.js'
import type { AfendaThemeProps } from './theme.props.js'

/**
 * Root theme provider for Afenda applications using Radix Themes.
 *
 * Wraps the upstream `<Theme>` with Afenda-specific defaults (accent color,
 * gray color, radius, scaling) so that all child Radix components render
 * with consistent Afenda branding out of the box.
 *
 * Any prop can be overridden by the consumer — unset props fall back to
 * `AFENDA_THEME_DEFAULTS`.
 *
 * @example
 * ```tsx
 * import { AfendaTheme } from '@afenda/radix-ui-themes'
 * import '@radix-ui/themes/styles.css'
 *
 * function App() {
 *   return (
 *     <AfendaTheme>
 *       <YourApp />
 *     </AfendaTheme>
 *   )
 * }
 * ```
 */
export function AfendaTheme(props: AfendaThemeProps) {
  return <Theme {...resolveAfendaThemeProps(props)} />
}
