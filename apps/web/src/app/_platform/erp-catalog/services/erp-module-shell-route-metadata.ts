import type { ShellRouteMetadata } from "../../shell/contract/shell-route-metadata-contract"
import type { ErpModuleMetadata } from "../contract/erp-module-catalog.contract"

export interface ErpModuleShellRouteDefinition {
  readonly pathSegment: string
  readonly metadata: ShellRouteMetadata
}

export function buildErpModuleShellRouteMetadata(options: {
  readonly appBasePath: string
  readonly module: ErpModuleMetadata
}): ShellRouteMetadata {
  const { appBasePath, module } = options
  const path = `${appBasePath}/${module.pathSegment}`

  return {
    routeId: module.routeId,
    path,
    shell: {
      titleKey: module.titleKey,
      breadcrumbs: [
        { id: "app", labelKey: "breadcrumb.app", to: appBasePath },
        {
          id: module.routeId,
          labelKey: module.titleKey,
          to: path,
        },
      ],
    },
  }
}

export function buildEnabledErpModuleShellRouteDefinitions(options: {
  readonly appBasePath: string
  readonly catalog: readonly ErpModuleMetadata[]
}): readonly ErpModuleShellRouteDefinition[] {
  return options.catalog
    .filter((module) => module.lifecycle === "enabled")
    .map((module) => ({
      pathSegment: module.pathSegment,
      metadata: buildErpModuleShellRouteMetadata({
        appBasePath: options.appBasePath,
        module,
      }),
    }))
}

export function getEnabledErpModulePermissionKeysByPathSegment(
  catalog: readonly ErpModuleMetadata[]
): Readonly<Record<string, readonly string[]>> {
  return Object.fromEntries(
    catalog
      .filter((module) => module.lifecycle === "enabled")
      .map((module) => [module.pathSegment, module.permissionKeys])
  )
}
