# Semantic Governance Architecture

This document defines the enforceable architecture for semantic constants,
runtime parsing, component contracts, and repo drift prevention in
`@afenda/shadcn-ui`.

It is written for day-to-day authoring in the IDE, not just policy review.
When new constant families, semantic registries, or guardrails are added, they
must fit this model rather than inventing a parallel one.

## Governing Rule

`satisfies` governs authored truth, Zod governs runtime trust, CI governs repo
behavior.

No single mechanism is sufficient on its own:

- TypeScript is not a runtime trust boundary.
- Zod is not the primary authoring model for static registries.
- CI, lint, and AST rules are not optional for semantic governance.

## Goals

- Keep one canonical source of truth per semantic concept.
- Make unknown input untrusted until parsed.
- Keep component props aligned with governed vocabularies.
- Make drift visible early through deterministic checks.
- Scale cleanly as more constant families and guardrails are introduced.

## Layered Model

| Layer | Purpose | Primary mechanism | Typical paths |
| --- | --- | --- | --- |
| Canonical authored truth | Define stable semantic vocabulary and constant registries | tuple-derived unions, `as const`, `satisfies`, frozen helpers | `src/lib/constant/foundation/*`, `src/lib/constant/semantic/*`, `src/lib/constant/component/*`, `src/lib/constant/domain/*` |
| Runtime boundary trust | Parse unknown data before it enters governed code | Zod schema parse | boundary loaders, env readers, storage readers, request parsers |
| Shared construction | Reuse governed mappings and helpers | exported registries, helpers, adapters | `src/lib/constant/registry/*`, `src/semantic/*` |
| Behavioral enforcement | Prevent semantic drift across the repo | AST rules, lint rules, import boundaries, package validation | `src/lib/constant/rule-policy.ts`, repo guard scripts |
| Generated integrity | Keep generated artifacts reproducible | deterministic generation, stable ordering, stale checks | future generator outputs and CI verification |

## Source Tree Responsibilities

| Area | Responsibility | Notes |
| --- | --- | --- |
| `src/lib/constant/foundation/*` | Foundation vocabularies such as density, typography, layout, radius, elevation | Prefer one file per concept |
| `src/lib/constant/semantic/*` | Cross-cutting semantic vocabularies such as tone, severity, status, surface | Do not duplicate these in feature code |
| `src/lib/constant/component/*` | Primitive-level governed variants and sizing | Must stay lower-level than semantic wrappers |
| `src/lib/constant/domain/*` | Domain-to-UI mappings that translate business truth into governed UI choices | Domain adapters should compose canonical semantic vocabularies |
| `src/lib/constant/registry/*` | Canonical exported registries that aggregate vocabularies | Registry files should not become alternate sources of truth |
| `src/lib/constant/schema/shared.ts` | Shared authoring and validation helpers | `defineTuple()` and `defineConstMap()` standardize authoring |
| `src/semantic/*` | Business-facing semantic API | Feature code should prefer this layer over low-level primitives |

## Registry Tiers

Foundation and semantic constant files must fit one of two approved tiers.
This keeps growth intentional and prevents every file from accumulating the
maximum possible amount of machinery.

### Tier 1: Simple Semantic Registry

Use this shape for straightforward lookup vocabularies where the concept mainly
maps semantic values to one output.

Examples:

- `radius`
- `elevation`
- `layout`

Expected shape:

- value tuple
- Zod enum for boundary reuse
- derived union type
- canonical map or registry
- one approved accessor

### Tier 2: Governed Semantic System

Use this shape when the concept carries explicit doctrine, coordinated outputs,
or stronger anti-drift requirements.

Examples:

- `density`
- `motion`
- `interaction`
- `typography`

Expected shape:

- value tuple
- Zod enum for boundary reuse
- derived union type
- structured definitions or multiple coordinated maps
- optional policy object
- one approved accessor per exported registry
- runtime schemas only where boundary parsing, tests, or generation actually use
  them

### Promotion Rule

A file should be treated as Tier 2 if it has at least one of these properties:

