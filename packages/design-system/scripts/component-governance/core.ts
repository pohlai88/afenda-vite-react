import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import ts from "typescript"
import { z } from "zod"

import {
  validatePrimitiveManifest,
  type PrimitiveGovernanceManifest,
} from "../../ui-primitives/manifest-contract"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const DESIGN_SYSTEM_ROOT = path.resolve(__dirname, "..", "..")
export const UI_PRIMITIVES_DIR = path.join(DESIGN_SYSTEM_ROOT, "ui-primitives")
export const REGISTRY_FILE = path.join(UI_PRIMITIVES_DIR, "_registry.ts")
export const GENERATED_DIR = path.join(DESIGN_SYSTEM_ROOT, "generated")

/** Pre-register manifests so Vitest/Vite transform `.ts`; runtime `import(file://…/*.ts)` does not. */
type ManifestModule = {
  default?: PrimitiveGovernanceManifest
  manifest?: PrimitiveGovernanceManifest
}

const manifestModuleLoaders =
  typeof import.meta.glob === "function"
    ? import.meta.glob<ManifestModule>("../../ui-primitives/**/*.manifest.ts")
    : {}

const VARIANT_TOKEN_REGEX =
  /\b(?:bg|text|border|ring|outline|fill|stroke)-(?:background|foreground|card|popover|primary|secondary|muted|accent|destructive|input|border|ring|sidebar(?:-[a-z-]+)?|success|warning|info)\b/

const RAW_PALETTE_REGEX =
  /\b(?:bg|text|border|ring|outline|fill|stroke)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/

