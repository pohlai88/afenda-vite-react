import { AlertTriangleIcon, LightbulbIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@afenda/ui/components/ui/button'
import {
  Popover,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@afenda/ui/components/ui/popover'

import { ShellPopoverContent } from '@/share/components/shell-ui'

import { FeedbackTrigger } from '../trigger'

export interface FeedbackPopoverProps {
  /** Called when user selects "Issue" */
  onIssue?: () => void
  /** Called when user selects "Idea" */
  onIdea?: () => void
  /** Merged into {@link FeedbackTrigger} (e.g. top nav density). */
  triggerClassName?: string
}

/**
 * FeedbackPopover provides a structured feedback chooser (Supabase-style).
 * Two card options: Report an issue or Share an idea.
 */
export function FeedbackPopover({
  onIssue,
  onIdea,
  triggerClassName,
}: FeedbackPopoverProps) {
  const { t } = useTranslation('shell')

  return (
    <Popover>
      <PopoverTrigger asChild>
        <FeedbackTrigger className={triggerClassName} />
      </PopoverTrigger>
      <ShellPopoverContent shellVariant="topRail">
        <PopoverHeader className="gap-2">
          <PopoverTitle className="text-sm font-semibold">
            {t('feedback.heading', 'What would you like to share?')}
          </PopoverTitle>
        </PopoverHeader>
        <div className="grid grid-cols-2 gap-3">
          <FeedbackCard
            icon={<AlertTriangleIcon className="size-6 text-muted-foreground" />}
            title={t('feedback.issue_title', 'Issue')}
            subtitle={t('feedback.issue_subtitle', 'with my project')}
            onClick={onIssue}
          />
          <FeedbackCard
            icon={<LightbulbIcon className="size-6 text-muted-foreground" />}
            title={t('feedback.idea_title', 'Idea')}
            subtitle={t('feedback.idea_subtitle', 'to improve Afenda')}
            onClick={onIdea}
          />
        </div>
      </ShellPopoverContent>
    </Popover>
  )
}

interface FeedbackCardProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  onClick?: () => void
}

function FeedbackCard({ icon, title, subtitle, onClick }: FeedbackCardProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="h-auto flex-col gap-2 p-4"
    >
      {icon}
      <div className="text-center">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
    </Button>
  )
}
