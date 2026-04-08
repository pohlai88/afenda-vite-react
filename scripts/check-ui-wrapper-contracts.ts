/**
 * Governed UI wrapper contract checker (layer 2 drift guard).
 *
 * Purpose:
 * - verify Radix/shadcn wrapper correctness inside the governed UI owner packages
 * - catch wrapper drift that import-level guards cannot see
 *
 * Complements check-ui-drift-ast.ts (layer 1 — product-code drift) by guarding
 * the wrapper layer itself:
 *   - props not spread to primitive          → UIX-RADIX-001
 *   - ref not forwarded to primitive         → UIX-RADIX-002
 *   - wrapper renders no Radix primitive     → UIX-RADIX-003
 *   - local state replacing primitive state → UIX-RADIX-004
 *   - asChild contract drift                 → UIX-RADIX-005
 *   - shadcn primitive substructure drift    → UIX-SHADCN-002
 *
 * Scan scope: packages/shadcn-ui/src and packages/ui/src only (uiOwnerRoots).
 *
 * Usage:
 *   pnpm run script:check-ui-wrapper-contracts
 *   pnpm run script:check-ui-wrapper-contracts --format=json
 */
import path from 'node:path'
import { existsSync } from 'node:fs'
import {
  Node,
  Project,
  QuoteKind,
  SyntaxKind,
  type ArrowFunction,
  type FunctionDeclaration,
  type FunctionExpression,
  type JsxSelfClosingElement,
  type JsxOpeningElement,
  type SourceFile,
} from 'ts-morph'

import {
  type AstFinding,
  type GovernanceModules,
  type RulePolicyShape,
  type Severity,
  findRepoRoot,
  getOutputFormat,
  getRuleLevel,
  listFilesForScanByPolicy,
  normalizePath,
  printJsonReport,
  printTextReport,
  truncateExcerpt,
  exitWithStatus,
  EXCLUDED_PATH_PARTS,
} from '../tools/ui-drift/shared/index.js'

type RuleCode =
  | 'UIX-RADIX-001'
  | 'UIX-RADIX-002'
  | 'UIX-RADIX-003'
  | 'UIX-RADIX-004'
  | 'UIX-RADIX-005'
  | 'UIX-SHADCN-002'

const ROOT_DIR = findRepoRoot()
const REPORT_ROOT = ROOT_DIR
const TEST_FILE_RE = /\.(test|spec|stories)\.[jt]sx?$/

const findings: AstFinding[] = []
let activeRulePolicy: RulePolicyShape<RuleCode>
let governance: GovernanceModules<RuleCode>

async function main() {
  governance = await loadGovernance()
  activeRulePolicy = governance.rulePolicy

  const project = new Project({
    tsConfigFilePath: findTsConfig(),
    skipAddingFilesFromTsConfig: true,
    skipFileDependencyResolution: true,
    manipulationSettings: { quoteKind: QuoteKind.Single },
  })

  const sourceFilesToScan = listFilesForScanByPolicy(
    ROOT_DIR,
    governance.ownershipPolicy.wrapperContractScanRoots,
  )
  project.addSourceFilesAtPaths(sourceFilesToScan)

  const sourceFiles = project
    .getSourceFiles()
    .filter((sf) => shouldScanFile(sf))

  for (const sourceFile of sourceFiles) {
    const primitiveNamespaceAliases = getRadixNamespaceAliases(sourceFile)
    const primitiveNamedAliases = getRadixNamedAliases(sourceFile)

    if (primitiveNamespaceAliases.length === 0 && primitiveNamedAliases.length === 0) {
      continue
    }

    const contract = governance.radixContractPolicy
    const wrapperFns = getCandidateWrapperFunctions(sourceFile)

    for (const wrapperFn of wrapperFns) {
      const body = getFunctionBodyNode(wrapperFn)
      if (!body) continue

      const primitiveJsxNodes = findPrimitiveJsxNodes(
        body,
        primitiveNamespaceAliases,
        primitiveNamedAliases,
      )

      if (primitiveJsxNodes.length === 0) {
        if (contract.requirePrimitiveRenderInWrapper) {
          checkPrimitiveRenderPresence(sourceFile, wrapperFn, primitiveJsxNodes)
        }
        continue
      }

      if (contract.requirePropsSpreadToPrimitive) {
        checkPropsSpreadToPrimitive(sourceFile, wrapperFn, primitiveJsxNodes)
      }

      if (contract.requireRefForwardingOrExplicitRefPassThrough) {
        checkRefForwardingOrRefPassThrough(sourceFile, wrapperFn, primitiveJsxNodes)
      }

      if (contract.warnOnLocalStateReplacingPrimitiveBehavior) {
        checkSuspiciousLocalState(sourceFile, wrapperFn)
      }

      if (contract.warnOnSuspiciousAsChildContractDrift) {
        checkSuspiciousAsChildDrift(sourceFile, wrapperFn, primitiveJsxNodes)
      }

      checkSuspiciousShadcnSubstructure(sourceFile, wrapperFn, primitiveJsxNodes)
    }
  }

  report()
}

