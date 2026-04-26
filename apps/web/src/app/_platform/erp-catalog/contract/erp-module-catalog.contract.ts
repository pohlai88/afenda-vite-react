export type ErpModuleLifecycle = "enabled" | "planned" | "deprecated"

export type ErpModuleKind = "erp-module" | "platform-module" | "settings-module"

export interface ErpModuleMetadata {
  readonly moduleId: string
  readonly routeId: string
  readonly pathSegment: string
  readonly kind: ErpModuleKind
  readonly lifecycle: ErpModuleLifecycle
  readonly navLabelKey: string
  readonly titleKey: string
  readonly groupId: string
  readonly permissionKeys: readonly string[]
  readonly legacyReferencePaths?: readonly string[]
}

export type ErpModuleCatalogValidationCode =
  | "empty-module-id"
  | "empty-route-id"
  | "empty-path-segment"
  | "empty-label-key"
  | "empty-title-key"
  | "empty-group-id"
  | "duplicate-module-id"
  | "duplicate-route-id"
  | "duplicate-path-segment"
  | "invalid-permission-key"
  | "invalid-legacy-reference-path"

export interface ErpModuleCatalogValidationIssue {
  readonly code: ErpModuleCatalogValidationCode
  readonly path: string
  readonly message: string
}