- it defines policy or doctrine rules
- it needs runtime boundary schemas beyond a single enum
- it exposes structured definitions instead of a simple lookup map
- it coordinates multiple outputs for one semantic concept
- it includes explicit anti-drift restrictions on feature usage

## Annotation Headers

Semantic files should begin with a short annotation header that states the
file's role, tier, authoring model, runtime expectations, and consumption
rules. The header is for IDE readability and onboarding speed, not as a
replacement for type checks or CI.

Required header qualities:

- identify the file as a semantic registry, semantic system, boundary parser,
  governance policy, generated artifact, or semantic contract
- name the tier when the file is a registry or system
- state that compile-time authoring is primary
- state that runtime schemas are for trust boundaries, not for casual casting
- direct consumers toward getters, helpers, and exported defaults

Recommended rule:

- Tier 1 files use a light `SEMANTIC REGISTRY` envelope
- Tier 2 files use a `SEMANTIC SYSTEM` envelope
- boundary loaders use a `TRUST BOUNDARY PARSER` envelope
- policy files use a `GOVERNANCE POLICY` envelope
- generated outputs use a `GENERATED ARTIFACT` envelope

Current header families used in `src/`:

- `MODULE ENTRYPOINT`: public export barrels
- `SEMANTIC REGISTRY`: simple semantic vocabularies and lookup registries
- `SEMANTIC SYSTEM`: governed semantic systems with richer doctrine or mappings
- `SEMANTIC CONTRACT`: governed component contract files
- `SEMANTIC COMPONENT`: business-facing semantic React components
- `SEMANTIC ADAPTER`: business-truth to semantic-UI adapters
- `SEMANTIC PRESENTATION`: internal semantic presentation resolvers
- `DOMAIN MAPPING`: constant-layer domain-to-component mappings
- `GOVERNANCE POLICY`: rule or policy configuration
- `GOVERNANCE VALIDATOR`: consistency verification helpers
- `GOVERNANCE METADATA`: governance versioning or similar metadata
- `AUTHORING INFRASTRUCTURE`: shared schema or authoring helpers
- `RUNTIME PROVIDER`: runtime context or persistence providers
- `UTILITY MODULE`: low-level reusable utilities
- `COPIED PRIMITIVE`: copied low-level UI primitives
- `SEMANTIC PATTERN`: reserved or implemented governed patterns

## Enforcement Contract

### 1. Static Authored Truth

Use compile-time authoring for values that are owned by the repo and checked
into source control.

Allowed:

- `as const`
- tuple-derived unions
- `satisfies`
- frozen helper builders such as `defineTuple()` and `defineConstMap()`
- narrow token unions when the vocabulary is stable

Forbidden:

- broad uncontrolled `string` for governed semantics
- duplicate handwritten unions when a tuple source already exists
- multiple canonical homes for the same concept
- ad hoc semantic maps recreated in components or features

Required:

- one canonical file per concept
- one exported default when the concept has a default
- one exported tuple source when the concept is value-list driven
- `satisfies` coverage checks when mapping keys to definitions

Recommended authoring shape:

```ts
export const densityValues = ["compact", "default", "comfortable"] as const
export type Density = (typeof densityValues)[number]

type HeightToken = "h-8" | "h-9" | "h-10"
type PaddingXToken = "px-2.5" | "px-3" | "px-4"

type DensityDefinition = {
  controlHeight: HeightToken
  inputPaddingX: PaddingXToken
}

export const DEFAULT_DENSITY: Density = "default"

export const densityDefinitions = {
  compact: { controlHeight: "h-8", inputPaddingX: "px-2.5" },
  default: { controlHeight: "h-9", inputPaddingX: "px-3" },
  comfortable: { controlHeight: "h-10", inputPaddingX: "px-4" },
} as const satisfies Record<Density, DensityDefinition>
```

Practical note:

- Zod may still be exported from the same file for reuse, but it does not
  replace the compile-time registry as the authored source of truth.

### 2. Runtime Boundary Trust

Use Zod for anything that originates outside the package's authored constant
layer.

Examples:

- local storage
- URL params
- query strings
- API input and output
- JSON config
- environment values

Allowed:

