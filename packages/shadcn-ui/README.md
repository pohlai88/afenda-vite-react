# `@afenda/shadcn-ui`

Governed semantic UI and copied low-level UI primitives for the Afenda
workspace.

This package exists to stop product UI drift. It gives the repo one reviewed
home for semantic vocabularies, one semantic adapter layer for business truth,
and one composition layer for turning governed inputs into rendered UI.

## Read First

- Architecture and authoring policy:
  `docs/SEMANTIC_GOVERNANCE_ARCHITECTURE.md`
- Public semantic surface: `src/semantic/`
- Governed constant layer: `src/lib/constant/`
- Package entrypoint: `src/index.ts`

## Purpose

This package owns two different responsibilities:

1. Low-level copied primitives in `src/components/`
2. Business-facing semantic UI in `src/semantic/`

Use the semantic layer whenever the UI is expressing business meaning such as
severity, reconciliation outcome, settlement state, allocation state, or
evidence condition.

Use copied primitives only when you are building lower-level reusable UI and no
governed semantic wrapper exists yet.

## Public Imports

- Use `@afenda/shadcn-ui/semantic` for semantic adapters, semantic primitives,
  and semantic React components.
- Use `@afenda/shadcn-ui/components/ui/*` only for low-level primitive work.
- Use `@afenda/shadcn-ui/lib/constant` for governed constants, policy, and
  validation helpers.
- Use `@afenda/shadcn-ui/lib/utils` for low-level package utilities such as
  `cn()`.

## Current Semantic Surface

The current governed semantic surface includes:

- Semantic primitives: `SemanticTone`, `SemanticSurface`,
  `SemanticEmphasis`, `SemanticDensity`, `SemanticSize`
- Domain adapters: `getInvariantUiModel()`, `getAllocationUiModel()`,
  `getSettlementUiModel()`, `getReconciliationUiModel()`,
  `getEvidenceUiModel()`
- Semantic components: `SemanticBadge`, `SemanticAlert`, `SemanticPanel`,
  `SemanticSection`, `SemanticField`
- Domain wrappers: `InvariantBadge`, `InvariantAlert`, `AllocationBadge`,
  `SettlementBadge`, `ReconciliationAlert`

Deferred for later expansion:

- Generic `status`, `authority`, and `command` adapters
- Broader semantic component catalog such as tables, timelines, or stats
- Stricter feature-level enforcement where the current signal is still noisy

## Architecture Overview

This package is intentionally layered:

1. `src/lib/constant/*` defines governed truth
2. `src/semantic/primitives/*` exposes semantic-facing aliases of governed truth
3. `src/semantic/domain/*` maps business truth into semantic UI models
4. `src/semantic/internal/*` composes governed classes and rendering helpers
5. `src/semantic/components/*` renders business-facing semantic React UI
6. `src/components/ui/*` remains the low-level primitive layer

The detailed architecture policy, authoring rules, and enforcement model live in
`docs/SEMANTIC_GOVERNANCE_ARCHITECTURE.md`.

## Runtime Render Flow

This is the runtime path from business state to rendered UI:

```text
Business truth / domain state
  -> src/semantic/domain/*
     - allocation.ts
     - evidence.ts
     - invariant.ts
     - reconciliation.ts
     - settlement.ts

  -> outputs semantic UI models
     - tone
     - emphasis
     - badgeLabel
     - icon
     - role

  -> consumed by src/semantic/components/*
     - semantic-alert.tsx
     - semantic-badge.tsx
     - semantic-field.tsx
     - semantic-panel.tsx
     - semantic-section.tsx

  -> components call src/semantic/internal/presentation.ts
     - getAlertClasses()
     - getBadgeClasses()
     - getPanelClasses()
     - getFieldStackClasses()
     - getPanelSectionSpacing()
     - renderSemanticIcon()

  -> presentation composes governed constants from src/lib/constant/*
     - semantic/tone.ts
     - semantic/emphasis.ts
     - semantic/surface.ts
     - foundation/density.ts

  -> final rendered React UI
```

