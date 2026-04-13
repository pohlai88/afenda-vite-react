# Improve vs Enforce — Tokenization / Design Architecture Testing Policy

**Package:** `@afenda/design-system`  
**Shared defaults:** [`packages/vitest-config/TESTING.md`](../vitest-config/TESTING.md), [`packages/vitest-config/AGENTS.md`](../vitest-config/AGENTS.md)  
**Vitest config:** [`vitest.config.ts`](./vitest.config.ts)

---

## Purpose

This policy exists to ensure the `design-architecture` tokenization pipeline is tested as **architecture**, not as incidental utility code.

The goal is not to “get green.” The goal is to ensure that canonical design-token surfaces remain:

- correct
- deterministic
- reviewable
- difficult to regress

This policy applies especially to:

```text
packages/design-system/design-architecture/src/tokenization/**/*.ts
```

That surface is a canonical pipeline:

```text
constants
→ types
→ contract
→ source
→ normalize
→ bridge
→ serialize
→ emit
```

---

## 1. Enforcement order

Testing and CI must follow this order of priority:

```text
1. Correctness
2. Determinism
3. Artifact stability
4. Coverage
5. CI enforcement
```

This order is intentional.

Coverage is important, but it is not the first proof of quality. A file can be highly covered and still allow architectural drift.

---

## 2. Improve — raise the testing bar meaningfully

### 2.1 Expand `coverage.include` only for canonical surfaces

Do not widen coverage blindly by folder. Only include files that are now considered stable architectural/runtime surfaces.

For this package, the tokenization expansion target is:

```text
design-architecture/src/tokenization/**/*.ts
```

(listed in [`vitest.config.ts`](./vitest.config.ts) alongside icons metadata and `utils/cn.ts`)

This is better than broadly including all of `design-architecture/src/**`, because it matches ownership boundaries.

### 2.2 Add tests that prove contracts, not implementation trivia

The pipeline must be tested through stable guarantees, including:

- token vocabulary integrity
- exact contract validation
- deterministic normalization
- no duplicate declarations after bridge merge
- stable CSS serialization
- stable emitted artifact output

Prefer tests against:

- explicit contract failures
- final declaration sets
- serialized CSS sections
- generated artifact content

Avoid over-testing small helper internals unless they are directly architectural.

### 2.3 Use snapshots only where they are meaningful

Snapshots should be used for:

- serialized CSS output
- emitted generated CSS artifacts

Snapshots should not be the main strategy for:

- constants
- tiny helpers
- trivial record access

Snapshots are useful only where the output is a governed artifact surface.

### 2.4 Review coverage with the right questions

When running coverage locally, do not only ask: “what lines are unhit?”

Ask:

- are contract rejection branches tested?
- are deterministic ordering paths tested?
- is bridge merge behavior tested?
- is emitted artifact content tested?
- are snapshots covering the real runtime surface?

That is the correct review lens for this pipeline.

---

## 3. Enforce — make regression difficult

### 3.1 Coverage thresholds only matter if the scope is correct

[`vitest.config.ts`](./vitest.config.ts) thresholds are valuable only if `coverage.include` points to the canonical product surface.

If the include list is too narrow, the signal is weak even if the threshold is high.

**Rule:** Do not lower thresholds to make the build pass. Expand or narrow `coverage.include` deliberately according to ownership.

**Current thresholds (see config):** 90% lines, statements, functions; 86% branches (branch floor is slightly lower because a few defensive branches in `token-bridge` are hard to reach without refactoring eager exports or heavy mocks).

### 3.2 Coverage does not replace architectural tests

A high coverage percentage is not proof of architecture safety.

The required protection stack is:

- correctness tests
- determinism tests
- artifact stability tests
- coverage thresholds
- CI enforcement

Coverage is one layer, not the whole gate.

### 3.3 CI must run coverage for canonical tokenization surfaces

For `@afenda/design-system`, CI includes a required step:

```bash
pnpm --filter @afenda/design-system test:coverage
```

(see [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml))

Without that, the threshold would be advisory rather than enforceable.

Workspace tests also run via `turbo run test:run` (design-system is included); **`test:coverage` is an additional merge gate.**

### 3.4 Artifact drift enforcement alongside coverage

Because the pipeline includes serialize and emit, CI also verifies that generated theme artifacts stay in sync with the generator.

**Commands:**

```bash
pnpm --filter @afenda/design-system test:run
pnpm --filter @afenda/design-system test:coverage
pnpm --filter @afenda/design-system test:update-generated-check
```

`test:update-generated-check` is an alias for `test:generated-drift-check`: it regenerates `design-architecture/src/generated/generated-theme.css` and `generated-theme.manifest.json`, then fails if the working tree differs.

Coverage alone does not prove emitted output integrity.

---

## 4. Concrete testing expectations for tokenization

### 4.1 Correctness

Tests should verify:

- constants contain no duplicates
- contracts reject missing required keys
- contracts reject unknown keys
- source is valid against the contract
- bridge outputs expected declaration families
- serializer emits expected sections
- emitter produces generator-owned output

### 4.2 Determinism

Tests should verify:

- normalization is idempotent
- canonical order is preserved
- keyframe step ordering is stable
- merged declarations behave as specified (no unintended duplication of semantics)
- serialization output is byte-stable under stable input

### 4.3 Artifact stability

Tests should verify:

- serialized CSS contains expected runtime surfaces
- emitted CSS contains the generator header
- emitted CSS remains stable unless intentional change occurs
- snapshots are reviewed intentionally, not accepted mechanically

---

## 5. Recommended CI and PR policy

### CI

For canonical tokenization surfaces, CI enforces:

- `test:run` (via Turborepo with the rest of the workspace)
- `test:coverage` (design-system–specific step)
- generated artifact drift check (`test:update-generated-check` / `test:generated-drift-check`)

### PR review

If `design-architecture/src/tokenization/**` changed:

- run `@afenda/design-system` `test:coverage` locally
- verify generated theme output if the generator path or tokens changed (`test:update-generated-check` or `pnpm --filter @afenda/design-system run generate-design-system`, then review diffs)

---

## 6. Policy decisions (recommended defaults)

| Question | Recommendation |
| --- | --- |
| Should tokenization be in `coverage.include`? | **Yes** for `design-architecture/src/tokenization/**/*.ts` when the pipeline is canonical (current config). |
| Should coverage be required in CI? | **Yes** — use `pnpm --filter @afenda/design-system test:coverage`. |
| How should generated or volatile paths be handled? | **Exclude narrowly and explicitly.** Do not lower thresholds to compensate for sloppy scoping. |

---

## 7. Final policy statement

Improve by expanding `coverage.include` only to canonical tokenization surfaces and closing gaps with meaningful correctness, determinism, and artifact tests.

Enforce by making `test:coverage` a required CI step and pairing it with generated-artifact drift checks.

**Coverage alone does not prove architectural integrity.** For this pipeline, the real proof is:

- contracts that fail correctly
- normalization that is deterministic
- bridge output that does not drift
- serialized CSS that is stable
- emitted artifacts that remain governed

That is the standard this pipeline should meet.

---

## No “turn green” compromises

- **Do not** delete or weaken assertions, skip suites permanently, or use `test.only` to merge failing work.
- **Do not** drop thresholds or broaden `coverage.exclude` to hide gaps — use **narrow** excludes for generated/volatile paths only, with review.
- When a failure is legitimate, **fix production code** or **update tests** because behavior changed — not to silence the runner.
