import { Settings2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@afenda/ui/components/ui/button'
import { Checkbox } from '@afenda/ui/components/ui/checkbox'
import { Label } from '@afenda/ui/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@afenda/ui/components/ui/popover'
import { cn } from '@afenda/ui/lib/utils'

import type { TruthActionBarTab } from '@afenda/core/truth-ui'

import {
  selectActiveActionBarPrefs,
  useActionBarPrefsStore,
} from '@/share/client-store'
import { useActionBarContext } from '../../providers'

function effectiveKeySet(
  scopeKey: string,
  availableKeys: string[],
  selectedKeysByScope: Record<string, string[]>,
): Set<string> {
  const stored = selectedKeysByScope[scopeKey]
  if (stored === undefined) {
    return new Set(availableKeys)
  }
  return new Set(stored)
}

/**
 * User controls which catalog entries appear in Row 2 (British spelling in filename).
 */
export function TopActionBarCustomiseMenu({
  className,
}: {
  className?: string
}) {
  const { t } = useTranslation('shell')
  const { scopeKey, availableTabs } = useActionBarContext()
  const selectedKeysByScope = useActionBarPrefsStore(selectActiveActionBarPrefs)
  const setSelectedKeys = useActionBarPrefsStore((s) => s.setSelectedKeys)
  const clearScopeSelection = useActionBarPrefsStore(
    (s) => s.clearScopeSelection,
  )

  if (!scopeKey || availableTabs.length === 0) {
    return null
  }

  const availableKeys = availableTabs.map((tab) => tab.key)
  const active = effectiveKeySet(scopeKey, availableKeys, selectedKeysByScope)

  const toggle = (key: string, checked: boolean) => {
    const next = new Set(active)
    if (checked) next.add(key)
    else next.delete(key)
    const ordered = availableKeys.filter((k) => next.has(k))
    if (ordered.length === availableKeys.length) {
      clearScopeSelection(scopeKey)
    } else {
      setSelectedKeys(scopeKey, ordered)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8 shrink-0', className)}
          aria-label={t('action_bar.customize_aria', 'Customize action bar')}
        >
          <Settings2Icon aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end" sideOffset={8}>
        <p className="mb-2 text-sm font-medium">
          {t('action_bar.customize_title', 'Action bar')}
        </p>
        <p className="mb-3 text-xs text-muted-foreground">
          {t(
            'action_bar.customize_hint',
            'Choose which shortcuts appear. By default, all are shown.',
          )}
        </p>
        <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
          {availableTabs.map((tab: TruthActionBarTab) => {
            const id = `top-action-bar-opt-${scopeKey}-${tab.key}`
            return (
              <li key={tab.key} className="flex items-center gap-2">
                <Checkbox
                  id={id}
                  checked={active.has(tab.key)}
                  onCheckedChange={(v) => toggle(tab.key, v === true)}
                />
                <Label
                  htmlFor={id}
                  className="cursor-pointer text-sm font-normal"
                >
                  {t(tab.labelKey as never)}
                </Label>
              </li>
            )
          })}
        </ul>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          onClick={() => clearScopeSelection(scopeKey)}
        >
          {t('action_bar.show_all', 'Show all')}
        </Button>
      </PopoverContent>
    </Popover>
  )
}
