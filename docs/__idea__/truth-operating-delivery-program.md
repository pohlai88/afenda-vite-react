# Truth operating: stub, remove globally, reintegrate with ERP terms

## Decision record

**Owner direction:** Remove the word "truth" and all associated code **globally** from the codebase. Accept breakage. Only after the term is fully gone can it be reintegrated cleanly using proper ERP vocabulary without naming mismatches from the legacy "truth" abstraction.

**Why accept breakage:** Partial removal or gradual renaming leaves ghost references that cause new code to continue using the old term. A clean break forces every future touch to use the correct ERP term from the start.

---

## Execution: two steps only

### Step 1 — Stub: capture what "truth" is (do nothing else)

Create `apps/web/src/features/truth/` as a **placeholder / knowledge stub** that documents what was understood before removal. No migration, no wiring, no runtime code — just a README summarizing the system.

**What to document in the stub:**

The "truth" system in the existing codebase covers two distinct concerns under one name:

#### Concern A — Operational scope (ERP shell context)

Core ERP navigation context that determines what data the user is working with.

| Artifact | Location | What it does |
|----------|----------|--------------|
| `TruthScope` type | `packages/features/core/src/truth/truth-scope.ts` | Defines `tenantId`, `legalEntityId`, `accountingPeriodId`, `reportingCurrency` |
| `useTruthScopeStore` | `apps/web/src/share/client-store/truth-scope-store.ts` | Zustand store: org/subsidiary/period switching, persisted to localStorage |
| Scope switcher UI | `top-nav-bar.tsx`, `nav-breadcrumb-bar.tsx`, `scope-switcher.tsx` | Renders org/subsidiary pickers in the shell chrome |
| `ScopeOrg`, `ScopeSubsidiary`, `ScopeAccountingPeriod` | `truth-scope-store.ts` | Entity types for scope switching dropdowns |

**ERP equivalent terms:** Operational context, working scope, active entity context, current posting context.

#### Concern B — Integrity / health / alerts

Optional "truth-aware" UI layer that surfaces business-rule violations and system health.

| Artifact | Location | What it does |
|----------|----------|--------------|
| `TruthStatus`, `TruthHealthSummary` types | `packages/features/core/src/truth/truth-status.ts` | Invariant state, severity, scope impact, resolution spec |
| `TruthResolution` | `packages/features/core/src/truth/truth-resolution.ts` | How to fix an issue: key, type, action path |
| `TruthAlertItem`, `TruthActionBarTab`, `TruthBadge` | `packages/features/core/src/truth-ui/` | UI interpretation types for alerts, action bar, badges |
| Selectors (`getHighestSeverity`, `sortByPriorityAndSeverity`, etc.) | `packages/features/core/src/truth-ui/truth-selectors.ts` | Filtering/sorting helpers for alert lists |
| `TruthSeverity` + CSS variable mapping | `packages/features/core/src/truth-ui/truth-severity.ts` | `ok`, `info`, `warning`, `critical` mapped to `--color-truth-*` tokens |
| `useTruthHealthStore` | `apps/web/src/share/client-store/truth-health-store.ts` | Zustand store: health summary + alert list + read state |
| `useTruthNavProps` | `apps/web/src/share/client-store/truth-nav-props.ts` | Composes scope + health stores into `TopNavBar` props |
| `useTruthShellBootstrap` | `apps/web/src/share/client-store/truth-shell-bootstrap.ts` | One-time demo seed when no API has populated stores |
| Demo seed data | `apps/web/src/share/client-store/truth-demo-seed.ts` | Fake orgs, subsidiaries, health, alerts for dev mode |
| `TruthAlertPanel` | `apps/web/src/share/components/block-ui/panel/truth-alert-panel.tsx` | Panel UI listing alerts grouped by severity |
| `TruthAlertTrigger` | `apps/web/src/share/components/block-ui/trigger/truth-alert-trigger.tsx` | Bell icon trigger with unread badge |
| `ResolutionPanel` | `apps/web/src/share/components/block-ui/panel/resolution-panel.tsx` | Panel showing resolution suggestions |
| Command palette truth commands | `apps/web/src/share/components/search/use-palette-commands.ts` | Truth-related Cmd+K commands |

