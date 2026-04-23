import type {
  AppSurfaceActionSpec,
  AppSurfaceContract,
  AppSurfaceSectionSpec,
} from "../contract/app-surface-contract"

function hasUniqueIds<T extends { readonly id: string }>(
  items: readonly T[]
): boolean {
  return new Set(items.map((item) => item.id)).size === items.length
}

function hasUniqueSectionIds(items: readonly AppSurfaceSectionSpec[]): boolean {
  return new Set(items.map((item) => item.id)).size === items.length
}

function isValidActionSpec(action: AppSurfaceActionSpec): boolean {
  if (action.kind === "link") {
    return typeof action.href === "string" && action.href.length > 0
  }

  return typeof action.onAction === "function"
}

export function validateAppSurfaceContract(contract: AppSurfaceContract): void {
  if (!contract.header.title.trim()) {
    throw new Error("app_surface_contract_invalid:missing_header_title")
  }

  if (!contract.header.description.trim()) {
    throw new Error("app_surface_contract_invalid:missing_header_description")
  }

  if (!hasUniqueSectionIds(contract.content.sections)) {
    throw new Error("app_surface_contract_invalid:duplicate_section_ids")
  }

  if (contract.metaRow && !hasUniqueIds(contract.metaRow.items)) {
    throw new Error("app_surface_contract_invalid:duplicate_meta_ids")
  }

  if (contract.header.actions && !hasUniqueIds(contract.header.actions)) {
    throw new Error("app_surface_contract_invalid:duplicate_action_ids")
  }

  if (
    contract.header.actions &&
    !contract.header.actions.every(isValidActionSpec)
  ) {
    throw new Error("app_surface_contract_invalid:invalid_action_spec")
  }

  for (const kind of ["loading", "empty", "failure", "forbidden"] as const) {
    const stateSpec = contract.stateSurface[kind]
    if (!stateSpec.title.trim() || !stateSpec.description.trim()) {
      throw new Error(`app_surface_contract_invalid:missing_state_spec:${kind}`)
    }
  }
}
