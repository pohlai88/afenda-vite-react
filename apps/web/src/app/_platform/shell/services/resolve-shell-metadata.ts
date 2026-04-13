/**
 * RESOLVE SHELL METADATA
 *
 * Small normalization boundary for shell metadata.
 * Keeps hook code lean and makes future selector growth easier.
 *
 * **Governance trace:** catalog resolution modes (`direct` / `fallback` / `none`) for CI
 * artifacts are defined in `build-shell-resolution-trace.ts` (SHELL RESOLUTION DOCTRINE).
 * Runtime route matching stays in `resolve-shell-route-resolution.ts` and hooks.
 */

import type { ShellMetadata } from "../contract/shell-metadata-contract"
import { validateShellMetadata } from "./validate-shell-metadata"

export interface ResolveShellMetadataOptions {
  metadata: ShellMetadata | undefined
  validate?: boolean
  onValidationIssues?: (
    issues: ReturnType<typeof validateShellMetadata>
  ) => void
}

const EMPTY_SHELL_METADATA: ShellMetadata = Object.freeze({})

export function resolveShellMetadata(
  options: ResolveShellMetadataOptions
): ShellMetadata {
  /** Skip field validation when metadata was omitted — avoids treating `{}` sentinel as a governed route. */
  const hadExplicitMetadata = options.metadata !== undefined
  const metadata = options.metadata ?? EMPTY_SHELL_METADATA

  if (options.validate && hadExplicitMetadata) {
    const issues = validateShellMetadata(metadata)

    if (issues.length > 0) {
      options.onValidationIssues?.(issues)
    }
  }

  return metadata
}