const ARBITRARY_COLOR_REGEX =
  /\b(?:bg|text|border|ring|outline|fill|stroke)-\[[^\]]*(?:#|rgb\(|rgba\(|hsl\(|hsla\(|oklch\()[^\]]*\]/

export interface RegistryPrimitive {
  component: string
  sourceFileAbsolute: string
  sourceFileRelative: string
  manifestFileAbsolute: string
  manifestFileRelative: string
}

export interface ExtractedCvaDefinition {
  variableName: string | null
  variants: Record<string, string[]>
  defaultVariants: Record<string, string>
}

export interface ClassSignalFacts {
  usesCva: boolean
  usesCn: boolean
  hasTokenClasses: boolean
  hasRawPaletteClasses: boolean
  hasArbitraryColorClasses: boolean
  hasInlineStyleAttribute: boolean
}

export interface ExtractedPrimitiveFacts {
  component: string
  sourceFileRelative: string
  exports: string[]
  dataSlots: string[]
  hasForwardRef: boolean
  cvaDefinitions: ExtractedCvaDefinition[]
  classSignals: ClassSignalFacts
}

export interface NormalizedGovernanceComponent {
  component: string
  sourceFile: string
  manifestFile: string
  owner: string
  lifecycle: PrimitiveGovernanceManifest["lifecycle"]
  purpose: string
  fixtures: string[]
  a11y?: PrimitiveGovernanceManifest["a11y"]
  requiredCoverage?: PrimitiveGovernanceManifest["requiredCoverage"]
  policy?: PrimitiveGovernanceManifest["policy"]
  deprecation?: PrimitiveGovernanceManifest["deprecation"]
  notes?: string
  exports: string[]
  dataSlots: string[]
  forwardRef: boolean
  classSignals: ClassSignalFacts
  cvaDefinitions: ExtractedCvaDefinition[]
}

export interface ComponentManifestsArtifact {
  version: 1
  package: "@afenda/design-system"
  scope: "ui-primitives"
  components: Array<
    Omit<NormalizedGovernanceComponent, "cvaDefinitions"> & {
      cvaDefinitionCount: number
    }
  >
}

export interface ComponentVariantsArtifact {
  version: 1
  package: "@afenda/design-system"
  scope: "ui-primitives"
  components: Array<{
    component: string
    sourceFile: string
    cvaDefinitions: ExtractedCvaDefinition[]
  }>
}

export interface ComponentCoverageArtifact {
  version: 1
  package: "@afenda/design-system"
  scope: "ui-primitives"
  components: Array<{
    component: string
    lifecycle: PrimitiveGovernanceManifest["lifecycle"]
    owner: string
    fixtureCount: number
    fixtures: string[]
    requiredCoverage?: PrimitiveGovernanceManifest["requiredCoverage"]
    a11y?: PrimitiveGovernanceManifest["a11y"]
    policy?: PrimitiveGovernanceManifest["policy"]
  }>
}

export interface ArtifactPayloads {
  manifests: ComponentManifestsArtifact
  variants: ComponentVariantsArtifact
  coverage: ComponentCoverageArtifact
}

const cvaDefinitionSchema = z.object({
  variableName: z.string().nullable(),
  variants: z.record(z.string(), z.array(z.string())),
  defaultVariants: z.record(z.string(), z.string()),
})

const classSignalsSchema = z.object({
  usesCva: z.boolean(),
  usesCn: z.boolean(),
  hasTokenClasses: z.boolean(),
  hasRawPaletteClasses: z.boolean(),
  hasArbitraryColorClasses: z.boolean(),
  hasInlineStyleAttribute: z.boolean(),
})

const manifestsSchema = z.object({
  version: z.literal(1),
  package: z.literal("@afenda/design-system"),
  scope: z.literal("ui-primitives"),
  components: z.array(
    z.object({
      component: z.string(),
      sourceFile: z.string(),
      manifestFile: z.string(),
      owner: z.string(),
      lifecycle: z.enum(["draft", "beta", "stable", "deprecated"]),
      purpose: z.string(),
      fixtures: z.array(z.string()),
      a11y: z.record(z.string(), z.boolean()).optional(),
      requiredCoverage: z.record(z.string(), z.boolean()).optional(),
      policy: z.record(z.string(), z.boolean()).optional(),
      deprecation: z
        .object({
          replacement: z.string().optional(),
          since: z.string().optional(),
          removeAfter: z.string().optional(),
          allowlist: z.array(z.string()).optional(),
        })
        .optional(),
      notes: z.string().optional(),
      exports: z.array(z.string()),
      dataSlots: z.array(z.string()),
      forwardRef: z.boolean(),
      classSignals: classSignalsSchema,
      cvaDefinitionCount: z.number().int().min(0),
    })
  ),
})

const variantsSchema = z.object({
  version: z.literal(1),
  package: z.literal("@afenda/design-system"),
  scope: z.literal("ui-primitives"),
  components: z.array(
    z.object({
      component: z.string(),
      sourceFile: z.string(),
      cvaDefinitions: z.array(cvaDefinitionSchema),
    })
  ),
})

const coverageSchema = z.object({
  version: z.literal(1),
  package: z.literal("@afenda/design-system"),
  scope: z.literal("ui-primitives"),
  components: z.array(
    z.object({
      component: z.string(),
      lifecycle: z.enum(["draft", "beta", "stable", "deprecated"]),
      owner: z.string(),
      fixtureCount: z.number().int().min(0),
      fixtures: z.array(z.string()),
      requiredCoverage: z.record(z.string(), z.boolean()).optional(),
      a11y: z.record(z.string(), z.boolean()).optional(),
      policy: z.record(z.string(), z.boolean()).optional(),
    })
  ),
})

function normalizePathForJson(filePath: string): string {
  return filePath.split(path.sep).join("/")
}

function toRelativeFromDesignSystem(absolutePath: string): string {
  return normalizePathForJson(path.relative(DESIGN_SYSTEM_ROOT, absolutePath))
}

function resolveRegistryFilePath(
  registryFilePath: string,
  rawFilePath: string
): string {
  const directResolution = path.resolve(
    path.dirname(registryFilePath),
    rawFilePath
  )
  if (fs.existsSync(directResolution)) return directResolution

  const normalizedRawPath = normalizePathForJson(rawFilePath)
  const marker = "/design-system/"
  const markerIndex = normalizedRawPath.lastIndexOf(marker)

  if (markerIndex !== -1) {
    const suffix = normalizedRawPath.slice(markerIndex + marker.length)
    const fallbackResolution = path.join(DESIGN_SYSTEM_ROOT, suffix)
    if (fs.existsSync(fallbackResolution)) {
      return fallbackResolution
    }
  }

  return directResolution
}

function getLiteralString(node: ts.Expression): string | null {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text
  }
  return null
}

