/**
 * RESPONSIBILITY ENVELOPE
 * File role: `shell-ui` public API barrel.
 * Owns: standalone shell primitives only (`ShellTitle`, `ShellActionSlot`, …).
 * Standard: components + their prop types; see `shell-ui/RULES.md`.
 * Must not own: composed blocks (those live in `block-ui/`).
 * Related: `RULES.md`, consumers in `block-ui/` and `navigation/`.
 */
export { ShellActionSlot } from './shell-action-slot'
export type { ShellActionSlotProps } from './shell-action-slot'
export { ShellTitle } from './shell-title'
export type { ShellTitleProps } from './shell-title'
