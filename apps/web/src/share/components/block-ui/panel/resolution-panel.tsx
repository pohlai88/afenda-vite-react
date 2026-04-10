import {
  CheckCircleIcon,
  ChevronRightIcon,
  SparklesIcon,
  SendIcon,
} from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { Badge } from "@afenda/shadcn-ui/components/ui/badge"
import { Button } from "@afenda/shadcn-ui/components/ui/button"
import { Input } from "@afenda/shadcn-ui/components/ui/input"
import {
  Popover,
  PopoverTrigger,
} from "@afenda/shadcn-ui/components/ui/popover"

import { ShellPopoverContent } from "@/share/components/shell-ui"
import { Separator } from "@afenda/shadcn-ui/components/ui/separator"

import type { ResolutionSuggestion } from "@/share/types"

import { getIntegritySeverityPresentation } from "@afenda/shadcn-ui/semantic"
import { ResolutionTrigger } from "../trigger"

export interface ResolutionPanelProps {
  /** List of resolution suggestions */
  suggestions?: readonly ResolutionSuggestion[]
  /** Called when user selects a resolution to apply */
  onResolve?: (suggestion: ResolutionSuggestion) => void
  /** Called when user submits a question to the AI assistant */
  onAskAssistant?: (question: string) => void
  /** Merged into {@link ResolutionTrigger} (e.g. top nav icon rail). */
  triggerClassName?: string
}

/**
 * ResolutionPanel: anchored popover (dropdown-style) opened by {@link ResolutionTrigger}.
 * Lists suggested fixes and the assistant field—similar to quick panels on other shell triggers.
 */
export function ResolutionPanel({
  suggestions = [],
  onResolve,
  onAskAssistant,
  triggerClassName,
}: ResolutionPanelProps) {
  const { t } = useTranslation("shell")
  const [question, setQuestion] = useState("")
  const [open, setOpen] = useState(false)
  const validTone = getIntegritySeverityPresentation("valid")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (question.trim() && onAskAssistant) {
      onAskAssistant(question.trim())
      setQuestion("")
    }
  }

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ResolutionTrigger
          unresolvedCount={suggestions.length}
          className={triggerClassName}
        />
      </PopoverTrigger>
      <ShellPopoverContent
        shellVariant="topRail"
        className="flex w-96 flex-col gap-0 overflow-hidden p-0"
      >
        <div className="border-b border-border px-4 py-3">
          <h2
            id="resolution-panel-title"
            className="flex items-center gap-2 text-base leading-tight font-semibold"
          >
            <SparklesIcon className="size-5 shrink-0" aria-hidden />
            {t("resolution.title", "Resolution Center")}
            {suggestions.length > 0 ? (
              <Badge
                variant="secondary"
                className="bg-warning/15 text-warning hover:bg-warning/15"
              >
                {suggestions.length}
              </Badge>
            ) : null}
          </h2>
        </div>

        <div
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
          role="region"
          aria-labelledby="resolution-panel-title"
        >
          {suggestions.length > 0 ? (
            <section>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                {t("resolution.suggested_fixes", "Suggested fixes")}
              </h3>
              <ul className="flex flex-col gap-2">
                {suggestions.map((suggestion) => (
                  <li key={suggestion.id}>
                    <ResolutionCard
                      suggestion={suggestion}
                      onResolve={() => {
                        onResolve?.(suggestion)
                        setOpen(false)
                      }}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircleIcon
                className={`mb-2 size-10 ${validTone.textClassName}`}
                aria-hidden="true"
              />
              <p className="text-sm font-medium">
                {t("resolution.all_resolved", "All issues resolved")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("resolution.no_issues", "No outstanding issues to resolve.")}
              </p>
            </div>
          )}

          <Separator />

          <section>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              {t("resolution.ask_assistant", "Ask Assistant")}
            </h3>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t(
                  "resolution.ask_placeholder",
                  "I am having trouble with..."
                )}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!question.trim()}>
                <SendIcon className="size-4" aria-hidden />
                <span className="sr-only">{t("resolution.send", "Send")}</span>
              </Button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">
              {t(
                "resolution.assistant_note",
                "AI-powered assistance coming soon."
              )}
            </p>
          </section>
        </div>
      </ShellPopoverContent>
    </Popover>
  )
}

interface ResolutionCardProps {
  suggestion: ResolutionSuggestion
  onResolve?: () => void
}

function ResolutionCard({ suggestion, onResolve }: ResolutionCardProps) {
  const { t } = useTranslation("shell")

  const confidencePercent = Math.round(suggestion.confidence * 100)
  const resolutionTypeLabel =
    suggestion.resolution.type === "auto"
      ? t("resolution.type_auto", "Auto-fix")
      : suggestion.resolution.type === "assisted"
        ? t("resolution.type_assisted", "Assisted")
        : t("resolution.type_manual", "Manual")

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{suggestion.description}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {suggestion.suggestedAction}
          </p>
        </div>
        <Badge variant="secondary">{resolutionTypeLabel}</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {t("resolution.confidence", "Confidence")}: {confidencePercent}%
        </span>
        <Button variant="ghost" size="sm" onClick={onResolve} className="h-7">
          {t("resolution.apply", "Apply")}
          <ChevronRightIcon className="ml-1 size-3" aria-hidden />
        </Button>
      </div>
    </div>
  )
}
