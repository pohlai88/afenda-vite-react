export type NamingContractScope = "root" | "app" | "package" | "unknown"

export type NamingContractRole =
  | "adapter"
  | "command"
  | "commands"
  | "contract"
  | "context"
  | "generated"
  | "model"
  | "policy"
  | "projection"
  | "provider"
  | "registry"
  | "repo"
  | "route"
  | "routes"
  | "schema"
  | "service"
  | "spec"
  | "state-machine"
  | "store"
  | "stories"
  | "test"
  | "types"
  | "validator"
  | "writer"

export interface NamingContract {
  readonly path: string
  readonly fileName: string
  readonly stem: string
  readonly extension: string
  readonly scope: NamingContractScope
  readonly ownershipPath: string
  readonly directoryName: string | null
  readonly pathSegments: readonly string[]
  readonly subjectStem: string
  readonly primarySubject: string | null
  readonly roleSegments: readonly NamingContractRole[]
  readonly isIndex: boolean
  readonly isRoleOnly: boolean
}

export interface NamingContractValidationOptions {
  readonly bannedGenericSubjects?: readonly string[]
  readonly allowSpecialStems?: readonly string[]
  readonly requiredRoleByDirectoryName?: Readonly<
    Partial<Record<string, readonly NamingContractRole[]>>
  >
}

export interface NamingContractViolation {
  readonly severity: "error" | "warn"
  readonly rule: string
  readonly path: string
  readonly message: string
}