function getObjectProperty(
  objectNode: ts.ObjectLiteralExpression,
  key: string
): ts.ObjectLiteralElementLike | undefined {
  return objectNode.properties.find((property) => {
    if (!ts.isPropertyAssignment(property)) return false
    if (ts.isIdentifier(property.name)) return property.name.text === key
    if (ts.isStringLiteral(property.name)) return property.name.text === key
    return false
  })
}

function getObjectPropertyString(
  objectNode: ts.ObjectLiteralExpression,
  key: string
): string | null {
  const property = getObjectProperty(objectNode, key)
  if (!property || !ts.isPropertyAssignment(property)) return null
  return getLiteralString(property.initializer)
}

function getJsxAttributeName(node: ts.JsxAttributeName): string | null {
  if (ts.isIdentifier(node)) return node.text
  return null
}

function getPropertyName(node: ts.PropertyName): string | null {
  if (ts.isIdentifier(node)) return node.text
  if (ts.isStringLiteral(node)) return node.text
  if (ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  return null
}

function parseObjectLiteralStringMap(
  node: ts.ObjectLiteralExpression,
  context: string
): Record<string, string> {
  const output: Record<string, string> = {}
  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) {
      throw new Error(`${context}: expected property assignment.`)
    }
    const key = getPropertyName(property.name)
    if (!key) {
      throw new Error(`${context}: unsupported property key.`)
    }
    const stringValue = getLiteralString(property.initializer)
    if (stringValue === null) {
      throw new Error(`${context}: "${key}" value must be a string literal.`)
    }
    output[key] = stringValue
  }
  return output
}

function parseCvaConfiguration(
  callExpression: ts.CallExpression,
  sourceFile: ts.SourceFile
): ExtractedCvaDefinition {
  const definition: ExtractedCvaDefinition = {
    variableName: null,
    variants: {},
    defaultVariants: {},
  }

  if (
    ts.isVariableDeclaration(callExpression.parent) &&
    ts.isIdentifier(callExpression.parent.name)
  ) {
    definition.variableName = callExpression.parent.name.text
  }

  const secondArgument = callExpression.arguments[1]
  if (!secondArgument) return definition
  if (!ts.isObjectLiteralExpression(secondArgument)) {
    const location = sourceFile.getLineAndCharacterOfPosition(
      secondArgument.getStart(sourceFile)
    )
    throw new Error(
      `${sourceFile.fileName}:${location.line + 1}:${location.character + 1} cva() second argument must be an object literal.`
    )
  }

  const variantsProperty = getObjectProperty(secondArgument, "variants")
  if (variantsProperty) {
    if (!ts.isPropertyAssignment(variantsProperty)) {
      throw new Error(
        `${sourceFile.fileName} cva().variants must be a property assignment.`
      )
    }
    if (!ts.isObjectLiteralExpression(variantsProperty.initializer)) {
      throw new Error(
        `${sourceFile.fileName} cva().variants must be an object literal.`
      )
    }

    for (const variantGroupProperty of variantsProperty.initializer
      .properties) {
      if (!ts.isPropertyAssignment(variantGroupProperty)) {
        throw new Error(
          `${sourceFile.fileName} cva().variants entries must be properties.`
        )
      }
      const groupName = getPropertyName(variantGroupProperty.name)
      if (!groupName) {
        throw new Error(
          `${sourceFile.fileName} cva().variants group name must be static.`
        )
      }
      if (!ts.isObjectLiteralExpression(variantGroupProperty.initializer)) {
        throw new Error(
          `${sourceFile.fileName} cva().variants.${groupName} must be an object literal.`
        )
      }

      const values: string[] = []
      for (const variantProperty of variantGroupProperty.initializer
        .properties) {
        if (!ts.isPropertyAssignment(variantProperty)) {
          throw new Error(
            `${sourceFile.fileName} cva().variants.${groupName} entries must be properties.`
          )
        }
        const variantName = getPropertyName(variantProperty.name)
        if (!variantName) {
          throw new Error(
            `${sourceFile.fileName} cva().variants.${groupName} variant name must be static.`
          )
        }
        values.push(variantName)
      }
      definition.variants[groupName] = [...new Set(values)].sort()
    }
  }

  const defaultVariantsProperty = getObjectProperty(
    secondArgument,
    "defaultVariants"
  )
  if (defaultVariantsProperty) {
    if (!ts.isPropertyAssignment(defaultVariantsProperty)) {
      throw new Error(
        `${sourceFile.fileName} cva().defaultVariants must be a property assignment.`
      )
    }
    if (!ts.isObjectLiteralExpression(defaultVariantsProperty.initializer)) {
      throw new Error(
        `${sourceFile.fileName} cva().defaultVariants must be an object literal.`
      )
    }
    definition.defaultVariants = parseObjectLiteralStringMap(
      defaultVariantsProperty.initializer,
      `${sourceFile.fileName} cva().defaultVariants`
    )
  }

  return definition
}

