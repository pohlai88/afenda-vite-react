import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react"
import { Link } from "react-router-dom"
import { FileTextIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Badge } from "@afenda/shadcn-ui/components/ui/badge"
import { Kbd } from "@afenda/shadcn-ui/components/ui/kbd"
import { Progress } from "@afenda/shadcn-ui/components/ui/progress"
import { Separator } from "@afenda/shadcn-ui/components/ui/separator"
import { Spinner } from "@afenda/shadcn-ui/components/ui/spinner"
import { cn } from "@afenda/shadcn-ui/lib/utils"

import type {
  GlobalSearchResult,
  SearchResultTypePresentation,
} from "@/share/components/providers/global-search-provider.types"

import { SearchOverlayShell } from "./search-overlay-shell"

export interface SearchSuggestionsProps {
  results: readonly GlobalSearchResult[]
  /** Limits keyboard handling to events whose target lies inside this subtree (e.g. wrapper around input + panel). */
  keyboardScopeRef: RefObject<HTMLElement | null>
  /** When false, arrow/enter navigation is not active. */
  active: boolean
  getTypePresentation: (
    type: string
  ) => SearchResultTypePresentation | undefined
  isLoading?: boolean
  onSelect?: (result: GlobalSearchResult) => void
  maxResults?: number
  showSimilarity?: boolean
  className?: string
}

function defaultPresentation(type: string): SearchResultTypePresentation {
  return {
    label: type,
    icon: <FileTextIcon />,
    labelClassName: "text-muted-foreground",
  }
}

export function SearchSuggestions({
  results,
  keyboardScopeRef,
  active,
  getTypePresentation,
  isLoading = false,
  onSelect,
  maxResults = 5,
  showSimilarity = true,
  className,
}: SearchSuggestionsProps) {
  const { t } = useTranslation("shell")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedIdRef = useRef<string | null>(null)

  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])

  const displayResults = useMemo(
    () => results.slice(0, maxResults),
    [results, maxResults]
  )

  const applyPresentation = useCallback(
    (type: string) => getTypePresentation(type) ?? defaultPresentation(type),
    [getTypePresentation]
  )

  useEffect(() => {
    if (!active || displayResults.length === 0) return

    function onKeyDown(e: KeyboardEvent) {
      const root = keyboardScopeRef.current
      if (!root || !root.contains(e.target as Node)) return

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault()
          setSelectedId((prev) => {
            if (displayResults.length === 0) return null
            const cur = prev
              ? displayResults.findIndex((r) => r.id === prev)
              : -1
            const nextIdx = cur < displayResults.length - 1 ? cur + 1 : 0
            return displayResults[nextIdx]?.id ?? null
          })
          break
        }
        case "ArrowUp": {
          e.preventDefault()
          setSelectedId((prev) => {
            if (displayResults.length === 0) return null
            const cur = prev
              ? displayResults.findIndex((r) => r.id === prev)
              : -1
            if (cur === -1) {
              return displayResults[displayResults.length - 1]?.id ?? null
            }
            const nextIdx = cur > 0 ? cur - 1 : displayResults.length - 1
            return displayResults[nextIdx]?.id ?? null
          })
          break
        }
        case "Enter": {
          e.preventDefault()
          const id = selectedIdRef.current
          if (!id) return
          const hit = displayResults.find((r) => r.id === id)
          if (hit) onSelect?.(hit)
          break
        }
        case "Escape": {
          setSelectedId(null)
          break
        }
        default:
          break
      }
    }

    document.addEventListener("keydown", onKeyDown, true)
    return () => document.removeEventListener("keydown", onKeyDown, true)
  }, [active, displayResults, keyboardScopeRef, onSelect])

  if (isLoading) {
    return (
      <SearchOverlayShell
        className={cn("p-4", className)}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="size-4" />
          <span>{t("search_suggestions.searching")}</span>
        </div>
      </SearchOverlayShell>
    )
  }

  if (displayResults.length === 0) {
    return null
  }

  const grouped = displayResults.reduce<Record<string, GlobalSearchResult[]>>(
    (acc, result) => {
      if (!acc[result.type]) acc[result.type] = []
      acc[result.type].push(result)
      return acc
    },
    {}
  )

  return (
    <SearchOverlayShell className={cn("overflow-hidden", className)}>
      <div className="max-h-[300px] overflow-y-auto">
        {Object.entries(grouped).map(([type, typeResults]) => {
          const config = applyPresentation(type)
          return (
            <div key={type}>
              <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <span className={cn("shrink-0", config.labelClassName)}>
                  {config.icon}
                </span>
                <span>{config.label}</span>
              </div>
              {typeResults.map((result) => {
                const isSelected =
                  selectedId !== null && result.id === selectedId

                return (
                  <Link
                    key={result.id}
                    to={result.url}
                    onClick={() => onSelect?.(result)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-accent",
                      isSelected && "bg-accent"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{result.title}</p>
                      {result.subtitle ? (
                        <p className="truncate text-xs text-muted-foreground">
                          {result.subtitle}
                        </p>
                      ) : null}
                    </div>
                    {showSimilarity &&
                    result.similarity !== undefined &&
                    result.similarity > 0 ? (
                      <div className="flex shrink-0 items-center gap-2">
                        <Progress
                          value={result.similarity * 100}
                          className="h-1.5 w-16"
                        />
                        <Badge variant="secondary" className="tabular-nums">
                          {Math.round(result.similarity * 100)}%
                        </Badge>
                      </div>
                    ) : null}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </div>
      <Separator />
      <div className="flex items-center justify-between bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-1">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          <span>{t("search_suggestions.navigate")}</span>
          <span aria-hidden="true">·</span>
          <Kbd>↵</Kbd>
          <span>{t("search_suggestions.select")}</span>
        </div>
        <span>
          {t("search_suggestions.result_count", {
            count: displayResults.length,
          })}
        </span>
      </div>
    </SearchOverlayShell>
  )
}
