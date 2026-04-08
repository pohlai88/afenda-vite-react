import { AFENDA_THEME_DEFAULTS } from '../styles/afenda-theme-config.js'
import type {
  AfendaThemeProps,
  ResolvedAfendaThemeProps,
} from './theme.props.js'

export function resolveAfendaThemeProps(
  props: AfendaThemeProps = {},
): ResolvedAfendaThemeProps {
  return {
    ...AFENDA_THEME_DEFAULTS,
    ...props,
  }
}
