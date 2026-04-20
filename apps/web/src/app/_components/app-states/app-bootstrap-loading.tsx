import { useTranslation } from "react-i18next"
import { Loader2Icon } from "lucide-react"

import { Skeleton } from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

/**
 * Full-frame Suspense fallback for the app root (`App.tsx`) and auth guards.
 * Keep this loader intentionally cheap: no WebGL, no heavy runtime work,
 * and no imports that expand the bootstrap critical path.
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
        "ui-stack-tight min-h-svh flex-col items-center justify-center bg-background px-6 py-6 text-center text-muted-foreground",
        className
      )}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="ui-stack-tight items-center" aria-hidden="true">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/10">
          <span translate="no">A</span>
        </div>
        <Loader2Icon className="size-5 animate-spin text-primary" />
      </div>

      <div className="ui-stack-tight w-full max-w-xs items-center">
        <p className="text-sm font-medium text-foreground">
          {t("loading.erp_system")}
        </p>
        <div className="ui-stack-tight w-full" aria-hidden="true">
          <Skeleton className="mx-auto h-2.5 w-40 rounded-full" />
          <Skeleton className="mx-auto h-2.5 w-28 rounded-full" />
        </div>
      </div>
    </div>
  )
}
