import { describe, expect, it } from "vitest"

import {
  assertShellRouteCatalog,
  collectShellRouteCatalogIssues,
} from "../services/assert-shell-route-catalog"
import { shellRouteMetadataList } from "../routes/shell-route-definitions"

/**
 * CI / local gate for `shellRouteMetadataList` invariants.
 * Same data path as `pnpm --filter @afenda/web shell:validation-report` → `buildShellValidationReport`.
 */
describe("shell route catalog governance", () => {
  it("has zero catalog invariant issues", () => {
    const issues = collectShellRouteCatalogIssues(shellRouteMetadataList)
    expect(issues, JSON.stringify(issues, null, 2)).toEqual([])
  })

  it("assertShellRouteCatalog does not throw", () => {
    expect(() => assertShellRouteCatalog(shellRouteMetadataList)).not.toThrow()
  })
})
