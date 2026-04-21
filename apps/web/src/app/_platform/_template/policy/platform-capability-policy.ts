import type { PlatformCapabilityContract } from "../types/platform-capability"

export const platformCapabilityTemplateContract = {
  id: "shell",
  title: "Platform capability template",
  status: "planned",
  owner: "app-runtime",
  summary:
    "Copyable platform capability contract for cross-feature runtime infrastructure.",
  publicImportsOnly: true,
  mayImportFeatureRoots: true,
  mayImportFeatureInternals: false,
} as const satisfies PlatformCapabilityContract

export const platformCapabilityPolicy = {
  allowedPlatformFolders: [
    "adapters",
    "components",
    "hooks",
    "policy",
    "scripts",
    "services",
    "types",
    "__tests__",
  ],
  dependencyDirection:
    "_features may import _platform public APIs; _platform must not import _features internals.",
  featureInternalImportPattern: "app/_features/*/*",
  featureRootImportPattern: "app/_features/*",
} as const
