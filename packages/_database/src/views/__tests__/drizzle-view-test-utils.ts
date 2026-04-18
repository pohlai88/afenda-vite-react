/**
 * Test-only helpers for Drizzle `pgView` instances (Drizzle ORM ~0.45 internal `ViewBaseConfig` symbol).
 * If Drizzle changes symbol layout, update here and `mdm-canonical-views.test.ts` will fail loudly.
 */
function readViewBaseConfig(view: unknown): {
  name: string
  originalName: string
  schema: string
  selectedFields: Record<string, unknown>
} {
  const syms = Object.getOwnPropertySymbols(view as object)
  const sym = syms.find((s) => String(s).includes("ViewBase"))
  if (!sym) {
    throw new Error("Expected a Drizzle pgView (ViewBaseConfig symbol missing)")
  }
  const cfg = Reflect.get(view as object, sym) as {
    name: string
    originalName: string
    schema: string
    selectedFields: Record<string, unknown>
  }
  return cfg
}

export function readDrizzlePgViewMeta(view: unknown): {
  name: string
  originalName: string
  schema: string
} {
  const cfg = readViewBaseConfig(view)
  return {
    name: cfg.name,
    originalName: cfg.originalName,
    schema: cfg.schema,
  }
}

/** Keys of physical columns on a Drizzle `pgTable` (excludes e.g. `enableRLS` on the table proxy). */
export function pgTableDataColumnKeys(
  table: Record<string, unknown>
): string[] {
  return Object.keys(table)
    .filter((k) => k !== "enableRLS")
    .sort()
}

export function readDrizzlePgViewSelectedFieldKeys(view: unknown): string[] {
  const { selectedFields } = readViewBaseConfig(view)
  return Object.keys(selectedFields).sort()
}