function collectStringLiterals(sourceFile: ts.SourceFile): string[] {
  const values: string[] = []
  const visit = (node: ts.Node): void => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      values.push(node.text)
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return values
}

function readRegistryPrimitives(registryFilePath: string): RegistryPrimitive[] {
  const sourceText = fs.readFileSync(registryFilePath, "utf8")
  const sourceFile = ts.createSourceFile(
    registryFilePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  )

  let registryArray: ts.ArrayLiteralExpression | undefined
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name)) continue
      if (declaration.name.text !== "ui") continue
      if (
        !declaration.initializer ||
        !ts.isArrayLiteralExpression(declaration.initializer)
      ) {
        continue
      }
      registryArray = declaration.initializer
    }
  }

  if (!registryArray) {
    throw new Error(`Unable to find "ui" array in ${registryFilePath}`)
  }

  const primitives: RegistryPrimitive[] = []
  const seenComponentNames = new Set<string>()

  for (const element of registryArray.elements) {
    if (!ts.isObjectLiteralExpression(element)) continue
    const component = getObjectPropertyString(element, "name")
    if (!component) continue

    if (seenComponentNames.has(component)) {
      throw new Error(`Duplicate component "${component}" in registry.`)
    }
    seenComponentNames.add(component)

    const filesProperty = getObjectProperty(element, "files")
    if (!filesProperty || !ts.isPropertyAssignment(filesProperty)) {
      throw new Error(`Registry entry "${component}" is missing "files".`)
    }
    if (!ts.isArrayLiteralExpression(filesProperty.initializer)) {
      throw new Error(`Registry entry "${component}" has non-array "files".`)
    }

    const firstFile = filesProperty.initializer.elements.find(
      ts.isObjectLiteralExpression
    )
    if (!firstFile) {
      throw new Error(
        `Registry entry "${component}" has no file object in "files".`
      )
    }

    const sourcePathFromRegistry = getObjectPropertyString(firstFile, "path")
    if (!sourcePathFromRegistry) {
      throw new Error(
        `Registry entry "${component}" is missing file path string.`
      )
    }

    const sourceFileAbsolute = resolveRegistryFilePath(
      registryFilePath,
      sourcePathFromRegistry
    )
    if (!fs.existsSync(sourceFileAbsolute)) {
      throw new Error(
        `Registry entry "${component}" points to missing source file: ${sourceFileAbsolute}`
      )
    }
    if (!sourceFileAbsolute.endsWith(".tsx")) {
      throw new Error(
        `Registry entry "${component}" must point to a .tsx primitive file.`
      )
    }

    const manifestFileAbsolute = sourceFileAbsolute.replace(
      /\.tsx$/,
      ".manifest.ts"
    )

    primitives.push({
      component,
      sourceFileAbsolute,
      sourceFileRelative: toRelativeFromDesignSystem(sourceFileAbsolute),
      manifestFileAbsolute,
      manifestFileRelative: toRelativeFromDesignSystem(manifestFileAbsolute),
    })
  }

  return primitives.sort((left, right) =>
    left.component.localeCompare(right.component)
  )
}

