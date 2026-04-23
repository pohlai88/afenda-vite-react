import { useMemo } from "react"

import { useOptionalTenantScope } from "../../tenant"

export function useShellPermissions(): readonly string[] {
  const scope = useOptionalTenantScope()

  return useMemo(() => {
    if (scope?.status !== "ready") {
      return []
    }

    return scope.me.actor?.permissions ?? []
  }, [scope])
}
