import { z } from "zod"

import { featureCategorySchema } from "./category.schema.js"

export const stackDependencyGroupSchema = z.enum([
  "dependencies",
  "devDependencies",
])

export const dependencyVersionSourceSchema = z.enum([
  "workspace-catalog",
  "workspace-package",
  "fallback",
])

export const stackDependencySchema = z.strictObject({
  name: z.string().min(1),
  versionSpec: z.string().min(1),
  group: stackDependencyGroupSchema,
  source: dependencyVersionSourceSchema,
  requiredFor: z.array(z.string().min(1)).min(1),
})

export const stackScaffoldPlacementSchema = z.strictObject({
  planningPackDirectory: z.string().min(1),
  webFeatureDirectory: z.string().min(1),
  apiModuleDirectory: z.string().min(1),
  apiRouteFile: z.string().min(1),
})

export const stackRouteSurfaceSchema = z.enum(["web", "api"])

export const stackRouteSuggestionSchema = z.strictObject({
  surface: stackRouteSurfaceSchema,
  path: z.string().min(1),
  rationale: z.string().min(1),
})

export const stackImplementationSurfaceSchema = z.enum(["apps/web", "apps/api"])

export const stackScaffoldHandoffSchema = z.strictObject({
  boundaryRule: z.string().min(1),
  implementationSurfaces: z.array(stackImplementationSurfaceSchema).min(1),
  requiredValidation: z.array(z.string().min(1)).min(1),
})

export const stackScaffoldManifestSchema = z.strictObject({
  appId: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use kebab-case app ids such as internal-support-crm."
    ),
  packageName: z.string().min(1),
  category: featureCategorySchema,
  generatedBy: z.literal("@afenda/features-sdk/sync-pack"),
  dependencies: z.array(stackDependencySchema),
  devDependencies: z.array(stackDependencySchema),
  scripts: z.record(z.string(), z.string().min(1)),
  placement: stackScaffoldPlacementSchema,
  routeSuggestions: z.array(stackRouteSuggestionSchema).min(1),
  nextCommands: z.array(z.string().min(1)).min(1),
  notes: z.array(z.string().min(1)),
  handoff: stackScaffoldHandoffSchema,
})

export type StackDependencyGroup = z.infer<typeof stackDependencyGroupSchema>
export type DependencyVersionSource = z.infer<
  typeof dependencyVersionSourceSchema
>
export type StackDependency = z.infer<typeof stackDependencySchema>
export type StackScaffoldPlacement = z.infer<
  typeof stackScaffoldPlacementSchema
>
export type StackRouteSurface = z.infer<typeof stackRouteSurfaceSchema>
export type StackRouteSuggestion = z.infer<typeof stackRouteSuggestionSchema>
export type StackImplementationSurface = z.infer<
  typeof stackImplementationSurfaceSchema
>
export type StackScaffoldHandoff = z.infer<typeof stackScaffoldHandoffSchema>
export type StackScaffoldManifest = z.infer<typeof stackScaffoldManifestSchema>
