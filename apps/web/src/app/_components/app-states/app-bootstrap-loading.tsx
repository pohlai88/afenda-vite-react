import { useTranslation } from "react-i18next"

import { Spinner } from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

/**
 * Full-frame Suspense fallback for the app root (`App.tsx`) and other top-level boundaries.
 */
export function AppBootstrapLoading({
  className,
}: {
  readonly className?: string
}) {
  const { t } = useTranslation("shell")

  return (
    <div
      className={cn(
        "flex min-h-svh flex-col items-center justify-center gap-3 bg-background p-6 text-muted-foreground",
        className
      )}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <Spinner className="size-8" aria-hidden />
      <p className="text-sm">{t("loading.erp_system")}</p>
    </div>
  )
}
