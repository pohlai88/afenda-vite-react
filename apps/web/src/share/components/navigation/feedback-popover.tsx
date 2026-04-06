import { AlertTriangleIcon, LightbulbIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@afenda/ui/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@afenda/ui/components/ui/popover'

import { FeedbackTrigger } from '../block-ui'

export interface FeedbackPopoverProps {
  /** Called when user selects "Issue" */
  onIssue?: () => void
  /** Called when user selects "Idea" */
  onIdea?: () => void
  className?: string
}

/**
 * FeedbackPopover provides a structured feedback chooser (Supabase-style).
 * Two card options: Report an issue or Share an idea.
 */
export function FeedbackPopover({
  onIssue,
  onIdea,
  className,
}: FeedbackPopoverProps) {
  const { t } = useTranslation('shell')

  return (
    <Popover>
      <PopoverTrigger asChild>
        <FeedbackTrigger className={className} />
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <h3 className="mb-3 text-sm font-semibold">
          {t('feedback.heading', 'What would you like to share?')}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <FeedbackCard
            icon={<AlertTriangleIcon className="size-6 text-amber-500" />}
            title={t('feedback.issue_title', 'Issue')}
            subtitle={t('feedback.issue_subtitle', 'with my project')}
            onClick={onIssue}
          />
          <FeedbackCard
            icon={<LightbulbIcon className="size-6 text-yellow-500" />}
            title={t('feedback.idea_title', 'Idea')}
            subtitle={t('feedback.idea_subtitle', 'to improve Afenda')}
            onClick={onIdea}
          />
        </div>
      </PopoverContent>
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
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card p-4 text-center',
        'transition-colors hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      )}
    >
      {icon}
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
    </button>
  )
}
