import { describe, expect, it } from "vitest"

import {
  DESIGN_SYSTEM_IMPORT_ALLOWLIST_MAP,
  DESIGN_SYSTEM_MODULE_PREFIXES,
  DESIGN_SYSTEM_IMPORT_ALLOWLIST,
  getConsumerImportAllowlistEntry,
  isAllowedDesignSystemImport,
  isAllowedDesignSystemSubpathForConsumer,
  resolveImportAllowlistConsumerId,
} from "../src/governance/import-allowlist"

describe("import-allowlist", () => {
  it("resolves stable repo consumer ids", () => {
    expect(resolveImportAllowlistConsumerId("packages/design-system")).toBe(
      "packages/design-system",
    )
    expect(resolveImportAllowlistConsumerId("@afenda/unknown")).toBeUndefined()
  })

  it("allows package-internal imports across public design-system surfaces", () => {
    expect(
      isAllowedDesignSystemImport(
        "packages/design-system",
        DESIGN_SYSTEM_MODULE_PREFIXES.root,
      ),
    ).toBe(true)
    expect(
      isAllowedDesignSystemImport(
        "packages/design-system",
        `${DESIGN_SYSTEM_MODULE_PREFIXES.utils}/cn`,
      ),
    ).toBe(true)
    expect(
      isAllowedDesignSystemImport(
        "packages/design-system",
        DESIGN_SYSTEM_MODULE_PREFIXES.scripts,
      ),
    ).toBe(true)
    expect(
      isAllowedDesignSystemImport(
        "packages/design-system",
        "@afenda/design-system/design-architecture/local.css",
      ),
    ).toBe(true)
  })

  it("exposes exact subpath membership via isAllowedDesignSystemSubpathForConsumer", () => {
    expect(
      isAllowedDesignSystemSubpathForConsumer(
        "packages/design-system",
        DESIGN_SYSTEM_MODULE_PREFIXES.utils,
      ),
    ).toBe(true)
    expect(
      isAllowedDesignSystemSubpathForConsumer(
        "packages/design-system",
        `${DESIGN_SYSTEM_MODULE_PREFIXES.utils}/cn`,
      ),
    ).toBe(false)
  })

  it("returns undefined for unknown consumers", () => {
    expect(getConsumerImportAllowlistEntry("@afenda/unknown-app")).toBeUndefined()
  })

  it("lists stable consumer ids", () => {
    expect(Object.keys(DESIGN_SYSTEM_IMPORT_ALLOWLIST_MAP).sort()).toEqual(
      ["packages/design-system", "scripts", "tests"].sort(),
    )
    expect(DESIGN_SYSTEM_IMPORT_ALLOWLIST.length).toBe(3)
  })
})
