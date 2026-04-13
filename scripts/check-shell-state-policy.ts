/**
 * Shell state doctrine + optional repo literal scan.
 *
 * - Doctrine checks (same as validate-constants): fast, always run.
 * - With `scanRepo: true`: scans shell doctrine folders only (see validator) for dotted literals
 *   that are neither state keys nor slot ids.
 *
 * Usage:
 *   pnpm run script:check-shell-state-policy
 */
import { validateShellStatePolicy } from "../packages/shadcn-ui-deprecated/src/lib/constant/policy/shell/validation/validate-shell-state-policy.ts"

const report = validateShellStatePolicy({ scanRepo: true })

if (!report.ok) {
  for (const issue of report.issues) {
    const loc =
      issue.file !== undefined && issue.line !== undefined
        ? ` ${issue.file}:${issue.line}`
        : ""
    console.error(`${issue.code}${loc}: ${issue.message}`)
  }
  process.exit(1)
}

console.log("shell state policy: ok (doctrine + repo scan)")