- `schema.parse(raw)`
- `schema.safeParse(raw)` with explicit handling
- centralized `.catch(DEFAULT_VALUE)` where doctrine permits fallback

Forbidden:

- `raw as Density`
- trusting request or storage values without parsing
- scattered silent defaulting across many callers
- swallowing parse failures without a documented branch

Required:

- parse before use
- keep fallback behavior explicit and centralized
- surface invalid-state handling as code, not convention

Approved pattern:

```ts
const density = densitySchema.catch(DEFAULT_DENSITY).parse(rawDensity)
```

### 3. Component Contracts

Components must consume governed semantic types instead of inventing local
string vocabularies.

Allowed:

- `density?: Density`
- props that compose canonical semantic unions
- styling through semantic maps, token helpers, and approved wrappers

Forbidden:

- `density?: string`
- inline semantic invention such as local `"success" | "warning" | "danger"`
  contracts when a canonical type exists
- direct primitive usage from product code when the semantic layer already owns
  the use case
- repeated inline default literals such as `"default"` throughout the repo

Required:

- import canonical types
- import canonical defaults where needed
- respect wrapper boundaries between low-level primitives and semantic UI

### 4. Registries

Registry files aggregate canonical concepts; they do not replace them.

Allowed:

- registry files that re-export or collect canonical value lists
- exact coverage checks using `satisfies`
- deterministic ordering

Forbidden:

- registry files becoming a second authoring home for the same semantic concept
- free-form objects without completeness guarantees

Required:

- canonical inputs only
- exact key coverage when mapping a registry by governed keys
- stable reviewable naming

### 5. Generators And Generated Artifacts

This package may grow generator-backed artifacts in the future. When that
happens, generation must follow the same governance model.

Allowed:

- canonical source input only
- deterministic normalization
- stable ordering and formatting
- content hashes or stale checks

Forbidden:

- hand-editing generated files
- timestamps or random ordering that create churn
- manual review as the only integrity check

Required:

- reproducible output
- CI stale detection
- source-first edits followed by regeneration

## Allowed / Forbidden / Required By File Type

### Canonical semantic files

Examples:

- `src/lib/constant/foundation/density.ts`
- `src/lib/constant/foundation/radius.ts`
- `src/lib/constant/semantic/tone.ts`
- `src/lib/constant/semantic/status.ts`

| Allowed | Forbidden | Required |
| --- | --- | --- |
| tuple source of truth, derived union, `as const`, `satisfies` | duplicate semantic sources, broad `string`, alternate local vocabularies | one home per concept, exported union, exported default when relevant |

### Boundary parsing files

Examples:

- storage loaders
- env loaders
- API parsers
- URL readers

| Allowed | Forbidden | Required |
| --- | --- | --- |
| strict Zod parsing, explicit fallback doctrine | `as`-casting unknown input, silent trust, swallowed parse errors | parse before use, centralized fallback policy |

### Component files

Examples:

- semantic components
- wrapper components
- feature-facing adapters

| Allowed | Forbidden | Required |
| --- | --- | --- |
| canonical imported unions, approved wrappers, semantic maps | governed props typed as `string`, direct primitive bypass, inline variant systems | canonical semantic types, wrapper boundary discipline |

### Generator files

| Allowed | Forbidden | Required |
| --- | --- | --- |
| normalized source input, stable serialization, stale checks | mixed ad hoc inputs, nondeterministic output, hand-patched generated files | deterministic output, CI verification |

### CI / lint / AST files

| Allowed | Forbidden | Required |
| --- | --- | --- |
| deterministic checks with actionable diagnostics | vague or advisory-only enforcement for critical drift | fail on critical drift, keep severity doctrine explicit |

## Severity Doctrine

Use these severities consistently:

| Severity | Meaning | Examples |
| --- | --- | --- |
| `error` | Architectural drift or unsafe runtime trust | primitive bypass, raw semantic duplication, unparsed boundary input, stale generated artifacts |
| `warning` | Quality degradation without immediate truth corruption | complexity growth, weak composition, soft threshold overages |
| `off` | Intentionally disabled rule | transitional rules that are documented but not enforced |

