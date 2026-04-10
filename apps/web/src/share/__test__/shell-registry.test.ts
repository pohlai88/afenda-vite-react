/**
 * Shell registry validator — live integration + synthetic `ShellRegistryValidationContext` (no frozen policy mutation).
 *
 * **Coverage layout**
 * - Live: `validateShellRegistry()` smoke.
 * - Synthetic: `structuredClone` + `buildShellRegistryValidationContextFromImports()`; tweak `registry`, `slotPolicy`, or `slotContracts` to trigger a `ShellRegistryIssueCode`.
 *
 * **Template — issue code → typical lever** (add tests incrementally; many need coordinated `slotContracts` / `slotPolicy` slices)
 *
 * | Code | Lever |
 * |------|--------|
 * | `REGISTRY_KEY_CONTRACT_KEY_MISMATCH` | `registry[key].key` ≠ registry map key |
 * | `DUPLICATE_CONTRACT_KEY` | two registry entries share same `contract.key` |
 * | `SHELL_AWARE_MISSING_ZONE` | `shellAware: true`, `zone: null` |
 * | `SHELL_AGNOSTIC_HAS_ZONE` | `shellAware: false`, `zone` non-null |
 * | `SHELL_AGNOSTIC_HAS_DEPENDENCY` | `shellAware: false`, some `participation.*` ≠ `"none"` |
 * | `OUTSIDE_SHELL_PROVIDER_WITH_REQUIRED_METADATA` | `shellMetadata === "required"` and `allowOutsideShellProvider` |
 * | `MISSING_SLOT_MAPPING` | omit `componentToSlot[registryKey]` or unknown slot id |
 * | `SLOT_ZONE_MISMATCH` | shell-aware `contract.zone` ≠ slot descriptor zone |
 * | `SLOT_KIND_NOT_ALLOWED` | `contract.kind` not in slot contract `allowedComponentKinds` |
 * | `FRAME_COMPONENT_IN_NON_FRAME_SLOT` / `OCCUPANT_COMPONENT_IN_FRAME_SLOT` | owner keys × `structuralFrameSlotIds` × slot mapping |
 * | `STRUCTURAL_FRAME_SLOT_OWNER_MISMATCH` | zero or many owners for a `*.frame` slot |
 * | `SLOT_CONTRACT_*` / parent-frame codes | `slotContracts` vs `slotPolicy.slots` and `parentFrameSlot` graph |
 * | `SINGLETON_SLOT_CONFLICT` | `enforceSingletonSlotUniqueness` + multiple keys mapping to same singleton slot |
 */
import { describe, expect, it } from "vitest"

import {
  ShellRegistryIssueCode,
  buildShellRegistryValidationContextFromImports,
  collectShellRegistryIssues,
  validateShellRegistry,
  validateShellRegistryWithContext,
} from "@afenda/shadcn-ui/lib/constant/policy/shell/validation/validate-shell-registry"

describe("validateShellRegistry", () => {
  it("passes for the checked-in registry and policies", () => {
    const report = validateShellRegistry()
    expect(report.ok, report.issues.map((i) => `${i.code}: ${i.message}`).join("\n")).toBe(
      true
    )
    expect(report.issues).toHaveLength(0)
  })

  it("flags registry key vs contract key mismatch", () => {
    const base = buildShellRegistryValidationContextFromImports()
    const registry = structuredClone(base.registry)
    const header = registry["shell-header"]
    if (!header) throw new Error("expected shell-header in registry")
    registry["shell-header"] = { ...header, key: "not-matching-contract-key" }
    const issues = collectShellRegistryIssues({ ...base, registry })
    expect(
      issues.some(
        (i) =>
          i.code === ShellRegistryIssueCode.REGISTRY_KEY_CONTRACT_KEY_MISMATCH &&
          i.registryKey === "shell-header"
      )
    ).toBe(true)
  })

  it("flags duplicate contract keys across registry entries", () => {
    const base = buildShellRegistryValidationContextFromImports()
    const registry = structuredClone(base.registry)
    const header = registry["shell-header"]
    if (!header) throw new Error("expected shell-header in registry")
    registry["shell-title"] = structuredClone(header)
    const issues = collectShellRegistryIssues({ ...base, registry })
    expect(
      issues.some(
        (i) =>
          i.code === ShellRegistryIssueCode.DUPLICATE_CONTRACT_KEY &&
          i.registryKey === "shell-title"
      )
    ).toBe(true)
  })

  it("flags missing componentToSlot mapping", () => {
    const base = buildShellRegistryValidationContextFromImports()
    const componentToSlot = {
      ...base.slotPolicy.componentToSlot,
      "shell-header": undefined,
    }
    const issues = collectShellRegistryIssues({
      ...base,
      slotPolicy: { ...base.slotPolicy, componentToSlot },
    })
    expect(
      issues.some(
        (i) =>
          i.code === ShellRegistryIssueCode.MISSING_SLOT_MAPPING &&
          i.registryKey === "shell-header"
      )
    ).toBe(true)
  })

  it("flags shell-aware component without zone", () => {
    const base = buildShellRegistryValidationContextFromImports()
    const registry = structuredClone(base.registry)
    const header = registry["shell-header"]
    if (!header) throw new Error("expected shell-header in registry")
    registry["shell-header"] = { ...header, shellAware: true, zone: null }
    const issues = collectShellRegistryIssues({ ...base, registry })
    expect(
      issues.some(
        (i) =>
          i.code === ShellRegistryIssueCode.SHELL_AWARE_MISSING_ZONE &&
          i.registryKey === "shell-header"
      )
    ).toBe(true)
  })

  it("flags shell-agnostic component with a zone", () => {
    const base = buildShellRegistryValidationContextFromImports()
    const registry = structuredClone(base.registry)
    const header = registry["shell-header"]
    if (!header) throw new Error("expected shell-header in registry")
    registry["shell-header"] = {
      ...header,
      shellAware: false,
      zone: "header",
    }
    const issues = collectShellRegistryIssues({ ...base, registry })
    expect(
      issues.some(
        (i) =>
          i.code === ShellRegistryIssueCode.SHELL_AGNOSTIC_HAS_ZONE &&
          i.registryKey === "shell-header"
      )
    ).toBe(true)
  })

  it("flags outside-shell-provider with required shell metadata", () => {
    const base = buildShellRegistryValidationContextFromImports()
    const registry = structuredClone(base.registry)
    const header = registry["shell-header"]
    if (!header) throw new Error("expected shell-header in registry")
    registry["shell-header"] = {
      ...header,
      allowOutsideShellProvider: true,
    }
    const issues = collectShellRegistryIssues({ ...base, registry })
    expect(
      issues.some(
        (i) =>
          i.code === ShellRegistryIssueCode.OUTSIDE_SHELL_PROVIDER_WITH_REQUIRED_METADATA &&
          i.registryKey === "shell-header"
      )
    ).toBe(true)
  })

  it("exposes validateWithContext on the report helper", () => {
    const ctx = buildShellRegistryValidationContextFromImports()
    const report = validateShellRegistryWithContext(ctx)
    expect(report.ok).toBe(true)
  })
})
