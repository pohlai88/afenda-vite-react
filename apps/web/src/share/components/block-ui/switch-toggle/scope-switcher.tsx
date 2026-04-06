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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@afenda/ui/components/ui/popover'
import { cn } from '@afenda/ui/lib/utils'

import type { TruthSeverity } from '@afenda/core/truth'

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
}

const SEVERITY_DOT_COLORS = {
  valid: 'bg-[var(--color-truth-valid)]',
  warning: 'bg-[var(--color-truth-warning)]',
  broken: 'bg-[var(--color-truth-broken)]',
  pending: 'bg-[var(--color-truth-pending)]',
  neutral: 'bg-[var(--color-truth-neutral)]',
} as const satisfies Record<TruthSeverity, string>

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

  const selectedItem = useMemo(
    () => allItems.find((item) => item.id === currentValue),
    [allItems, currentValue],
  )
  const displayLabel = selectedItem?.name ?? label ?? 'Select...'

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
        <span className="ml-2 rounded bg-muted px-1 text-[10px] font-medium text-muted-foreground">
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
          aria-label={`Switch ${label ?? 'scope'}`}
          className={cn(
            'h-8 justify-between gap-1 px-2 text-sm font-medium',
            className,
          )}
        >
          {severity ? (
            <span
              className={cn(
                'mr-1 h-2 w-2 shrink-0 rounded-full',
                SEVERITY_DOT_COLORS[severity],
              )}
              aria-hidden="true"
            />
          ) : null}
          <span className="truncate">{displayLabel}</span>
          {selectedItem?.badge ? (
            <span className="ml-1 rounded bg-muted px-1 text-[10px] font-medium text-muted-foreground">
              {selectedItem.badge}
            </span>
          ) : null}
          <ChevronsUpDownIcon
            className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50"
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'p-0',
          isGrouped ? 'w-[min(100vw-2rem,280px)]' : 'w-[200px]',
        )}
        align="start"
      >
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
      </PopoverContent>
    </Popover>
  )
}