**ERP equivalent terms:** Integrity monitor, system health dashboard, business rule violations, reconciliation alerts, invariant checks.

#### Concern C — Governance / policy / tooling references

| Artifact | Location | What it does |
|----------|----------|--------------|
| Governed import specifiers | `tools/ui-drift/shared/index.ts` | `@afenda/core/truth`, `@afenda/core/truth-ui` in allowed list |
| Ownership roots | `packages/shadcn-ui/src/lib/constant/policy/ownership-policy.ts` | `packages/features/core/src/truth-ui` in `semanticOwnerRoots` |
| Semantic domain adapters | `packages/shadcn-ui/src/semantic/domain/truth-severity.ts` | Maps `TruthSeverity` to semantic badge/alert variants |
| Component policy | `packages/shadcn-ui/src/lib/constant/policy/component-policy.ts` | `truthMappingFromGovernedSource` field |
| Metadata UI policy | `packages/shadcn-ui/src/lib/constant/policy/metadata-ui.ts` | `"truth"` in allowed semantic sources |
| Glossary | `docs/GLOSSARY.md` | Section 10: "Truth operating UI" |
| i18n keys | `apps/web/src/share/i18n/` | `truth_alerts.*`, `user_menu.truth_status` |
| `@afenda/core` package exports | `packages/features/core/package.json` | `"./truth"`, `"./truth-ui"` exports |
| `@afenda/core` barrel | `packages/features/core/src/index.ts` | Re-exports both `truth` and `truth-ui` |
| Domain constant barrel | `packages/shadcn-ui/src/lib/constant/index.ts` | `export * from "./domain/truth-ui"` |
| `TopNavFeatures` | `apps/web/src/share/components/navigation/top-nav/top-nav-bar.tsx` | `truthAlerts`, `resolutions` feature flags |

**The stub is not runtime code.** It is a single README inside `apps/web/src/features/truth/` that captures this knowledge so it survives the global removal.

---

### Step 2 — Global removal: delete everything named "truth"

Delete or strip **all** truth-related code, types, stores, components, imports, policy references, i18n keys, and glossary entries. **Accept that the app will break.** The breakage is intentional — it creates a clean surface for reintegration using correct ERP terms.

#### What gets deleted / emptied

**`packages/features/core/`:**

- `src/truth/` — entire directory (types: `TruthScope`, `TruthStatus`, `TruthHealthSummary`, `TruthResolution`)
- `src/truth-ui/` — entire directory (types + selectors)
- `package.json` exports `"./truth"` and `"./truth-ui"` — remove
- `src/index.ts` — remove re-exports of `truth` and `truth-ui`

**`apps/web/src/share/client-store/`:**

- `truth-scope-store.ts` — delete
- `truth-health-store.ts` — delete
- `truth-demo-seed.ts` — delete
- `truth-nav-props.ts` — delete
- `truth-shell-bootstrap.ts` — delete
- `index.ts` — remove truth store exports
- `sync-action-bar-prefs-context.ts` — remove `useTruthScopeStore` import

**`apps/web/src/share/components/`:**

- `block-ui/panel/truth-alert-panel.tsx` — delete
- `block-ui/trigger/truth-alert-trigger.tsx` — delete
- `block-ui/panel/resolution-panel.tsx` — strip truth imports (or delete if fully truth-owned)
- `navigation/top-nav/top-nav-bar.tsx` — strip truth imports, truth props, truth store subscriptions, truth feature flags
- `navigation/top-nav/top-user-menu.tsx` — strip `TruthHealthSummary` import and health display
- `navigation/scope-strip/nav-breadcrumb-bar.types.ts` — strip `TruthSeverity`
- `search/use-palette-commands.ts` — strip truth imports, store subscriptions, demo seed
- `search/command-palette.types.ts` — strip `TruthSeverity`
- `providers/action-bar-provider.types.ts` — strip `TruthActionBarTab`
- `providers/action-bar-provider.tsx` — strip truth import
- `providers/action-bar-effective-tabs.ts` — strip truth import
- `layout/erp-layout.tsx` — remove `useTruthNavProps` and truth props from `TopNavBar`

**`apps/web/src/features/finance/`:**

- `catalog/finance-action-bar.catalog.ts` — strip `TruthActionBarTab` import

