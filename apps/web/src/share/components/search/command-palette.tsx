import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { BookOpenIcon, PinIcon, SearchIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * Primitives follow cmdk + shadcn Command composition: `CommandDialog` is the dialog shell;
 * a root `Command` must wrap `CommandInput` / `CommandList` so filtering and list state work.
 *
 * @see https://github.com/dip/cmdk
 * @see https://ui.shadcn.com/docs/components/radix/command
 */
import { Badge } from '@afenda/ui/components/ui/badge'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@afenda/ui/components/ui/command'
import { Kbd } from '@afenda/ui/components/ui/kbd'
import { cn } from '@afenda/ui/lib/utils'

import type { PaletteCommand } from './command-palette.types'
import {
  buildPaletteBrowseBlocks,
  buildPaletteQueryCommands,
} from './command-palette-display-model'
import { getPaletteGroupUi } from './command-palette-group-meta'
import { GLOBAL_COMMAND_PALETTE_CONTENT_ID } from './command-palette-ids'
import { getCommandPaletteOpenChordLabel } from './command-palette-platform'
import {
  paletteCommandRowClassName,
  paletteSeverityBadgeLabel,
} from './command-palette-presentation'
import { usePaletteCommands } from './use-palette-commands'

export interface CommandPaletteProps {
  /** Mirrors Radix/shadcn `Dialog` open state. */
  open: boolean
  onOpenChange: (open: boolean) => void
}

function commandFilterValue(cmd: {
  title: string
  subtitle?: string
  keywords: readonly string[]
}): string {
  return [cmd.title, cmd.subtitle ?? '', ...cmd.keywords].join(' ').trim()
}

/**
 * Global command palette (⌘K / Ctrl+K): ranked commands, truth audit/resolve, theme, recents/pins.
 */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const { t } = useTranslation('shell')
  const [input, setInput] = useState('')

  const openChordLabel = getCommandPaletteOpenChordLabel()

  const clearInput = useCallback(() => {
    setInput('')
  }, [])

  const closePalette = useCallback(() => {
    clearInput()
    onOpenChange(false)
  }, [clearInput, onOpenChange])

  const { groups, togglePin, isPinned } = usePaletteCommands(closePalette)
  const hasQuery = input.trim().length > 0

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        clearInput()
      }
      onOpenChange(next)
    },
    [clearInput, onOpenChange],
  )

  const emptyHints = useMemo(
    () => [
      {
        label: t('command_palette.empty_hint_search'),
        value: 'invoice finance',
      },
      {
        label: t('command_palette.empty_hint_explain'),
        value: 'audit invariant truth',
      },
      {
        label: t('command_palette.empty_hint_resolve'),
        value: 'resolve allocation fix',
      },
      {
        label: t('command_palette.empty_hint_theme'),
        value: 'theme dark light',
      },
    ],
    [t],
  )

  const displayGroups = useMemo(() => {
    type DisplayGroup = {
      key: string
      heading: ReactNode
      commands: readonly PaletteCommand[]
    }

    if (hasQuery) {
      const ranked = buildPaletteQueryCommands(groups)
      if (ranked.length === 0) return [] as DisplayGroup[]
      return [
        {
          key: 'query-results',
          heading: (
            <>
              <SearchIcon className="mr-1 inline-block size-3" />
              {t('nav.search')}
            </>
          ),
          commands: ranked,
        },
      ] satisfies DisplayGroup[]
    }

    const blocks = buildPaletteBrowseBlocks(groups)
    return blocks.map((block) => {
      const meta = getPaletteGroupUi(block.paletteGroup)
      const Icon = meta.Icon
      const headingText = block.sectionLabel ?? t(meta.headingKey)

      return {
        key: block.key,
        heading: (
          <>
            <Icon
              className={cn('mr-1 inline-block size-3', meta.iconClassName)}
            />
            {headingText}
          </>
        ),
        commands: block.commands,
      } satisfies DisplayGroup
    })
  }, [groups, hasQuery, t])

  const renderCommandItem = useCallback(
    (cmd: PaletteCommand) => {
      const Icon = cmd.icon
      const pinned = isPinned(cmd.id)
      const rowTone = paletteCommandRowClassName(cmd)
      const severityLabel = paletteSeverityBadgeLabel(cmd)

      return (
        <CommandItem
          key={cmd.id}
          value={commandFilterValue(cmd)}
          onSelect={cmd.run}
          className={cn(rowTone)}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex items-center gap-2">
              {Icon ? (
                <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
              ) : null}
              <span className="truncate font-medium">{cmd.title}</span>
            </div>
            {cmd.subtitle ? (
              <span className="truncate pl-6 text-xs text-muted-foreground">
                {cmd.subtitle}
              </span>
            ) : null}
          </div>
          {severityLabel ? (
            <Badge
              variant="outline"
              className="hidden shrink-0 capitalize sm:inline-flex"
            >
              {severityLabel}
            </Badge>
          ) : null}
          {cmd.confidence !== undefined ? (
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {Math.round(cmd.confidence * 100)}%
            </span>
          ) : null}
          {cmd.shortcut ? (
            <CommandShortcut>{cmd.shortcut}</CommandShortcut>
          ) : null}
          {cmd.pinEligible ? (
            <button
              type="button"
              className={cn(
                'ml-1 shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground',
                pinned && 'text-primary',
              )}
              aria-label={
                pinned
                  ? t('command_palette.unpin_command')
                  : t('command_palette.pin_command')
              }
              aria-pressed={pinned}
              onPointerDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation()
                }
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                togglePin(cmd.id)
              }}
            >
              <PinIcon className="size-3.5" aria-hidden />
            </button>
          ) : null}
        </CommandItem>
      )
    },
    [isPinned, t, togglePin],
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      contentId={GLOBAL_COMMAND_PALETTE_CONTENT_ID}
      title={t('command_palette.title')}
      description={t('command_palette.description')}
    >
      <Command label={t('command_palette.title')} shouldFilter>
        <CommandInput
          placeholder={t('command_palette.placeholder')}
          value={input}
          onValueChange={setInput}
        />
        <CommandList>
          <CommandEmpty>
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <BookOpenIcon
                className="size-8 text-muted-foreground opacity-50"
                aria-hidden
              />
              <p className="text-sm text-muted-foreground">
                {t('command_palette.empty')}
              </p>
              <div className="flex max-w-full flex-wrap justify-center gap-2 px-2">
                {emptyHints.map((hint) => (
                  <button
                    key={hint.value}
                    type="button"
                    className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setInput(hint.value)}
                  >
                    {hint.label}
                  </button>
                ))}
              </div>
            </div>
          </CommandEmpty>

          {displayGroups.map((group, index) => (
            <div key={group.key}>
              {index > 0 ? <CommandSeparator /> : null}
              <CommandGroup heading={group.heading}>
                {group.commands.map(renderCommandItem)}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </Command>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <Kbd className="text-micro">↑</Kbd>
            <Kbd className="text-micro">↓</Kbd>
            <span>{t('command_palette.footer_navigate')}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Kbd className="text-micro">↵</Kbd>
            <span>{t('command_palette.footer_select')}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Kbd className="text-micro">esc</Kbd>
            <span>{t('command_palette.footer_close')}</span>
          </span>
        </div>
        <Kbd className="text-micro">{openChordLabel}</Kbd>
      </div>
    </CommandDialog>
  )
}
