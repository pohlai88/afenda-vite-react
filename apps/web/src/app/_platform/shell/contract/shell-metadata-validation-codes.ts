/**
 * Stable codes for per-route shell metadata validation (`validateShellMetadata`).
 * Web-local catalog — do not import the workspace database package audit registries.
 */

export const shellMetadataValidationCodes = {
  EMPTY_TITLE_KEY: "SHELL_METADATA_EMPTY_TITLE_KEY",
  EMPTY_BREADCRUMB_ID: "SHELL_METADATA_EMPTY_BREADCRUMB_ID",
  DUPLICATE_BREADCRUMB_ID: "SHELL_METADATA_DUPLICATE_BREADCRUMB_ID",
  EMPTY_BREADCRUMB_LABEL_KEY: "SHELL_METADATA_EMPTY_BREADCRUMB_LABEL_KEY",
  EMPTY_BREADCRUMB_TO: "SHELL_METADATA_EMPTY_BREADCRUMB_TO",

  DUPLICATE_HEADER_ACTION_ID: "SHELL_METADATA_DUPLICATE_HEADER_ACTION_ID",
  INVALID_HEADER_ACTION_LABEL_KEY:
    "SHELL_METADATA_INVALID_HEADER_ACTION_LABEL_KEY",
  INVALID_HEADER_ACTION_KIND: "SHELL_METADATA_INVALID_HEADER_ACTION_KIND",
  INVALID_HEADER_ACTION_TARGET: "SHELL_METADATA_INVALID_HEADER_ACTION_TARGET",
  INVALID_HEADER_ACTION_COMMAND_ID:
    "SHELL_METADATA_INVALID_HEADER_ACTION_COMMAND_ID",
  CONTRADICTORY_HEADER_ACTION_PAYLOAD:
    "SHELL_METADATA_CONTRADICTORY_HEADER_ACTION_PAYLOAD",
} as const

export type ShellMetadataValidationCode =
  (typeof shellMetadataValidationCodes)[keyof typeof shellMetadataValidationCodes]

/** All field-validation codes (for tooling, tests, and drift checks). */
export const shellMetadataValidationCodeList: readonly ShellMetadataValidationCode[] =
  Object.freeze(
    Object.values(shellMetadataValidationCodes) as ShellMetadataValidationCode[]
  )
