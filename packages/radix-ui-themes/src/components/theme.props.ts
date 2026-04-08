import type { ComponentPropsWithoutRef } from 'react'
import type { Theme } from '@radix-ui/themes'
import type { AfendaThemeConfig } from '../styles/afenda-theme-config.js'

/**
 * Props for the AfendaTheme wrapper component.
 *
 * Extends the upstream Radix `Theme` props so consumers can override
 * any value while inheriting Afenda defaults for unset props.
 */
export type AfendaThemeProps = ComponentPropsWithoutRef<typeof Theme>

export type ResolvedAfendaThemeProps = AfendaThemeProps &
  Pick<
    AfendaThemeConfig,
    | 'accentColor'
    | 'grayColor'
    | 'radius'
    | 'scaling'
    | 'appearance'
    | 'panelBackground'
    | 'hasBackground'
  >