## Governance Dependency Flow

This is the authoring and dependency direction that should be preserved:

```text
Public package surface
  -> src/index.ts
  -> src/semantic/index.ts
  -> src/lib/constant/index.ts

Governed source of truth
  -> src/lib/constant/semantic/*
  -> src/lib/constant/foundation/*
  -> src/lib/constant/component/*
  -> src/lib/constant/policy/*
  -> src/lib/constant/validate-constants.ts
  -> src/lib/constant/governance-version.ts

Semantic-facing aliases
  -> src/semantic/primitives/*

Business-truth adapters
  -> src/semantic/domain/*

Composition-only resolver
  -> src/semantic/internal/presentation.ts

Rendered semantic UI
  -> src/semantic/components/*

Separate low-level primitive layer
  -> src/components/ui/*
```

## Entry-To-Exit Hierarchy

Use this section when deciding whether a file belongs here, whether a layer is
duplicated, or whether a folder can be pruned.

```text
ENTRY
  @afenda/shadcn-ui
    -> src/index.ts
      -> src/semantic/index.ts
        -> components/*
        -> domain/*
        -> primitives/*
        -> internal/presentation.ts
      -> src/lib/constant/index.ts
        -> semantic/*
        -> foundation/*
        -> component/*
        -> policy/*
        -> validate-constants.ts
        -> governance-version.ts
      -> src/components/ui/*
      -> src/components/theme-provider.tsx
      -> src/lib/utils.ts

EXITS
  1. Governed vocabularies and mappings
  2. Validation and governance metadata
  3. Composed semantic classes
  4. Business-facing semantic React UI
  5. Low-level copied UI primitives
```

## Source Of Truth Rules

These are the architectural constraints that matter most.

### Canonical truth

- `src/lib/constant/*` is the only place allowed to define canonical semantic
  vocabularies and reviewed mappings.
- If a vocabulary, mapping, or policy is reused across multiple semantic files,
  it belongs in the constant layer.
- Tuple-derived unions, exported schemas, and `satisfies`-checked maps should be
  authored here first.

### Semantic primitives

- `src/semantic/primitives/*` should be aliases or thin semantic-facing exports.
- Semantic primitives must not become a second registry layer.
- Do not define a new local union in `src/semantic/primitives/*` if the value is
  already governed in `src/lib/constant/*`.

### Semantic adapters

- `src/semantic/domain/*` converts business truth into semantic UI models.
- Adapters may choose labels, icons, tone, emphasis, and role.
- Adapters must not recreate class maps, raw Tailwind token systems, or second
  semantic vocabularies.

### Presentation resolver

- `src/semantic/internal/presentation.ts` is composition-only.
- It may compose governed helpers.
- It must not define new semantic maps, new semantic literals, or feature-level
  styling systems.

### Semantic components

- `src/semantic/components/*` consumes semantic models and presentation helpers.
- Components should render, not redefine doctrine.
- If a component starts owning business-state mapping, move that logic down into
  `src/semantic/domain/*`.

### Primitive layer

- `src/components/ui/*` stays low-level and reusable.
- If a primitive starts expressing business meaning, that concern belongs in the
  semantic layer instead.

## Anti-Duplication Constraints

These rules exist specifically to avoid redundant files and overlapping layers.

Do not create:

- A second semantic vocabulary in `src/semantic/*` when one already exists in
  `src/lib/constant/*`
- Inline class maps in components or resolvers when a governed helper already
  exists
- Parallel domain-to-UI mappings in two folders unless one is clearly temporary
  and scheduled for deletion
- Extra barrel files that do not create a meaningful public surface
- Public exports for internal-only helpers just to make imports shorter
- Component-local badge, alert, tone, severity, or status systems that bypass
  the semantic layer
- New folders whose job overlaps an existing layer without a documented reason
- CVA variant definitions in `src/semantic/components/*`

### CVA boundary rule

