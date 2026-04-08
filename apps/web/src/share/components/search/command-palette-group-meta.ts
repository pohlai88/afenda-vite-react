import type { ComponentType, SVGProps } from 'react'
import {
  AlertTriangleIcon,
  ClockIcon,
  PinIcon,
  SearchIcon,
  Settings2Icon,
  SparklesIcon,
  WrenchIcon,
} from 'lucide-react'

import type { PaletteGroup } from './command-palette.types'

/** Must match `command_palette.*` keys in per-locale `shell.json` (i18n namespace `shell`). */
export type CommandPaletteGroupHeadingKey =
  | 'command_palette.group_recent'
  | 'command_palette.group_pinned'
  | 'command_palette.group_suggested'
  | 'command_palette.group_nav'
  | 'command_palette.group_audit'
  | 'command_palette.group_resolve'
  | 'command_palette.group_actions'
  | 'command_palette.group_settings'

export const PALETTE_GROUP_HEADING_KEYS = {
  recent: 'command_palette.group_recent',
  pinned: 'command_palette.group_pinned',
  suggested: 'command_palette.group_suggested',
  search: 'command_palette.group_nav',
  audit: 'command_palette.group_audit',
  resolve: 'command_palette.group_resolve',
  actions: 'command_palette.group_actions',
  settings: 'command_palette.group_settings',
} as const satisfies Record<PaletteGroup, CommandPaletteGroupHeadingKey>

type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>

export interface PaletteGroupUiMeta {
  readonly headingKey: CommandPaletteGroupHeadingKey
  readonly Icon: SvgIcon
  readonly iconClassName?: string
}

const PALETTE_GROUP_UI = {
  recent: {
    headingKey: PALETTE_GROUP_HEADING_KEYS.recent,
    Icon: ClockIcon,
  },
  pinned: {
    headingKey: PALETTE_GROUP_HEADING_KEYS.pinned,
    Icon: PinIcon,
  },
  suggested: {
    headingKey: PALETTE_GROUP_HEADING_KEYS.suggested,
    Icon: SparklesIcon,
  },
  search: {
    headingKey: PALETTE_GROUP_HEADING_KEYS.search,
    Icon: SearchIcon,
  },
  audit: {
    headingKey: PALETTE_GROUP_HEADING_KEYS.audit,
    Icon: AlertTriangleIcon,
    iconClassName: 'text-(--color-truth-broken)',
  },
  resolve: {
    headingKey: PALETTE_GROUP_HEADING_KEYS.resolve,
    Icon: SparklesIcon,
    iconClassName: 'text-(--color-truth-valid)',
  },
  actions: {
    headingKey: PALETTE_GROUP_HEADING_KEYS.actions,
    Icon: WrenchIcon,
  },
  settings: {
    headingKey: PALETTE_GROUP_HEADING_KEYS.settings,
    Icon: Settings2Icon,
  },
} as const satisfies Record<PaletteGroup, PaletteGroupUiMeta>

/** Prefer this over indexing `PALETTE_GROUP_UI` so typed-eslint resolves `PaletteGroupUiMeta` reliably. */
export function getPaletteGroupUi(group: PaletteGroup): PaletteGroupUiMeta {
  switch (group) {
    case 'recent':
      return PALETTE_GROUP_UI.recent
    case 'pinned':
      return PALETTE_GROUP_UI.pinned
    case 'suggested':
      return PALETTE_GROUP_UI.suggested
    case 'search':
      return PALETTE_GROUP_UI.search
    case 'audit':
      return PALETTE_GROUP_UI.audit
    case 'resolve':
      return PALETTE_GROUP_UI.resolve
    case 'actions':
      return PALETTE_GROUP_UI.actions
    case 'settings':
      return PALETTE_GROUP_UI.settings
    default: {
      const _exhaustive: never = group
      return _exhaustive
    }
  }
}
