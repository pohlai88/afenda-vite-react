import { useAuth } from "@better-auth-ui/react"

import { cn } from "@afenda/design-system/utils"
import { DeleteUser } from "./delete-user"

export type DangerZoneProps = {
  className?: string
}

/**
 * Renders the danger zone heading and {@link DeleteUser}.
 * Gate with `deleteUser.enabled` at the call site (e.g. {@link SecuritySettings}).
 */
export function DangerZone({ className }: DangerZoneProps) {
  const { localization } = useAuth()

  return (
    <div className={cn("space-y-3", className)}>
      <h2 className="text-base font-semibold tracking-[-0.02em]">
        {localization.settings.dangerZone}
      </h2>

      <DeleteUser />
    </div>
  )
}
