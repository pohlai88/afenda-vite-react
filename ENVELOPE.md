# File envelope (10-line annotation)

**Canonical location:** repository root (`ENVELOPE.md`) only. Do not duplicate this document inside application `src/` trees; link here from package READMEs if needed.

Disciplined top-of-file JSDoc for TypeScript modules. Each file gets **exactly ten ` *` lines** between `/**` and ` */` (blank lines count as lines that contain only ` *`).

Place the envelope **immediately above** imports; one envelope per file.

---

## Lines (fixed order)

| Line   | Role                                                                                                                             |
| ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **1**  | **Title** — What this file is, in one sentence.                                                                                  |
| **2**  | **Boundary** — What it **owns** vs what is **explicitly out of scope** (short phrases).                                          |
| **3**  | **Layer** — `platform` \| `module` \| `adapter` \| `test` \| `script` · plus **concern** (e.g. `http`, `cors`, `audit`, `auth`). |
| **4**  | **Upstream** — Main **dependencies** (packages, DB, env vars) or `none`.                                                         |
| **5**  | **Downstream** — **Who consumes** this (import pattern, route prefix, or `internal-only`).                                       |
| **6**  | **I/O & effects** — Side effects: DB, network, filesystem, globals; or **`pure` / `none`**.                                      |
| **7**  | **Coupling** — Tight links: contracts, sibling modules, or **`standalone`**.                                                     |
| **8**  | **Stability** — `experimental` \| `stable` \| `legacy` \| `internal`.                                                            |
| **9**  | **`@module`** — Canonical path from the package `src/` root (e.g. `platform/middleware/audit-context`).                          |
| **10** | **`@package`** — Package name (e.g. `@afenda/api`) for monorepo clarity.                                                         |

**Rules**

- Use ` *` on every line; avoid empty content — if a line does not apply, use **`N/A`**, **`none`**, or **`internal-only`** explicitly.
- Keep each line roughly within **~90 characters** for readability.
- Tests: line 3 uses `test · vitest` (or your runner); line 6 is often `Side effects: none`.

---

## Example

```ts
/**
 * Extracts audit correlation headers into Hono context for governed audit rows.
 * Owns header parsing only; does not perform audit writes or authorize tenants.
 * platform · http · middleware · audit correlation
 * Upstream: hono; optional W3C traceparent. Env: none.
 * Downstream: any route/handler after this middleware via c.var.audit.
 * Side effects: mutates Hono context only; no I/O.
 * Coupling: audit_logs schema (field names); pairs with insertGovernedAuditLog call sites.
 * stable
 * @module platform/middleware/audit-context
 * @package @afenda/api
 */
```

---

## Test file example

Same ten lines; line 3 uses `test · vitest`; line 5 names **what is under test**; line 6 is often `Side effects: none`.

---

## Rationale

Forces a short, consistent **mental model** per file: purpose, boundaries, layer, wiring, and stability — without turning into a long narrative.