// ---------------------------------------------------------------------------
// Governance loader
// ---------------------------------------------------------------------------

async function loadGovernance(): Promise<GovernanceModules<RuleCode>> {
  const { loadGovernanceModules } = await import('../tools/ui-drift/shared/index.js')
  return loadGovernanceModules<RuleCode>(ROOT_DIR)
}

// ---------------------------------------------------------------------------
// Project utilities
// ---------------------------------------------------------------------------

function findTsConfig(): string {
  const candidates = [
    path.join(ROOT_DIR, 'tsconfig.json'),
    path.join(ROOT_DIR, 'tsconfig.base.json'),
  ]

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }

  console.error('Unable to locate tsconfig.json or tsconfig.base.json')
  process.exit(2)
}

function shouldScanFile(sourceFile: SourceFile): boolean {
  const file = normalizePath(sourceFile.getFilePath())
  if (!/\.[jt]sx?$/.test(file)) return false
  if (TEST_FILE_RE.test(file)) return false
  if (EXCLUDED_PATH_PARTS.some((part) => file.includes(part))) return false
  return true
}

// ---------------------------------------------------------------------------
// Import analysis — identify which Radix namespaces/names are in scope
// ---------------------------------------------------------------------------

function getRadixNamespaceAliases(sourceFile: SourceFile): string[] {
  return sourceFile
    .getImportDeclarations()
    .filter((decl) => decl.getModuleSpecifierValue().startsWith('@radix-ui/react-'))
    .map((decl) => decl.getNamespaceImport()?.getText())
    .filter((v): v is string => v !== undefined)
}

function getRadixNamedAliases(sourceFile: SourceFile): string[] {
  return sourceFile
    .getImportDeclarations()
    .filter((decl) => decl.getModuleSpecifierValue().startsWith('@radix-ui/react-'))
    .flatMap((decl) =>
      decl
        .getNamedImports()
        .map((named) => named.getAliasNode()?.getText() ?? named.getName()),
    )
}

// ---------------------------------------------------------------------------
// Function discovery — candidate wrapper components in the file
// ---------------------------------------------------------------------------

function getCandidateWrapperFunctions(
  sourceFile: SourceFile,
): Array<FunctionDeclaration | FunctionExpression | ArrowFunction> {
  const result: Array<FunctionDeclaration | FunctionExpression | ArrowFunction> = []

  for (const fn of sourceFile.getFunctions()) {
    result.push(fn)
  }

  for (const variable of sourceFile.getVariableDeclarations()) {
    const initializer = variable.getInitializer()
    if (
      initializer &&
      (Node.isArrowFunction(initializer) || Node.isFunctionExpression(initializer))
    ) {
      result.push(initializer)
    }
  }

  return result
}

function getFunctionBodyNode(
  fn: FunctionDeclaration | FunctionExpression | ArrowFunction,
): ReturnType<typeof fn.getBody> | undefined {
  return fn.getBody() ?? undefined
}

// ---------------------------------------------------------------------------
// JSX node discovery — find primitive JSX usages within a scope
// ---------------------------------------------------------------------------

function findPrimitiveJsxNodes(
  scope: Node,
  namespaceAliases: readonly string[],
  namedAliases: readonly string[],
): Array<JsxOpeningElement | JsxSelfClosingElement> {
  const results: Array<JsxOpeningElement | JsxSelfClosingElement> = []

  scope.forEachDescendant((node) => {
    if (!Node.isJsxOpeningElement(node) && !Node.isJsxSelfClosingElement(node)) return

    const tagText = node.getTagNameNode().getText()
    const matchesNamespace = namespaceAliases.some((alias) =>
      tagText.startsWith(`${alias}.`),
    )
    const matchesNamed = namedAliases.includes(tagText)

    if (matchesNamespace || matchesNamed) {
      results.push(node)
    }
  })

  return results
}

// ---------------------------------------------------------------------------
// Rule checks
// ---------------------------------------------------------------------------

