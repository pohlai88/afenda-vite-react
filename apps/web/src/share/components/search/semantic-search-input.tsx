import { useCallback, useEffect, useRef } from "react"
import { SearchIcon, SparklesIcon, XIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Badge } from "@afenda/shadcn-ui/components/ui/badge"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@afenda/shadcn-ui/components/ui/input-group"
import { cn } from "@afenda/shadcn-ui/lib/utils"

export interface SemanticSearchInputProps {
  value: string
  onChange: (value: string) => void
  onSearch?: (query: string) => void
  placeholder?: string
  debounceMs?: number
  showSemanticIndicator?: boolean
  searchMethod?: "semantic" | "text" | null
  className?: string
  /** Passed to the inner text field for a11y and forms. */
  id?: string
  "aria-label"?: string
}

export function SemanticSearchInput({
  value,
  onChange,
  onSearch,
  placeholder,
  debounceMs = 300,
  showSemanticIndicator = true,
  searchMethod = null,
  className,
  id,
  "aria-label": ariaLabel,
}: SemanticSearchInputProps) {
  const { t } = useTranslation("shell")
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )

  const resolvedPlaceholder = placeholder ?? t("semantic_search.placeholder")

  const scheduleSearch = useCallback(
    (next: string) => {
      if (!onSearch) return
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      debounceTimeoutRef.current = setTimeout(() => {
        onSearch(next)
      }, debounceMs)
    },
    [onSearch, debounceMs]
  )

  const handleChange = useCallback(
    (newValue: string) => {
      onChange(newValue)
      scheduleSearch(newValue)
    },
    [onChange, scheduleSearch]
  )

  const handleClear = useCallback(() => {
    onChange("")
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    onSearch?.("")
  }, [onChange, onSearch])

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const showClear = value.length > 0

  return (
    <InputGroup className={cn("w-full", className)}>
      <InputGroupAddon align="inline-start">
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        type="search"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={resolvedPlaceholder}
        aria-label={ariaLabel ?? resolvedPlaceholder}
      />
      <InputGroupAddon align="inline-end">
        {showSemanticIndicator && searchMethod === "semantic" ? (
          <Badge variant="secondary" className="hidden sm:inline-flex">
            <SparklesIcon />
            {t("semantic_search.semantic_badge")}
          </Badge>
        ) : null}
        {showClear ? (
          <InputGroupButton
            type="button"
            size="icon-xs"
            aria-label={t("semantic_search.clear")}
            onClick={handleClear}
          >
            <XIcon />
          </InputGroupButton>
        ) : null}
      </InputGroupAddon>
    </InputGroup>
  )
}