export function extractPrimitiveFacts(
  primitive: RegistryPrimitive
): ExtractedPrimitiveFacts {
  const sourceText = fs.readFileSync(primitive.sourceFileAbsolute, "utf8")
  const sourceFile = ts.createSourceFile(
    primitive.sourceFileAbsolute,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )

  const exportedNames = new Set<string>()
  const dataSlots = new Set<string>()
  const cvaDefinitions: ExtractedCvaDefinition[] = []
  let hasForwardRef = false
  let hasCva = false
  let hasCnCall = false
  let hasInlineStyleAttribute = false

  const visit = (node: ts.Node): void => {
    if (
      ts.isExportDeclaration(node) &&
      node.exportClause &&
      ts.isNamedExports(node.exportClause)
    ) {
      for (const element of node.exportClause.elements) {
        exportedNames.add(element.name.text)
      }
    }

    if (
      ts.isFunctionDeclaration(node) &&
      node.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
      ) &&
      node.name
    ) {
      exportedNames.add(node.name.text)
    }

    if (
      ts.isVariableStatement(node) &&
      node.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
      )
    ) {
      for (const declaration of node.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          exportedNames.add(declaration.name.text)
        }
      }
    }

    if (ts.isCallExpression(node)) {
      if (ts.isIdentifier(node.expression) && node.expression.text === "cva") {
        hasCva = true
        cvaDefinitions.push(parseCvaConfiguration(node, sourceFile))
      }

      if (ts.isIdentifier(node.expression) && node.expression.text === "cn") {
        hasCnCall = true
      }

      if (
        ts.isIdentifier(node.expression) &&
        node.expression.text === "forwardRef"
      ) {
        hasForwardRef = true
      }

      if (
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.name.text === "forwardRef"
      ) {
        hasForwardRef = true
      }
    }

    if (ts.isJsxAttribute(node)) {
      const attributeName = getJsxAttributeName(node.name)
      if (attributeName === "style") {
        hasInlineStyleAttribute = true
      }
      if (attributeName === "data-slot" && node.initializer) {
        if (ts.isStringLiteral(node.initializer)) {
          dataSlots.add(node.initializer.text)
        } else if (
          ts.isJsxExpression(node.initializer) &&
          node.initializer.expression
        ) {
          const value = getLiteralString(node.initializer.expression)
          if (value) dataSlots.add(value)
        }
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  const signalBuffer = collectStringLiterals(sourceFile).join(" ")
  if (hasCva && cvaDefinitions.length === 0) {
    throw new Error(
      `cva() usage detected but no definitions parsed for ${primitive.sourceFileRelative}`
    )
  }

  cvaDefinitions.sort((left, right) => {
    const leftName = left.variableName ?? ""
    const rightName = right.variableName ?? ""
    return leftName.localeCompare(rightName)
  })

  return {
    component: primitive.component,
    sourceFileRelative: primitive.sourceFileRelative,
    exports: [...exportedNames].sort(),
    dataSlots: [...dataSlots].sort(),
    hasForwardRef,
    cvaDefinitions,
    classSignals: {
      usesCva: hasCva,
      usesCn: hasCnCall,
      hasTokenClasses: VARIANT_TOKEN_REGEX.test(signalBuffer),
      hasRawPaletteClasses: RAW_PALETTE_REGEX.test(signalBuffer),
      hasArbitraryColorClasses: ARBITRARY_COLOR_REGEX.test(signalBuffer),
      hasInlineStyleAttribute,
    },
  }
}

async function loadManifestModule(
  manifestAbsolutePath: string
): Promise<PrimitiveGovernanceManifest> {
  const abs = path.resolve(manifestAbsolutePath)
  const relFromRoot = toRelativeFromDesignSystem(abs)
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
  const key = `../../${relFromRoot}`
  const loader = manifestModuleLoaders[key]
  const moduleValue = loader
    ? await loader()
    : ((await import(pathToFileURL(abs).href)) as ManifestModule)
  const candidate = moduleValue.default ?? moduleValue.manifest
  if (!candidate) {
    throw new Error(
      `Manifest module ${manifestAbsolutePath} must export default manifest or named "manifest".`
    )
  }
  validatePrimitiveManifest(
    candidate,
    toRelativeFromDesignSystem(manifestAbsolutePath)
  )
  return candidate
}

function normalizeComponent(
  primitive: RegistryPrimitive,
  extracted: ExtractedPrimitiveFacts,
  manifest: PrimitiveGovernanceManifest
): NormalizedGovernanceComponent {
  return {
    component: primitive.component,
    sourceFile: primitive.sourceFileRelative,
    manifestFile: primitive.manifestFileRelative,
    owner: manifest.owner,
    lifecycle: manifest.lifecycle,
    purpose: manifest.purpose,
    fixtures: [...(manifest.fixtures ?? [])].sort(),
    a11y: manifest.a11y,
    requiredCoverage: manifest.requiredCoverage,
    policy: manifest.policy,
    deprecation: manifest.deprecation,
    notes: manifest.notes,
    exports: extracted.exports,
    dataSlots: extracted.dataSlots,
    forwardRef: extracted.hasForwardRef,
    classSignals: extracted.classSignals,
    cvaDefinitions: extracted.cvaDefinitions,
  }
}

export function createArtifactPayloads(
  components: NormalizedGovernanceComponent[]
): ArtifactPayloads {
  const sorted = [...components].sort((left, right) =>
    left.component.localeCompare(right.component)
  )

  const manifests: ComponentManifestsArtifact = {
    version: 1,
    package: "@afenda/design-system",
    scope: "ui-primitives",
    components: sorted.map((component) => ({
      component: component.component,
      sourceFile: component.sourceFile,
      manifestFile: component.manifestFile,
      owner: component.owner,
      lifecycle: component.lifecycle,
      purpose: component.purpose,
      fixtures: component.fixtures,
      a11y: component.a11y,
      requiredCoverage: component.requiredCoverage,
      policy: component.policy,
      deprecation: component.deprecation,
      notes: component.notes,
      exports: component.exports,
      dataSlots: component.dataSlots,
      forwardRef: component.forwardRef,
      classSignals: component.classSignals,
      cvaDefinitionCount: component.cvaDefinitions.length,
    })),
  }

  const variants: ComponentVariantsArtifact = {
    version: 1,
    package: "@afenda/design-system",
    scope: "ui-primitives",
    components: sorted.map((component) => ({
      component: component.component,
      sourceFile: component.sourceFile,
      cvaDefinitions: component.cvaDefinitions,
    })),
  }

  const coverage: ComponentCoverageArtifact = {
    version: 1,
    package: "@afenda/design-system",
    scope: "ui-primitives",
    components: sorted.map((component) => ({
      component: component.component,
      lifecycle: component.lifecycle,
      owner: component.owner,
      fixtureCount: component.fixtures.length,
      fixtures: component.fixtures,
      requiredCoverage: component.requiredCoverage,
      a11y: component.a11y,
      policy: component.policy,
    })),
  }

  manifestsSchema.parse(manifests)
  variantsSchema.parse(variants)
  coverageSchema.parse(coverage)

  return { manifests, variants, coverage }
}

export const GENERATED_RELATIVE_PATHS = [
  "generated/component-manifests.json",
  "generated/component-variants.json",
  "generated/component-coverage.json",
  "generated/schemas/component-manifests.schema.json",
  "generated/schemas/component-variants.schema.json",
  "generated/schemas/component-coverage.schema.json",
] as const

export interface ArtifactTexts {
  manifests: string
  variants: string
  coverage: string
}

export function serializeArtifacts(payloads: ArtifactPayloads): ArtifactTexts {
  return {
    manifests: `${JSON.stringify(payloads.manifests, null, 2)}\n`,
    variants: `${JSON.stringify(payloads.variants, null, 2)}\n`,
    coverage: `${JSON.stringify(payloads.coverage, null, 2)}\n`,
  }
}

export function writeArtifacts(texts: ArtifactTexts): void {
  fs.mkdirSync(GENERATED_DIR, { recursive: true })
  fs.writeFileSync(
    path.join(GENERATED_DIR, "component-manifests.json"),
    texts.manifests
  )
  fs.writeFileSync(
    path.join(GENERATED_DIR, "component-variants.json"),
    texts.variants
  )
  fs.writeFileSync(
    path.join(GENERATED_DIR, "component-coverage.json"),
    texts.coverage
  )
}

export function detectArtifactDrift(
  texts: ArtifactTexts,
  baseDirectory = GENERATED_DIR
): string[] {
  const checks: Array<{ name: keyof ArtifactTexts; file: string }> = [
    { name: "manifests", file: "component-manifests.json" },
    { name: "variants", file: "component-variants.json" },
    { name: "coverage", file: "component-coverage.json" },
  ]

  const drifted: string[] = []

  for (const check of checks) {
    const absolutePath = path.join(baseDirectory, check.file)
    if (!fs.existsSync(absolutePath)) {
      drifted.push(check.file)
      continue
    }
    const existing = fs.readFileSync(absolutePath, "utf8")
    if (existing !== texts[check.name]) {
      drifted.push(check.file)
    }
  }

  return drifted
}

export interface GovernanceGenerationResult {
  registryPrimitives: RegistryPrimitive[]
  components: NormalizedGovernanceComponent[]
  payloads: ArtifactPayloads
  texts: ArtifactTexts
}

export async function buildGovernanceModel(): Promise<{
  registryPrimitives: RegistryPrimitive[]
  components: NormalizedGovernanceComponent[]
}> {
  const registryPrimitives = readRegistryPrimitives(REGISTRY_FILE)
  const components: NormalizedGovernanceComponent[] = []

  for (const primitive of registryPrimitives) {
    if (!fs.existsSync(primitive.manifestFileAbsolute)) {
      throw new Error(
        `Missing colocated manifest for "${primitive.component}": ${primitive.manifestFileRelative}`
      )
    }
    const manifest = await loadManifestModule(primitive.manifestFileAbsolute)
    const extracted = extractPrimitiveFacts(primitive)
    components.push(normalizeComponent(primitive, extracted, manifest))
  }

  return {
    registryPrimitives,
    components: components.sort((left, right) =>
      left.component.localeCompare(right.component)
    ),
  }
}

export async function generateGovernanceArtifacts(options?: {
  write?: boolean
}): Promise<GovernanceGenerationResult> {
  const { write = true } = options ?? {}
  const { registryPrimitives, components } = await buildGovernanceModel()
  const payloads = createArtifactPayloads(components)
  const texts = serializeArtifacts(payloads)

  if (write) {
    writeArtifacts(texts)
  }

  return { registryPrimitives, components, payloads, texts }
}