**`packages/shadcn-ui/`:**

- `src/semantic/domain/truth-severity.ts` — delete (or replace with generic severity)
- `src/semantic/components/semantic-badge.tsx` — strip `TruthSeverity` import
- `src/semantic/__test__/semantic-domain-contracts.test.ts` — strip truth severity test
- `src/lib/constant/index.ts` — remove `export * from "./domain/truth-ui"` line
- `src/lib/constant/policy/component-policy.ts` — remove `truthMappingFromGovernedSource`
- `src/lib/constant/policy/metadata-ui.ts` — remove `"truth"` from allowed sources
- `src/lib/constant/policy/ownership-policy.ts` — remove `packages/features/core/src/truth-ui` from roots

**Governance / tooling:**

- `tools/ui-drift/shared/index.ts` — remove truth specifiers and regex patterns
- `scripts/check-ui-drift.ts` — strip truth-UI import check
- `scripts/check-ui-drift-ast.ts` — strip truth-related AST rules

**Docs / i18n:**

- `docs/GLOSSARY.md` — remove or stub Section 10 ("Truth operating UI")
- `apps/web/src/share/components/navigation/RULES.md` — remove truth contract section
- i18n keys prefixed `truth_alerts.*`, `user_menu.truth_status` — remove

**Tests:**

- `apps/web/src/share/components/navigation/__test__/top-nav-bar.test.tsx` — strip truth mocks
- `apps/web/src/share/components/providers/__test__/action-bar-effective-tabs.test.ts` — strip truth types

#### Expected breakage

After removal, the following will fail:

- **TypeScript:** Every file that imported from `@afenda/core/truth` or `@afenda/core/truth-ui` — dozens of red squiggles.
- **Runtime:** `TopNavBar` will lose scope switching, org/subsidiary pickers, health display, alert panels.
- **Tests:** Truth-related test assertions will fail or be missing imports.
- **Governance scripts:** `check-ui-drift` may reference removed specifiers.

**This is intentional.** The breakage surface is the exact map of what needs reintegration under proper ERP terms.

---

## What comes after (future, not in this program)

Once truth is fully removed:

1. **Define ERP-native types** (e.g. `OperationalScope`, `EntityContext`, `IntegrityHealth`) in a feature module or core package using standard ERP/accounting vocabulary.
2. **Rebuild stores** with clean names (`useOperationalScopeStore`, `useIntegrityHealthStore`).
3. **Rebuild UI** — scope switcher, health panel, alerts — as a plug-and-play feature under `apps/web/src/features/`.
4. **Update glossary** with the new ERP-aligned terms.

This is a separate program. It starts only after the global removal is complete and the codebase compiles with the truth-shaped hole visible.

---

## Delivery discipline (retained from review)

The following practices from the external delivery review apply to the execution:

- **PR sizing:** Stub PR is tiny (1 README). Removal PR(s) can be large but mechanical; allow broad file touch count.
- **Rollback:** If removal breaks something unexpected beyond the known surface, revert that specific file change and document the unexpected coupling in the stub README.
- **CI:** After removal, `typecheck` and `test` will fail. That is expected. Do not suppress errors — let them be the migration checklist.
- **Manifest (future):** When reintegrating, use the TypeScript manifest approach with formal row schema from the delivery review (see Part B of the earlier version of this doc, retained below for reference).

---

## Appendix: delivery program refinements (for future reintegration)

Retained from external review for use when rebuilding:

- TypeScript manifest + formal row schema (`exportName`, `sourcePath`, `kind`, `status`, `readmeDocumented`, `coverageTarget`, `directTestRequired`, `deprecationKey`)
- forwardRef policy: required for meaningful DOM/ref surface only; document non-ref components
- Test parity: direct coverage required, incidental not sufficient
- Hardening: test invalid consumer inputs, not only happy paths
- Coverage artifacts: reviewable matrix, not only pass/fail
- Deprecation contract: no deprecated export without metadata + replacement in same PR
- CI gates: split "required now" vs "transitional debt-aware"
- Release-stability: define what "release" means (merged PRs to main, publishes, or RCs)

**Last updated:** owner direction integrated — stub then global remove, accept breakage, reintegrate later with ERP terms.
