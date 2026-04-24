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
  notes: z.array(z.string().min(1)),
})

export type StackDependencyGroup = z.infer<typeof stackDependencyGroupSchema>
export type DependencyVersionSource = z.infer<
  typeof dependencyVersionSourceSchema
>
export type StackDependency = z.infer<typeof stackDependencySchema>
export type StackScaffoldManifest = z.infer<typeof stackScaffoldManifestSchema>
