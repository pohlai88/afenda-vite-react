import { type MouseEventHandler } from 'react'
import { CircleHelpIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@afenda/ui/components/ui/button'
import { Kbd } from '@afenda/ui/components/ui/kbd'
import { cn } from '@afenda/ui/lib/utils'

export interface HelpTriggerProps {
  onClick?: MouseEventHandler<HTMLButtonElement>
  className?: string
  disabled?: boolean
  /** When true, shows a `?` shortcut hint from `sm` breakpoint (matches command-palette Kbd pattern). */
  showKeyboardShortcutHint?: boolean
}

/**
 * HelpTrigger is a [?] icon button that opens the help panel.
 */
export function HelpTrigger({
  onClick,
  className,
  disabled,
  showKeyboardShortcutHint = true,
}: HelpTriggerProps) {
  const { t } = useTranslation('shell')

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        'h-8 shrink-0',
        showKeyboardShortcutHint
          ? 'w-8 px-0 sm:w-auto sm:min-w-8 sm:gap-1 sm:px-2'
          : 'w-8',
        className,
      )}
      onClick={onClick}
      disabled={disabled}
      aria-label={t('help.aria_label', 'Help and support')}
      title={t('help.tooltip', 'Help')}
    >
      <CircleHelpIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {showKeyboardShortcutHint ? (
        <Kbd
          className="hidden sm:inline-flex"
          aria-label={t(
            'help.shortcut_aria',
            'Keyboard shortcut: Shift and question mark',
          )}
        >
          ?
        </Kbd>
      ) : null}
    </Button>
  )
}