/** UIX-RADIX-003: wrapper body contains no Radix primitive render at all. */
function checkPrimitiveRenderPresence(
  sourceFile: SourceFile,
  wrapperFn: FunctionDeclaration | FunctionExpression | ArrowFunction,
  primitiveJsxNodes: Array<JsxOpeningElement | JsxSelfClosingElement>,
) {
  if (primitiveJsxNodes.length > 0) return

  pushNodeFinding(
    sourceFile,
    wrapperFn,
    'UIX-RADIX-003',
    'Wrapper does not appear to render a Radix primitive. Wrapped primitive contract may have drifted into custom DOM behavior.',
  )
}

/** UIX-RADIX-001: wrapper has a `props` parameter but does not spread it to the primitive. */
function checkPropsSpreadToPrimitive(
  sourceFile: SourceFile,
  wrapperFn: FunctionDeclaration | FunctionExpression | ArrowFunction,
  primitiveJsxNodes: Array<JsxOpeningElement | JsxSelfClosingElement>,
) {
  const hasPropsParam = getFunctionParameterNames(wrapperFn).some(
    (name) => name === 'props',
  )
  if (!hasPropsParam) return

  const hasSpreadToPrimitive = primitiveJsxNodes.some((node) =>
    node
      .getAttributes()
      .some(
        (attr) =>
          Node.isJsxSpreadAttribute(attr) &&
          attr.getExpression().getText() === 'props',
      ),
  )

  if (!hasSpreadToPrimitive) {
    pushNodeFinding(
      sourceFile,
      wrapperFn,
      'UIX-RADIX-001',
      'Wrapper accepts props but does not spread them to the underlying Radix primitive.',
    )
  }
}

/** UIX-RADIX-002: wrapper supports ref flow but does not pass ref to the primitive. */
function checkRefForwardingOrRefPassThrough(
  sourceFile: SourceFile,
  wrapperFn: FunctionDeclaration | FunctionExpression | ArrowFunction,
  primitiveJsxNodes: Array<JsxOpeningElement | JsxSelfClosingElement>,
) {
  const paramNames = getFunctionParameterNames(wrapperFn)
  const hasRefParam = paramNames.includes('ref')
  const isForwardRef = isInsideForwardRef(wrapperFn)

  if (!hasRefParam && !isForwardRef) return

  const hasRefOnPrimitive = primitiveJsxNodes.some((node) =>
    node.getAttributes().some((attr) => {
      if (!Node.isJsxAttribute(attr)) return false
      if (attr.getNameNode().getText() !== 'ref') return false
      const initializer = attr.getInitializer()
      if (!initializer || !Node.isJsxExpression(initializer)) return false
      return initializer.getExpression()?.getText() === 'ref'
    }),
  )

  if (!hasRefOnPrimitive) {
    pushNodeFinding(
      sourceFile,
      wrapperFn,
      'UIX-RADIX-002',
      'Wrapper appears to support ref flow but does not pass ref to the underlying Radix primitive.',
    )
  }
}

/** UIX-RADIX-004: local state naming patterns that may replace primitive-controlled behavior. */
function checkSuspiciousLocalState(
  sourceFile: SourceFile,
  wrapperFn: FunctionDeclaration | FunctionExpression | ArrowFunction,
) {
  const body = getFunctionBodyNode(wrapperFn)
  if (!body) return

  const hasUseState = body
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .some((call) => {
      const expr = call.getExpression().getText()
      return expr === 'useState' || expr === 'React.useState'
    })

  if (!hasUseState) return

  const suspicious =
    /\b(open|setOpen|checked|setChecked|selected|setSelected|active|setActive)\b/.test(
      body.getText(),
    )

  if (suspicious) {
    pushNodeFinding(
      sourceFile,
      wrapperFn,
      'UIX-RADIX-004',
      'Wrapper contains local state that may be replacing primitive-controlled behavior. Review whether this should remain Radix-driven.',
    )
  }
}

/** UIX-RADIX-005: wrapper mentions asChild but does not pass it through to the primitive. */
function checkSuspiciousAsChildDrift(
  sourceFile: SourceFile,
  wrapperFn: FunctionDeclaration | FunctionExpression | ArrowFunction,
  primitiveJsxNodes: Array<JsxOpeningElement | JsxSelfClosingElement>,
) {
  const text = wrapperFn.getText()
  const mentionsAsChild = /\basChild\b/.test(text)
  if (!mentionsAsChild) return

  const passesAsChild = primitiveJsxNodes.some((node) =>
    node.getAttributes().some((attr) => {
      if (!Node.isJsxAttribute(attr)) return false
      return attr.getNameNode().getText() === 'asChild'
    }),
  )

  if (!passesAsChild) {
    pushNodeFinding(
      sourceFile,
      wrapperFn,
      'UIX-RADIX-005',
      'Wrapper references asChild but does not appear to pass it through to the primitive. Composition flexibility may have drifted.',
    )
  }
}

