import type { ComponentType, SVGProps } from 'react'
import { ChevronsUpDownIcon, CheckIcon } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@afenda/ui/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@afenda/ui/components/ui/command'
import { Popover, PopoverTrigger } from '@afenda/ui/components/ui/popover'
import { cn } from '@afenda/ui/lib/utils'

import type { TruthSeverity } from '@afenda/core/truth'
import { ShellPopoverContent } from '@/share/components/shell-ui'
import { SearchOverlayShell } from '@/share/components/search'

import { getTruthSeverityPresentation } from '@afenda/shadcn-ui/semantic'

export interface ScopeSwitcherItem {
  readonly id: string
  readonly name: string
  readonly badge?: string
}

/** Grouped sections inside one switcher (e.g. organizations vs subsidiaries). */
export interface ScopeSwitcherGroup {
  /** Stable key for React */
  readonly id: string
  /** Visible section heading (pass pre-translated copy from the parent). */
  readonly heading: string
  readonly items: readonly ScopeSwitcherItem[]
}

export interface ScopeSwitcherProps {
  /** Label shown when collapsed (e.g., "Organization") */
  label?: string
  /** Currently selected item */
  currentValue: string | null
  /**
   * Flat list — default breadcrumb mode.
   * Omit when using `groups` (grouped mode).
   */
  items?: readonly ScopeSwitcherItem[]
  /**
   * Grouped list with section headings. When set (including `[]`), grouped UI is used
   * and `items` is ignored for rendering.
   */
  groups?: readonly ScopeSwitcherGroup[]
  /** Called when user selects a different item */
  onSelect: (itemId: string) => void
  /** Optional severity indicator (shows colored dot) */
  severity?: TruthSeverity
  /** Placeholder text for search input */
  searchPlaceholder?: string
  /** Text shown when no items match search */
  emptyText?: string
  className?: string
  /**
   * `icon` — compact glyph + popover (Supabase-style scope), no long label in the bar.
   * Requires `icon` component.
   */
  mode?: 'text' | 'icon'
  /** Shown in the trigger when `mode="icon"` */
  icon?: ComponentType<SVGProps<SVGSVGElement>>
}

/**
 * ScopeSwitcher is a reusable dropdown for any truth scope level.
 * Use flat `items` (breadcrumb org/subsidiary) or `groups` for larger datasets.
 */
export function ScopeSwitcher({
  label,
  currentValue,
  items,
  groups,
  onSelect,
  severity,
  searchPlaceholder,
  emptyText,
  className,
  mode = 'text',
  icon: Icon,
}: ScopeSwitcherProps) {
  const { t } = useTranslation('shell')
  const [open, setOpen] = useState(false)
  const listId = useId()

  const isGrouped = groups !== undefined

  const allItems = useMemo(() => {
    if (isGrouped) {
      return (groups ?? []).flatMap((g) => g.items)
    }
    return items ?? []
  }, [isGrouped, groups, items])

  const resolvedSearchPlaceholder =
    searchPlaceholder ?? t('breadcrumb.scope_search_default', 'Search...')
  const resolvedEmptyText =
    emptyText ?? t('breadcrumb.scope_no_results', 'No results found.')
  const severityTone = severity
    ? getTruthSeverityPresentation(severity)
    : null

  const selectedItem = useMemo(
    () => allItems.find((item) => item.id === currentValue),
    [allItems, currentValue],
  )
  const displayLabel = selectedItem?.name ?? label ?? 'Select...'
  const titleHint = [label, displayLabel, selectedItem?.badge]
    .filter(Boolean)
    .join(' · ')
  const useIconMode = mode === 'icon' && Icon

  const renderItem = (item: ScopeSwitcherItem) => (
    <CommandItem
      key={item.id}
      value={`${item.name} ${item.badge ?? ''} ${item.id}`}
      keywords={[item.name, item.badge ?? '', item.id]}
      onSelect={() => {
        onSelect(item.id)
        setOpen(false)
      }}
    >
      <span className="flex-1 truncate">{item.name}</span>
      {item.badge ? (
        <span className="text-micro ml-2 rounded bg-muted px-1 font-medium text-muted-foreground">
          {item.badge}
        </span>
      ) : null}
      {item.id === currentValue ? (
        <CheckIcon className="ml-2 h-4 w-4" aria-hidden="true" />
      ) : null}
    </CommandItem>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-label={titleHint}
          title={titleHint}
          className={cn(
            useIconMode
              ? 'relative h-8 w-8 shrink-0 justify-center p-0'
              : 'h-8 justify-between gap-1 px-2 text-sm font-medium',
            className,
          )}
        >
          {useIconMode ? (
            <>
              {severity ? (
                <span
                  className={cn(
                    'absolute right-1 top-1 z-10 h-1.5 w-1.5 rounded-full ring-2 ring-background',
                    severityTone?.dotClassName,
                  )}
                  aria-hidden="true"
                />
              ) : null}
              <Icon
                className="size-[18px] shrink-0 opacity-90"
                aria-hidden="true"
              />
            </>
          ) : (
            <>
              {severity ? (
                <span
                  className={cn(
                    'mr-1 h-2 w-2 shrink-0 rounded-full',
                    severityTone?.dotClassName,
                  )}
                  aria-hidden="true"
                />
              ) : null}
              <span className="truncate">{displayLabel}</span>
              {selectedItem?.badge ? (
                <span className="text-micro ml-1 rounded bg-muted px-1 font-medium text-muted-foreground">
                  {selectedItem.badge}
                </span>
              ) : null}
              <ChevronsUpDownIcon
                className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50"
                aria-hidden="true"
              />
            </>
          )}
        </Button>
      </PopoverTrigger>
      <ShellPopoverContent
        shellVariant="scopeStrip"
        className={cn(
          'p-0',
          isGrouped
            ? 'w-[min(100vw-2rem,280px)]'
            : 'min-w-52 w-auto max-w-[min(100vw-2rem,20rem)]',
        )}
      >
        <SearchOverlayShell className="static mt-0 w-full rounded-[inherit] border-0 bg-transparent shadow-none">
          <Command>
            <CommandInput
              placeholder={resolvedSearchPlaceholder}
              className="h-9"
            />
            <CommandList id={listId}>
              <CommandEmpty>{resolvedEmptyText}</CommandEmpty>
              {isGrouped ? (
                (groups ?? []).map((group) => (
                  <CommandGroup key={group.id} heading={group.heading}>
                    {group.items.map((item) => renderItem(item))}
                  </CommandGroup>
                ))
              ) : (
                <CommandGroup>
                  {(items ?? []).map((item) => renderItem(item))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </SearchOverlayShell>
      </ShellPopoverContent>
    </Popover>
  )
}
