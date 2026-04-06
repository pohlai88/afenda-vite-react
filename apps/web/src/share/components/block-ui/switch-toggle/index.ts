/**
 * RESPONSIBILITY ENVELOPE
 * File role: `block-ui/switch-toggle` sub-barrel.
 * Owns: `ScopeSwitcher`, `ThemeToggle` and their types.
 * Standard: re-export only; implementations stay in sibling `.tsx` files.
 */
export { ScopeSwitcher } from './scope-switcher'
export type {
  ScopeSwitcherGroup,
  ScopeSwitcherItem,
  ScopeSwitcherProps,
} from './scope-switcher'
export { ThemeToggle } from './theme-toggle'
export type { ThemeToggleProps } from './theme-toggle'
