/**
 * GOVERNANCE — path → scope + effective token thresholds
 *
 * **Keep in sync** with `packages/eslint-config/afenda-ui-plugin/utils/class-governance-scope.cjs`
 * (same path predicates and order: shell-ui before generic share).
 *
 * ### Scope → `classPolicy.scopes` fallback semantics (single rule for all consumers)
 *
 * 1. `resolveClassGovernanceScope(filePath)` returns a lane or `null`.
 * 2. If `null`, use only global fields: `maxRecommendedClassNameTokensInFeatures`,
 *    `warnClassNameTokenCount`, `errorClassNameTokenCount` — **no** `scopes` merge.
 * 3. If a lane is returned, look up `classPolicy.scopes[<laneKey>]`. If that entry is missing,
 *    use the same globals as (2) for all three numbers.
 * 4. If a scope hints object exists, each numeric field **falls back independently** to its
 *    global when omitted: absent `warnClassNameTokenCount` in hints → global warn.
 * 5. `scopes: {}` means every lane uses globals (no overrides).
 *
 * Do not invent other merge rules in drift scripts or ESLint helpers.
 */
import type { ClassPolicy } from "./class-policy"

export type ClassGovernanceScope =
  | "ui-package"
  | "feature-ui"
  | "shared-app-ui"
  | "app-shell"
  | "chart-interop"
  | "rich-content"

export function resolveClassGovernanceScope(
  filePath: string
): ClassGovernanceScope | null {
  const normalized = String(filePath).replace(/\\/g, "/")

  if (normalized.includes("packages/shadcn-ui/src/")) return "ui-package"
  if (normalized.includes("apps/web/src/share/components/shell-ui/")) return "app-shell"
  if (normalized.includes("apps/web/src/features/")) return "feature-ui"
  if (normalized.includes("apps/web/src/share/")) return "shared-app-ui"
  if (normalized.includes("/chart/") || normalized.includes("/charts/")) {
    return "chart-interop"
  }
  if (
    normalized.includes("/rich-content/") ||
    normalized.includes("/editor/") ||
    normalized.includes("/markdown/")
  ) {
    return "rich-content"
  }

  return null
}

const SCOPE_TO_POLICY_KEY: Record<
  ClassGovernanceScope,
  keyof ClassPolicy["scopes"]
> = {
  "ui-package": "uiPackage",
  "feature-ui": "featureUi",
  "shared-app-ui": "sharedAppUi",
  "app-shell": "appShell",
  "chart-interop": "chartInterop",
  "rich-content": "richContent",
}

export interface EffectiveClassPolicyTokenThresholds {
  /** Lane used for `classPolicy.scopes` lookup; `null` means globals only (no scoped hints). */
  resolvedScope: ClassGovernanceScope | null
  maxRecommended: number
  warnTokens: number
  errorTokens: number
}

function pickNumber(global: number, hint: number | undefined): number {
  return hint !== undefined ? hint : global
}

/**
 * Effective Tailwind token-count limits for `filePath` after applying `classPolicy.scopes` hints.
 */
export function resolveEffectiveClassPolicyTokenThresholds(
  classPolicy: ClassPolicy,
  filePath: string
): EffectiveClassPolicyTokenThresholds {
  const gMax = classPolicy.maxRecommendedClassNameTokensInFeatures
  const gWarn = classPolicy.warnClassNameTokenCount
  const gErr = classPolicy.errorClassNameTokenCount

  const scope = resolveClassGovernanceScope(filePath)
  if (scope == null) {
    return {
      resolvedScope: null,
      maxRecommended: gMax,
      warnTokens: gWarn,
      errorTokens: gErr,
    }
  }

  const hints = classPolicy.scopes[SCOPE_TO_POLICY_KEY[scope]]
  if (hints == null) {
    return {
      resolvedScope: scope,
      maxRecommended: gMax,
      warnTokens: gWarn,
      errorTokens: gErr,
    }
  }

  return {
    resolvedScope: scope,
    maxRecommended: pickNumber(gMax, hints.maxRecommendedClassNameTokens),
    warnTokens: pickNumber(gWarn, hints.warnClassNameTokenCount),
    errorTokens: pickNumber(gErr, hints.errorClassNameTokenCount),
  }
}
