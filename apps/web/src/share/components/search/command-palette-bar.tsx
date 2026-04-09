import { useId, useMemo } from 'react'
import { SearchIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Kbd } from '@afenda/ui/components/ui/kbd'
import { cn } from '@afenda/ui/lib/utils'

import { GLOBAL_COMMAND_PALETTE_CONTENT_ID } from './command-palette-ids'
import { getCommandPaletteOpenChordLabel } from './command-palette-platform'

export interface CommandPaletteBarProps {
  /** Opens the cmdk command palette dialog. */
  onOpen: () => void
  className?: string
  /** Mirrors command palette dialog open state for assistive tech. */
  paletteOpen?: boolean
  /** Must match `contentId` on `CommandPalette`'s dialog content. */
  paletteContentId?: string
}

/**
 * Shell control that opens the **command palette** (cmdk). Styled as a compact bar
 * (Supabase-style) — pair with {@link SemanticSearchInput} using the same height.
 */
export function CommandPaletteBar({
  onOpen,
  className,
  paletteOpen = false,
  paletteContentId = GLOBAL_COMMAND_PALETTE_CONTENT_ID,
}: CommandPaletteBarProps) {
  const { t } = useTranslation('shell')
  const shortcutHintId = useId()
  const chordLabel = useMemo(() => getCommandPaletteOpenChordLabel(), [])
  const kbdAriaLabel =
    chordLabel === '⌘K'
      ? t('command_palette.shortcut_aria_command_k')
      : t('command_palette.shortcut_aria_ctrl_k')

  const title = t('command_palette.title')
  const placeholder = t('command_palette.bar_placeholder')

  return (
    <div
      className={cn(
        'w-full max-w-(--top-nav-cmdk-omni-max-width) min-w-0',
        className,
      )}
    >
      <span id={shortcutHintId} className="sr-only">
        {kbdAriaLabel}
      </span>
      <button
        type="button"
        data-testid="command-palette-bar"
        className={cn(
          'top-nav-omni-bar',
          'border-border/50 bg-muted/20 text-muted-foreground cursor-pointer gap-2 px-0 text-left transition-colors',
          'hover:border-border/70 hover:bg-muted/35',
          'focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-2 focus-visible:outline-none',
        )}
        aria-label={title}
        aria-describedby={shortcutHintId}
        aria-haspopup="dialog"
        aria-expanded={paletteOpen}
        aria-controls={paletteContentId}
        onClick={onOpen}
      >
        <span className="text-muted-foreground/75 flex shrink-0 items-center px-2.5">
          <SearchIcon className="size-4 shrink-0" aria-hidden />
        </span>
        <span className="text-muted-foreground/80 min-w-0 flex-1 truncate text-(length:--top-nav-font-size)">
          {placeholder}
        </span>
        <span className="flex shrink-0 items-center pr-2.5">
          <Kbd
            className="border-border/60 bg-background/80 text-muted-foreground/80 h-5 min-w-5 rounded-md border px-1.5 text-[10px] font-medium shadow-none"
            aria-hidden
          >
            {chordLabel}
          </Kbd>
        </span>
      </button>
    </div>
  )
}
