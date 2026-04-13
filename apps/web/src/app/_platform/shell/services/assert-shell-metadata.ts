import type { ShellRouteMetadata } from "../contract/shell-route-metadata-contract"
import type { ShellMetadata } from "../contract/shell-metadata-contract"
import { mapShellMetadataValidationToShellInvariant } from "./assert-shell-route-catalog"
import { createShellInvariantError } from "./shell-invariant-error-map"
import { validateShellMetadata } from "./validate-shell-metadata"

export function assertShellMetadata(
  metadata: ShellMetadata,
  pathPrefix = "shell"
): void {
  const raw = validateShellMetadata(metadata)
  if (raw.length === 0) {
    return
  }
  const route: ShellRouteMetadata = {
    routeId: "_assert",
    path: pathPrefix,
    shell: metadata,
  }
  const issues = raw.map((issue) =>
    mapShellMetadataValidationToShellInvariant(route, issue, pathPrefix)
  )
  throw createShellInvariantError(issues)
}
