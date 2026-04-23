"use client"

import { Building2 } from "lucide-react"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { Badge } from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

import { useOptionalTenantScope } from "../../../tenant"

export type ShellTopNavTenantIndicatorProps = {
  readonly className?: string
}

export function ShellTopNavTenantIndicator({
  className,
}: ShellTopNavTenantIndicatorProps) {
  const { t } = useTranslation("shell")
  const tenantScope = useOptionalTenantScope()

  const selectedTenant = useMemo(() => {
    if (tenantScope?.status !== "ready" || !tenantScope.selectedTenantId) {
      return null
    }

    return (
      tenantScope.tenantChoices.find(
        (candidate) => candidate.tenantId === tenantScope.selectedTenantId
      ) ?? null
    )
  }, [tenantScope])

  if (!selectedTenant) {
    return null
  }

  return (
    <Badge
      variant="outline"
      title={selectedTenant.tenantName}
      className={cn(
        "inline-flex h-[1.75rem] max-w-[10.5rem] items-center gap-1.5 rounded-full border-border-muted bg-card/70 px-2.5 text-[11px] font-medium text-foreground shadow-sm sm:max-w-[12.5rem]",
        className
      )}
    >
      <Building2
        className="size-3.5 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <span className="truncate">
        {t("top_nav.tenant_indicator_prefix")}: {selectedTenant.tenantName}
      </span>
    </Badge>
  )
}
