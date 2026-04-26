import type {
  ErpModuleCatalogValidationIssue,
  ErpModuleMetadata,
} from "../contract/erp-module-catalog.contract"

function pushEmptyFieldIssue(
  issues: ErpModuleCatalogValidationIssue[],
  options: {
    readonly code: ErpModuleCatalogValidationIssue["code"]
    readonly index: number
    readonly field: keyof ErpModuleMetadata
  }
): void {
  issues.push({
    code: options.code,
    path: `[${options.index}].${String(options.field)}`,
    message: `ERP module catalog ${String(options.field)} must not be empty.`,
  })
}

function collectDuplicateIssues(
  values: readonly string[],
  field: "moduleId" | "routeId" | "pathSegment",
  code: "duplicate-module-id" | "duplicate-route-id" | "duplicate-path-segment"
): readonly ErpModuleCatalogValidationIssue[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value)
    }
    seen.add(value)
  }

  return [...duplicates].map((value) => ({
    code,
    path: field,
    message: `Duplicate ERP module catalog ${field} "${value}" detected.`,
  }))
}

export function validateErpModuleCatalog(
  catalog: readonly ErpModuleMetadata[]
): readonly ErpModuleCatalogValidationIssue[] {
  const issues: ErpModuleCatalogValidationIssue[] = []

  catalog.forEach((module, index) => {
    if (module.moduleId.trim().length === 0) {
      pushEmptyFieldIssue(issues, {
        code: "empty-module-id",
        index,
        field: "moduleId",
      })
    }

    if (module.routeId.trim().length === 0) {
      pushEmptyFieldIssue(issues, {
        code: "empty-route-id",
        index,
        field: "routeId",
      })
    }

    if (module.pathSegment.trim().length === 0) {
      pushEmptyFieldIssue(issues, {
        code: "empty-path-segment",
        index,
        field: "pathSegment",
      })
    }

    if (module.navLabelKey.trim().length === 0) {
      pushEmptyFieldIssue(issues, {
        code: "empty-label-key",
        index,
        field: "navLabelKey",
      })
    }

    if (module.titleKey.trim().length === 0) {
      pushEmptyFieldIssue(issues, {
        code: "empty-title-key",
        index,
        field: "titleKey",
      })
    }

    if (module.groupId.trim().length === 0) {
      pushEmptyFieldIssue(issues, {
        code: "empty-group-id",
        index,
        field: "groupId",
      })
    }

    module.permissionKeys.forEach((permissionKey, permissionIndex) => {
      if (permissionKey.trim().length === 0) {
        issues.push({
          code: "invalid-permission-key",
          path: `[${index}].permissionKeys[${permissionIndex}]`,
          message: "ERP module catalog permission keys must not be empty.",
        })
      }
    })

    module.legacyReferencePaths?.forEach((legacyPath, legacyIndex) => {
      if (!legacyPath.startsWith(".legacy/cna-templates/")) {
        issues.push({
          code: "invalid-legacy-reference-path",
          path: `[${index}].legacyReferencePaths[${legacyIndex}]`,
          message:
            "ERP module catalog legacy references must stay inside .legacy/cna-templates.",
        })
      }
    })
  })

  return [
    ...issues,
    ...collectDuplicateIssues(
      catalog.map((module) => module.moduleId),
      "moduleId",
      "duplicate-module-id"
    ),
    ...collectDuplicateIssues(
      catalog.map((module) => module.routeId),
      "routeId",
      "duplicate-route-id"
    ),
    ...collectDuplicateIssues(
      catalog.map((module) => module.pathSegment),
      "pathSegment",
      "duplicate-path-segment"
    ),
  ]
}