/**
 * UIX-SHADCN-002: wrapper name suggests a structured Radix/shadcn primitive
 * (e.g. Dialog, Accordion) but no expected substructure (Trigger/Content/Item)
 * is visible in the JSX.
 */
function checkSuspiciousShadcnSubstructure(
  sourceFile: SourceFile,
  wrapperFn: FunctionDeclaration | FunctionExpression | ArrowFunction,
  primitiveJsxNodes: Array<JsxOpeningElement | JsxSelfClosingElement>,
) {
  const wrapperName = getWrapperName(wrapperFn)
  if (!wrapperName) return

  const suggestsStructuredPrimitive =
    /(Accordion|Dialog|Popover|Tooltip|Tabs|DropdownMenu|Select|Sheet|Collapsible|ContextMenu|AlertDialog|HoverCard|Menubar|NavigationMenu)/.test(
      wrapperName,
    )
  if (!suggestsStructuredPrimitive) return

  const tagTexts = primitiveJsxNodes.map((node) => node.getTagNameNode().getText())
  const hasTrigger = tagTexts.some((tag) => /\.Trigger$/.test(tag))
  const hasContent = tagTexts.some((tag) => /\.Content$/.test(tag))
  const hasItem = tagTexts.some((tag) => /\.Item$/.test(tag))

  if (!hasTrigger && !hasContent && !hasItem) {
    pushNodeFinding(
      sourceFile,
      wrapperFn,
      'UIX-SHADCN-002',
      'Wrapper name suggests a structured primitive, but expected primitive substructure (Trigger/Content/Item) is not visible. Review for shadcn/Radix composition drift.',
    )
  }
}

// ---------------------------------------------------------------------------
// Node utilities
// ---------------------------------------------------------------------------

function getFunctionParameterNames(
  fn: FunctionDeclaration | FunctionExpression | ArrowFunction,
): string[] {
  return fn.getParameters().map((param) => param.getName())
}

function isInsideForwardRef(
  fn: FunctionDeclaration | FunctionExpression | ArrowFunction,
): boolean {
  let current: Node | undefined = fn.getParent()

  while (current) {
    if (Node.isCallExpression(current)) {
      const expr = current.getExpression().getText()
      if (expr === 'forwardRef' || expr === 'React.forwardRef') return true
    }
    current = current.getParent()
  }

  return false
}

function getWrapperName(
  fn: FunctionDeclaration | FunctionExpression | ArrowFunction,
): string | undefined {
  if (Node.isFunctionDeclaration(fn)) return fn.getName() ?? undefined

  const parent = fn.getParent()
  if (Node.isVariableDeclaration(parent)) return parent.getName()

  return undefined
}

// ---------------------------------------------------------------------------
// Finding helpers
// ---------------------------------------------------------------------------

function pushNodeFinding(
  sourceFile: SourceFile,
  node: Node,
  rule: RuleCode,
  message: string,
) {
  const severity = getRuleLevel(rule, activeRulePolicy)
  if (severity == null) return

  const start = node.getStart()
  const pos = sourceFile.getLineAndColumnAtPos(start)

  findings.push({
    severity,
    rule,
    file: normalizePath(path.relative(REPORT_ROOT, sourceFile.getFilePath())),
    line: pos.line,
    column: pos.column,
    message,
    excerpt: truncateExcerpt(node.getText()),
  })
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function sortFindings(a: AstFinding, b: AstFinding): number {
  return (
    a.file.localeCompare(b.file) ||
    a.line - b.line ||
    a.column - b.column ||
    a.rule.localeCompare(b.rule)
  )
}

function report(): never {
  const sorted = [...findings].sort(sortFindings)
  const format = getOutputFormat()

  if (sorted.length === 0) {
    if (format === 'json') {
      console.log(
        JSON.stringify(
          { findings: [], summary: { errors: 0, warnings: 0 }, byRule: {} },
          null,
          2,
        ),
      )
    } else {
      console.log('✅ UI wrapper contract check passed. No violations found.')
    }
    process.exit(0)
  }

  if (format === 'json') {
    printJsonReport(sorted)
  } else {
    printTextReport(
      sorted,
      'UI Wrapper Contract Report',
      (f: AstFinding) =>
        `[${(f.severity as Severity).toUpperCase()}] ${f.rule} ${f.file}:${f.line}:${f.column}\n  ${f.message}\n  ${f.excerpt}`,
    )
  }

  exitWithStatus(sorted)
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(2)
})