Critical rules should remain `error` when they protect authored truth or runtime
trust.

Error-level candidates include:

- direct primitive import outside the allowed wrapper layer
- raw Tailwind palette drift in product code
- invalid token usage where governed vocabularies exist
- duplicate semantic source definitions
- boundary input used without parsing
- stale generated artifact mismatch

## Tool Selection Matrix

| Scenario | Primary tool | Do not use as primary |
| --- | --- | --- |
| Static semantic registry | tuple + derived union + `satisfies` | Zod-only authoring |
| Unknown runtime value | Zod | `satisfies` |
| Token registry | tuple unions and governed definitions | broad strings |
| Component prop contract | imported union types | raw strings |
| Persisted UI preference loader | Zod parse mapped to canonical types | type assertion trust |
| Generator integrity | hash or stale-check CI | manual review only |
| Repo drift prevention | lint, AST, CI | convention-only discipline |

## IDE-Friendly Author Workflow

### When adding a new semantic concept

1. Create one canonical file in the correct constant family.
2. Decide whether it is Tier 1 or Tier 2 before adding optional machinery.
3. Define the value tuple and derive the union type.
4. Export a default if the concept has one.
5. Use `satisfies` for governed definitions and key coverage.
6. Add the concept to the appropriate registry file if it is part of the
   exported governance surface.
7. Add or update runtime parsing only where unknown input crosses a boundary.
8. Add or update enforcement if the concept introduces new drift risk.

### When reading unknown data

1. Parse with Zod before converting to trusted types.
2. Choose fail-fast or explicit fallback.
3. Keep fallback doctrine centralized.
4. Avoid `as` assertions from raw input.

### When adding a component prop

1. Import the canonical type.
2. Prefer semantic or token-backed helpers over raw strings.
3. Reuse exported defaults rather than inventing local literals.
4. If the prop expresses business truth, check whether it belongs in
   `src/semantic/*` instead of a low-level component.

### When adding generation

1. Normalize inputs deterministically.
2. Emit stable output with no timestamp churn.
3. Add stale detection to CI before relying on the artifact.
4. Document the source of truth, generated output path, and verification step.

## Scalability Rules

As the package grows, do not scale by adding more loosely related constants in
large generic files. Scale by repeating the same pattern predictably.

Required scaling conventions:

- one concept per file when the concept has its own vocabulary or default
- one family per folder: `foundation`, `semantic`, `component`, `domain`,
  `registry`, `policy`, `schema`
- one approved tier per file: simple registry or governed system
- one canonical name per concept across type, tuple, schema, and default
- one enforcement story per risk: authoring, runtime, repo, generated output

Preferred naming shape:

- `densityValues`
- `densitySchema`
- `Density`
- `DEFAULT_DENSITY`
- `densityDefinitions`

Avoid:

- alternate names for the same concept in different layers
- mixing runtime loaders into canonical registry files
- storing feature-specific drift rules in semantic source files
- promoting a Tier 1 file into Tier 2 complexity without a clear trigger

Typography note:

- A text style registry may include inseparable presentation tone when doctrine
  treats the style as one reviewed unit. For example, a caption style may carry
  muted foreground treatment if that coupling is intentional and documented.

## Package Validation

When changing the governance surface in this package, validate at minimum:

- `pnpm --filter @afenda/shadcn-ui format:check`
- `pnpm --filter @afenda/shadcn-ui lint`
- `pnpm --filter @afenda/shadcn-ui typecheck`

If the change affects repo-wide drift prevention or generated artifacts, also run
the relevant workspace CI or guard scripts that consume this package.

## Architecture Summary

This package uses a layered governance model:

1. Canonical authored truth is defined with tuple-derived unions, exported
   defaults, and `satisfies`-checked definitions.
2. Runtime boundary truth is enforced with Zod parsing.
3. Shared construction happens through governed registries, adapters, and
   semantic components.
4. Behavioral enforcement happens through lint, AST rules, import boundaries,
   and CI.
5. Generated integrity is enforced by deterministic generation and stale
   verification when generated artifacts are introduced.