CVA (`class-variance-authority`) belongs only in `src/components/ui/*` (the
primitive layer). It is appropriate there because primitives expose open-ended
variant combinatorics to consumers.

The semantic layer (`src/semantic/components/*`) must not use CVA. The governed
constant layer already owns the variant space via exhaustive typed maps with
`satisfies` checking. Introducing CVA at the semantic level would create a third
indirection layer (constants → CVA → component) without benefit and would give
consumers the false impression that semantic variants are composable outside the
governed model.

Summary:
- `src/components/ui/*`: CVA is correct here. Consumers choose from open variant sets.
- `src/semantic/components/*`: CVA is forbidden here. Governed maps already close the variant space.
- `src/semantic/internal/presentation.ts`: uses `cn()` to compose governed helper outputs only.
- `src/lib/constant/*`: owns the governed maps that CVA would otherwise duplicate.

Before adding a file, ask:

1. Is this file defining truth, adapting truth, composing truth, or consuming truth?
2. Does an existing file already own that job?
3. Would this new file create a second source of truth?
4. Will future changes now need to touch two places instead of one?
5. If this file disappeared, would the architecture become clearer?

If the answer suggests overlap, do not create the file until the boundary is
clear.

## Pruning Guidance

When slimming down this package, prefer these principles:

- Remove orphaned semantic primitives before removing active shared ones.
- Remove barrel layers that only re-export nearby files and do not define a real
  external contract.
- Collapse validation mirrors only when tooling still has one stable place to
  read from.
- Do not remove current public semantic exports accidentally. Treat those as API
  changes.
- When two layers map the same business truth, choose one canonical owner and
  migrate deliberately instead of letting both persist.

High-confidence trim patterns:

- Unused semantic primitive files
- Redundant barrel files
- Duplicate mapping layers with no distinct consumer
- Inline semantic maps that can be replaced by governed helpers

Lower-confidence trim patterns that need migration planning:

- Public export paths
- Files referenced by drift tooling
- Shared utility paths exposed in `package.json`
- Runtime adapters that already have downstream consumers

## Header Taxonomy

Source files in `src/` use short annotation headers to clarify their role.

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
- `UTILITY MODULE`: low-level reusable utilities
- `COPIED PRIMITIVE`: copied low-level UI primitives

## Governance Rules

The governed rule catalog lives in `src/lib/constant/rule-policy.ts`.

Current enforcement posture:

- Hard fail:
  - direct Radix imports outside governed UI
  - `cva` outside governed UI
  - raw palette classes
  - hardcoded color literals
  - arbitrary Tailwind values
  - inline visual styles
  - local semantic or truth mappings where the checker has strong evidence
- Warning:
  - raw Tailwind `className` usage in feature files
  - raw container blocks where semantic wrappers are likely expected
  - token overuse
  - `className` complexity
  - low-level primitive imports from feature code when a semantic wrapper exists

## Validation Expectations

When changing this package:

- Read `docs/SEMANTIC_GOVERNANCE_ARCHITECTURE.md` if the change affects
  constants, semantic types, validation, generators, or enforcement.
- Keep canonical constant exports and semantic consumers synchronized.
- Preserve public package export paths unless the change is intentionally a
  contract migration.
- Prefer one source of truth over convenience re-exports.
- Run `pnpm --filter @afenda/shadcn-ui format:check`
- Run `pnpm --filter @afenda/shadcn-ui lint`
- Run `pnpm --filter @afenda/shadcn-ui typecheck`
- Run focused Vitest coverage for semantic-layer behavior when the change
  affects adapters, rendering, or validation.

## Design Notes

- Semantic APIs should express business meaning, not raw visual decisions.
- Compile-time authored truth comes first; runtime schemas exist for trust at
  boundaries.
- The semantic layer should stay small, intentional, and reviewable.
- The primitive layer should stay reusable, but it should not become a place for
  product-specific meaning.
- If the architecture makes a contributor touch two files for one meaning
  change, assume there may be duplication and inspect the boundary before adding
  more code.
