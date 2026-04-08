import { type MouseEventHandler } from 'react'
import { CircleHelpIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@afenda/ui/components/ui/button'
import { cn } from '@afenda/ui/lib/utils'

export interface HelpTriggerProps {
  onClick?: MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  className?: string
}

/**
 * HelpTrigger is a [?] icon button that opens the help panel.
 */
export function HelpTrigger({
  onClick,
  disabled,
  className,
}: HelpTriggerProps) {
  const { t } = useTranslation('shell')

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(className)}
      onClick={onClick}
      disabled={disabled}
      aria-label={t('help.aria_label', 'Help and support')}
      title={t('help.tooltip', 'Help')}
    >
      <CircleHelpIcon aria-hidden="true" />
    </Button>
  )
}
