export type {
  ErpModuleCatalogValidationCode,
  ErpModuleCatalogValidationIssue,
  ErpModuleKind,
  ErpModuleLifecycle,
  ErpModuleMetadata,
} from "./contract/erp-module-catalog.contract"
export { erpModuleCatalog } from "./policy/erp-module-catalog.policy"
export {
  buildEnabledErpModuleShellRouteDefinitions,
  buildErpModuleShellRouteMetadata,
  getEnabledErpModulePermissionKeysByPathSegment,
  type ErpModuleShellRouteDefinition,
} from "./services/erp-module-shell-route-metadata"
export { validateErpModuleCatalog } from "./services/validate-erp-module-catalog"
