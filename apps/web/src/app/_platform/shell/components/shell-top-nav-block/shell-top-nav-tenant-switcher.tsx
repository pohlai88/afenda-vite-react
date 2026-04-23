"use client"

import { AlertCircle } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  Button,
  NativeSelect,
  NativeSelectOption,
  Spinner,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@afenda/design-system/ui-primitives"

import {
  activateAuthTenantContext,
  type AuthTenantCandidate,
  useAfendaSession,
} from "../../../auth"
import { useOptionalTenantScope } from "../../../tenant"

const EMPTY_TENANT_CHOICES: readonly AuthTenantCandidate[] = []

export function ShellTopNavTenantSwitcher() {
  const { t } = useTranslation("shell")
  const sessionQuery = useAfendaSession()
  const tenantScope = useOptionalTenantScope()
  const [isSwitching, setIsSwitching] = useState(false)
  const [switchError, setSwitchError] = useState<string | null>(null)

  const activeTenantId =
    tenantScope?.status === "ready" ? tenantScope.selectedTenantId : null

  const tenantChoices =
    tenantScope?.status === "ready"
      ? tenantScope.tenantChoices
      : EMPTY_TENANT_CHOICES

  const hasMultipleTenantChoices = tenantChoices.length > 1

  const activeLabel = useMemo(() => {
    if (!activeTenantId) {
      return null
    }

    return (
      tenantChoices.find((candidate) => candidate.tenantId === activeTenantId)
        ?.tenantName ?? null
    )
  }, [activeTenantId, tenantChoices])

  const handleSelectTenant = useCallback(
    async (nextTenantId: string) => {
      if (
        tenantScope === null ||
        tenantScope.status !== "ready" ||
        nextTenantId === tenantScope.selectedTenantId
      ) {
        return
      }

      setIsSwitching(true)
      setSwitchError(null)

      try {
        await activateAuthTenantContext(nextTenantId)
        tenantScope.setSelectedTenantId(nextTenantId)
        await sessionQuery.refetch()
      } catch {
        setSwitchError(t("top_nav.tenant_switcher_switch_error"))
      } finally {
        setIsSwitching(false)
      }
    },
    [sessionQuery, t, tenantScope]
  )

  if (
    tenantScope === null ||
    tenantScope.status !== "ready" ||
    !sessionQuery.data?.session
  ) {
    return null
  }

  if (!hasMultipleTenantChoices) {
    return null
  }

  return (
    <div className="flex items-center gap-[0.375rem]">
      <NativeSelect
        size="sm"
        aria-label={t("top_nav.tenant_switcher_aria")}
        title={activeLabel ?? undefined}
        value={activeTenantId ?? ""}
        disabled={isSwitching}
        onChange={(event) => {
          void handleSelectTenant(event.currentTarget.value)
        }}
        className="h-[2.25rem] min-w-[11.5rem] rounded-full border-border-muted bg-card/70 pr-9 pl-3 text-xs text-foreground shadow-sm hover:border-border focus-visible:ring-2 focus-visible:ring-ring"
      >
        {tenantChoices.map((candidate) => (
          <NativeSelectOption
            key={candidate.membershipId}
            value={candidate.tenantId}
          >
            {candidate.isDefault
              ? `${candidate.tenantName} (${t("top_nav.tenant_switcher_default")})`
              : candidate.tenantName}
          </NativeSelectOption>
        ))}
      </NativeSelect>

      {isSwitching ? (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Spinner />
          {t("top_nav.tenant_switcher_switching")}
        </span>
      ) : null}

      {switchError ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15"
              aria-label={switchError}
              onClick={() => {
                setSwitchError(null)
              }}
            >
              <AlertCircle className="size-4" strokeWidth={1.5} aria-hidden />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{switchError}</TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  )
}
