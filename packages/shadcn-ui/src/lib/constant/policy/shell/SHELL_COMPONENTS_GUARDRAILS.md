# Shell Components Guardrails

## Purpose

This is the live guardrail document for shell components:

- where we are now (registry + runtime)
- the **enterprise shell matrix** (multi-tenant completeness: structure, identity, command, governance, security, enterprise state)
- phased build order and Definition of Done (DoD)

**Location:** colocated with shell policy modules under `packages/shadcn-ui/src/lib/constant/policy/shell/`.

**Idea churn:** [`docs/__idea__/working_ref.md`](../../../../../../../docs/__idea__/working_ref.md) may contain draft matrix edits; when stable, fold them into this document.

## Canonical Sources of Truth

- Contract: `shell-component-contract.ts`
- Registry: `shell-component-registry.ts`
- Registry validator: `validate-shell-registry.ts`
- Runtime primitives: `apps/web/src/share/components/shell-ui/*`
- **`content.main` state frames** (loading vs empty vs degraded): [`apps/web/src/share/components/shell-ui/RULES.md`](../../../../../../../apps/web/src/share/components/shell-ui/RULES.md#content-main-state-frames)
- Report: `.artifacts/reports/shell-governance/shell-governance-report.vNNNN.json`
- Current Status table (auto): `pnpm run script:generate-shell-components-guardrails` after registry/contract changes

## Naming Convention

- Registry keys: kebab-case (`shell-foo-bar`)
- Components: PascalCase with `Shell` prefix (`ShellFooBar`)

## Current Status (Implemented and Registered)

Authoritative list: **contract + registry + runtime** in this repository. The enterprise matrix below is the **target catalog**; rows there may still say Ready/Missing while this section reflects what is actually merged.

<!-- shell-components-current-status:begin -->

> **Generated** — do not edit between markers. Run `pnpm run script:generate-shell-components-guardrails`.

| Key                        | Component                | Zone      | Kind         | Runtime file                                                                     |
| -------------------------- | ------------------------ | --------- | ------------ | -------------------------------------------------------------------------------- |
| `shell-action-slot`        | `ShellActionSlot`        | `header`  | `command`    | `apps/web/src/share/components/shell-ui/components/shell-action-slot.tsx`        |
| `shell-breadcrumbs`        | `ShellBreadcrumbs`       | `header`  | `navigation` | `apps/web/src/share/components/shell-ui/components/shell-breadcrumbs.tsx`        |
| `shell-content`            | `ShellContent`           | `content` | `content`    | `apps/web/src/share/components/shell-ui/components/shell-content.tsx`            |
| `shell-degraded-frame`     | `ShellDegradedFrame`     | `content` | `governance` | `apps/web/src/share/components/shell-ui/components/shell-degraded-frame.tsx`     |
| `shell-empty-state-frame`  | `ShellEmptyStateFrame`   | `content` | `platform`   | `apps/web/src/share/components/shell-ui/components/shell-empty-state-frame.tsx`  |
| `shell-header`             | `ShellHeader`            | `header`  | `platform`   | `apps/web/src/share/components/shell-ui/components/shell-header.tsx`             |
| `shell-loading-frame`      | `ShellLoadingFrame`      | `content` | `platform`   | `apps/web/src/share/components/shell-ui/components/shell-loading-frame.tsx`      |
| `shell-overlay-container`  | `ShellOverlayContainer`  | `overlay` | `overlay`    | `apps/web/src/share/components/shell-ui/components/shell-overlay-container.tsx`  |
| `shell-popover-content`    | `ShellPopoverContent`    | `overlay` | `overlay`    | `apps/web/src/share/components/shell-ui/components/shell-popover-content.tsx`    |
| `shell-root`               | `ShellRoot`              | `root`    | `platform`   | `apps/web/src/share/components/shell-ui/components/shell-root.tsx`               |
| `shell-search-bar`         | `ShellSearchBar`         | `header`  | `command`    | `apps/web/src/share/components/shell-ui/components/shell-search-bar.tsx`         |
| `shell-sidebar`            | `ShellSidebar`           | `sidebar` | `navigation` | `apps/web/src/share/components/shell-ui/components/shell-sidebar.tsx`            |
| `shell-tenant-switcher`    | `ShellTenantSwitcher`    | `header`  | `identity`   | `apps/web/src/share/components/shell-ui/components/shell-tenant-switcher.tsx`    |
| `shell-title`              | `ShellTitle`             | `header`  | `platform`   | `apps/web/src/share/components/shell-ui/components/shell-title.tsx`              |
| `shell-workspace-switcher` | `ShellWorkspaceSwitcher` | `header`  | `identity`   | `apps/web/src/share/components/shell-ui/components/shell-workspace-switcher.tsx` |

<!-- shell-components-current-status:end -->

---

## Status legend (enterprise matrix)

| Label                      | Meaning                                                  |
| -------------------------- | -------------------------------------------------------- |
| **Implemented**            | Present in the matrix author’s tracking (see note below) |
| **Foundation**             | Must exist before the shell is considered real           |
| **Enterprise Core**        | Required for multi-tenant enterprise correctness         |
| **Operational Governance** | Production-grade trust, compliance, ops, and support     |
| **Expansion**              | Valuable after the shell core is stable                  |

**Matrix `Current status` values** (`Implemented`, `Ready`, `Next`, `Missing`) describe the **target rollout**, not the auto-generated table above. For git truth, always use **Current Status (Implemented and Registered)**.

---

## Matrix columns (roadmap for contract and registry)

When promoting a shell component from “planned” to “governed”, capture at least:

| Column                          | Why                                                                    |
| ------------------------------- | ---------------------------------------------------------------------- |
| `Scope`                         | platform / tenant / workspace / user / session / environment truth     |
| `Isolation`                     | `tenant_strict` / `workspace_strict` / `session_bound` / `global_safe` |
| `Priority tier`                 | Foundation vs Enterprise Core vs Operational Governance vs Expansion   |
| `Required providers / contexts` | implementation clarity (maps to participation modes and app providers) |
| `Blocked by`                    | sequencing (optional; add when you track dependencies explicitly)      |
| `Enterprise state coverage`     | proves completeness (unresolved, denied, offline, degraded, no-data)   |

The TypeScript contract today encodes zone, kind, and shell-runtime dependencies; **scope** and **isolation** are first-class in the matrix and should be added to the enforced contract when the team is ready for a schema migration.

---

## Enterprise shell matrix

### A. Structural shell surfaces

| Key                       | Component               | Zone      | Kind       | Scope    | Isolation     | Priority               | Current status | Required providers / contexts                                             | Notes                                      |
| ------------------------- | ----------------------- | --------- | ---------- | -------- | ------------- | ---------------------- | -------------- | ------------------------------------------------------------------------- | ------------------------------------------ |
| `shell-root`              | `ShellRoot`             | `root`    | platform   | platform | tenant_strict | Foundation             | Ready          | shell metadata, session, tenant, responsive shell                         | canonical shell runtime boundary           |
| `shell-header`            | `ShellHeader`           | `header`  | platform   | platform | tenant_strict | Foundation             | Ready          | shell metadata, session, tenant, responsive shell, density                | top shell infrastructure                   |
| `shell-sidebar`           | `ShellSidebar`          | `sidebar` | navigation | tenant   | tenant_strict | Foundation             | Ready          | shell metadata, tenant, permission, navigation, density, responsive shell | primary navigation truth                   |
| `shell-content`           | `ShellContent`          | `content` | content    | tenant   | tenant_strict | Foundation             | Ready          | shell metadata, tenant, session, responsive shell                         | primary app rendering frame                |
| `shell-panel`             | `ShellPanel`            | `panel`   | supporting | tenant   | tenant_strict | Enterprise Core        | Next           | shell metadata, tenant, responsive shell                                  | secondary shell workspace                  |
| `shell-footer`            | `ShellFooter`           | `footer`  | platform   | platform | global_safe   | Enterprise Core        | Next           | shell metadata, responsive shell, density                                 | global status/legal/help region            |
| `shell-overlay-container` | `ShellOverlayContainer` | `overlay` | overlay    | platform | session_bound | Foundation             | Next           | shell metadata, session, responsive shell                                 | canonical modal/popover overlay host       |
| `shell-rail-navigation`   | `ShellRailNavigation`   | `sidebar` | navigation | tenant   | tenant_strict | Enterprise Core        | Missing        | shell metadata, tenant, permission, navigation                            | collapsed-sidebar enterprise mode          |
| `shell-loading-frame`     | `ShellLoadingFrame`     | `content` | platform   | platform | global_safe   | Operational Governance | Ready          | shell metadata, responsive shell                                          | canonical shell loading skeleton           |
| `shell-degraded-frame`    | `ShellDegradedFrame`    | `content` | governance | platform | global_safe   | Operational Governance | Ready          | shell metadata, session                                                   | degraded runtime fallback container        |
| `shell-empty-state-frame` | `ShellEmptyStateFrame`  | `content` | platform   | tenant   | tenant_strict | Enterprise Core        | Ready          | shell metadata, tenant                                                    | no-tenant/no-workspace/no-data shell state |

### B. Identity and scope surfaces

| Key                                | Component                       | Zone     | Kind       | Scope     | Isolation        | Priority               | Current status | Required providers / contexts                          | Notes                                             |
| ---------------------------------- | ------------------------------- | -------- | ---------- | --------- | ---------------- | ---------------------- | -------------- | ------------------------------------------------------ | ------------------------------------------------- |
| `shell-tenant-switcher`            | `ShellTenantSwitcher`           | `header` | identity   | tenant    | tenant_strict    | Foundation             | Ready          | shell metadata, session, tenant, permission            | canonical tenant switching                        |
| `shell-workspace-switcher`         | `ShellWorkspaceSwitcher`        | `header` | identity   | workspace | workspace_strict | Foundation             | Ready          | shell metadata, session, tenant, workspace, permission | canonical workspace switching                     |
| `shell-breadcrumbs`                | `ShellBreadcrumbs`              | `header` | navigation | workspace | tenant_strict    | Enterprise Core        | Ready          | shell metadata, navigation, tenant, optional workspace | shell-aware path truth                            |
| `shell-org-profile-menu`           | `ShellOrgProfileMenu`           | `header` | identity   | tenant    | tenant_strict    | Enterprise Core        | Next           | shell metadata, session, tenant                        | organization context menu                         |
| `shell-user-account-menu`          | `ShellUserAccountMenu`          | `header` | identity   | user      | session_bound    | Enterprise Core        | Next           | shell metadata, session                                | user/session menu                                 |
| `shell-current-tenant-badge`       | `ShellCurrentTenantBadge`       | `header` | identity   | tenant    | tenant_strict    | Enterprise Core        | Missing        | shell metadata, tenant                                 | visible tenant truth surface                      |
| `shell-current-workspace-badge`    | `ShellCurrentWorkspaceBadge`    | `header` | identity   | workspace | workspace_strict | Enterprise Core        | Missing        | shell metadata, tenant, workspace                      | visible workspace truth surface                   |
| `shell-tenant-access-indicator`    | `ShellTenantAccessIndicator`    | `header` | security   | tenant    | tenant_strict    | Operational Governance | Missing        | shell metadata, tenant, permission                     | suspended/restricted tenant access signal         |
| `shell-workspace-access-indicator` | `ShellWorkspaceAccessIndicator` | `header` | security   | workspace | workspace_strict | Operational Governance | Missing        | shell metadata, workspace, permission                  | workspace restriction signal                      |
| `shell-read-only-mode-banner`      | `ShellReadOnlyModeBanner`       | `header` | governance | tenant    | tenant_strict    | Operational Governance | Missing        | shell metadata, tenant, permission                     | critical for enterprise restricted operation mode |

### C. Command, search, and productivity surfaces

| Key                               | Component                      | Zone      | Kind       | Scope     | Isolation        | Priority               | Current status | Required providers / contexts                              | Notes                                     |
| --------------------------------- | ------------------------------ | --------- | ---------- | --------- | ---------------- | ---------------------- | -------------- | ---------------------------------------------------------- | ----------------------------------------- |
| `shell-search-bar`                | `ShellSearchBar`               | `header`  | command    | tenant    | tenant_strict    | Foundation             | Ready          | shell metadata, command infra, tenant, permission          | primary search entry                      |
| `shell-command-palette-trigger`   | `ShellCommandPaletteTrigger`   | `command` | command    | tenant    | tenant_strict    | Enterprise Core        | Next           | shell metadata, command infra, tenant, permission          | keyboard/global command entry             |
| `shell-command-palette-dialog`    | `ShellCommandPaletteDialog`    | `command` | command    | tenant    | tenant_strict    | Enterprise Core        | Next           | shell metadata, command infra, tenant, permission, overlay | global command runtime                    |
| `shell-global-quick-actions`      | `ShellGlobalQuickActions`      | `panel`   | command    | workspace | tenant_strict    | Expansion              | Next           | shell metadata, command infra, tenant, permission          | enterprise shortcuts/actions              |
| `shell-global-create-trigger`     | `ShellGlobalCreateTrigger`     | `header`  | command    | workspace | tenant_strict    | Expansion              | Missing        | shell metadata, command infra, tenant, permission          | fast creation surface                     |
| `shell-recents-panel`             | `ShellRecentsPanel`            | `panel`   | command    | user      | session_bound    | Expansion              | Missing        | shell metadata, session, command infra                     | recent surfaces/history                   |
| `shell-saved-views-entry-point`   | `ShellSavedViewsEntryPoint`    | `header`  | command    | workspace | workspace_strict | Expansion              | Missing        | shell metadata, workspace, permission                      | saved views/queries                       |
| `shell-search-scope-indicator`    | `ShellSearchScopeIndicator`    | `header`  | governance | tenant    | tenant_strict    | Enterprise Core        | Missing        | shell metadata, tenant, permission                         | clarifies search scope and restrictions   |
| `shell-restricted-results-banner` | `ShellRestrictedResultsBanner` | `overlay` | governance | tenant    | tenant_strict    | Operational Governance | Missing        | shell metadata, permission, command infra                  | warns when results are permission-limited |

### D. Notifications, governance, and operational trust surfaces

| Key                                 | Component                        | Zone      | Kind         | Scope       | Isolation     | Priority               | Current status | Required providers / contexts                   | Notes                                 |
| ----------------------------------- | -------------------------------- | --------- | ------------ | ----------- | ------------- | ---------------------- | -------------- | ----------------------------------------------- | ------------------------------------- |
| `shell-notification-center-trigger` | `ShellNotificationCenterTrigger` | `header`  | notification | user        | session_bound | Enterprise Core        | Next           | shell metadata, session, notifications          | entry into notification system        |
| `shell-notification-center-panel`   | `ShellNotificationCenterPanel`   | `overlay` | notification | user        | session_bound | Enterprise Core        | Next           | shell metadata, session, notifications, overlay | notification inbox surface            |
| `shell-policy-banner`               | `ShellPolicyBanner`              | `overlay` | governance   | tenant      | tenant_strict | Enterprise Core        | Ready          | shell metadata, tenant, permission              | compliance/policy notice              |
| `shell-status-indicator`            | `ShellStatusIndicator`           | `footer`  | governance   | platform    | global_safe   | Operational Governance | Next           | shell metadata                                  | general product status                |
| `shell-environment-badge`           | `ShellEnvironmentBadge`          | `header`  | governance   | environment | global_safe   | Operational Governance | Next           | shell metadata                                  | prod/staging/sandbox identity         |
| `shell-audit-entry-point`           | `ShellAuditEntryPoint`           | `panel`   | governance   | tenant      | tenant_strict | Operational Governance | Next           | shell metadata, tenant, permission              | audit/log entry                       |
| `shell-maintenance-banner`          | `ShellMaintenanceBanner`         | `header`  | governance   | platform    | global_safe   | Operational Governance | Missing        | shell metadata, session                         | maintenance window notice             |
| `shell-incident-banner`             | `ShellIncidentBanner`            | `header`  | governance   | platform    | global_safe   | Operational Governance | Missing        | shell metadata, session                         | outage/degraded service notice        |
| `shell-sync-status-indicator`       | `ShellSyncStatusIndicator`       | `footer`  | governance   | tenant      | tenant_strict | Operational Governance | Missing        | shell metadata, tenant                          | sync/replication/import/export health |
| `shell-data-region-indicator`       | `ShellDataRegionIndicator`       | `footer`  | governance   | environment | global_safe   | Operational Governance | Missing        | shell metadata, optional tenant                 | data residency/region signal          |
| `shell-compliance-status-badge`     | `ShellComplianceStatusBadge`     | `header`  | governance   | tenant      | tenant_strict | Operational Governance | Missing        | shell metadata, tenant, permission              | enterprise compliance posture         |
| `shell-release-impact-banner`       | `ShellReleaseImpactBanner`       | `overlay` | governance   | platform    | global_safe   | Expansion              | Missing        | shell metadata                                  | migration/release notice              |

### E. Security, support, and session-risk surfaces

| Key                               | Component                      | Zone      | Kind       | Scope    | Isolation     | Priority               | Current status | Required providers / contexts                     | Notes                        |
| --------------------------------- | ------------------------------ | --------- | ---------- | -------- | ------------- | ---------------------- | -------------- | ------------------------------------------------- | ---------------------------- |
| `shell-delegated-access-banner`   | `ShellDelegatedAccessBanner`   | `header`  | security   | session  | session_bound | Enterprise Core        | Ready          | shell metadata, session, tenant, permission       | acting on behalf indicator   |
| `shell-impersonation-banner`      | `ShellImpersonationBanner`     | `header`  | security   | session  | session_bound | Enterprise Core        | Ready          | shell metadata, session, tenant, permission       | impersonation warning        |
| `shell-support-panel`             | `ShellSupportPanel`            | `panel`   | supporting | tenant   | tenant_strict | Expansion              | Next           | shell metadata, tenant                            | support access surface       |
| `shell-assistant-panel`           | `ShellAssistantPanel`          | `panel`   | supporting | tenant   | tenant_strict | Expansion              | Next           | shell metadata, tenant, permission, command infra | enterprise assistant surface |
| `shell-help-entry-point`          | `ShellHelpEntryPoint`          | `footer`  | supporting | platform | global_safe   | Expansion              | Next           | shell metadata                                    | docs/help/support entry      |
| `shell-session-expiry-banner`     | `ShellSessionExpiryBanner`     | `header`  | security   | session  | session_bound | Operational Governance | Missing        | shell metadata, session                           | session timeout warning      |
| `shell-reauth-required-banner`    | `ShellReauthRequiredBanner`    | `overlay` | security   | session  | session_bound | Operational Governance | Missing        | shell metadata, session, permission               | sensitive action re-auth     |
| `shell-restricted-mode-banner`    | `ShellRestrictedModeBanner`    | `header`  | security   | tenant   | tenant_strict | Operational Governance | Missing        | shell metadata, tenant, permission                | reduced capability mode      |
| `shell-elevated-access-indicator` | `ShellElevatedAccessIndicator` | `header`  | security   | session  | session_bound | Operational Governance | Missing        | shell metadata, session, permission               | privileged mode warning      |
| `shell-break-glass-indicator`     | `ShellBreakGlassIndicator`     | `header`  | security   | session  | session_bound | Expansion              | Missing        | shell metadata, session, permission               | emergency access indicator   |

### F. Enterprise shell state surfaces

| Key                                | Component                       | Zone      | Kind       | Scope     | Isolation        | Priority               | Current status | Required providers / contexts     | Notes                            |
| ---------------------------------- | ------------------------------- | --------- | ---------- | --------- | ---------------- | ---------------------- | -------------- | --------------------------------- | -------------------------------- |
| `shell-tenant-unresolved-state`    | `ShellTenantUnresolvedState`    | `content` | governance | tenant    | tenant_strict    | Enterprise Core        | Missing        | shell metadata, session           | tenant not resolved yet          |
| `shell-workspace-unresolved-state` | `ShellWorkspaceUnresolvedState` | `content` | governance | workspace | workspace_strict | Enterprise Core        | Missing        | shell metadata, tenant, workspace | workspace not resolved           |
| `shell-access-denied-state`        | `ShellAccessDeniedState`        | `content` | security   | tenant    | tenant_strict    | Enterprise Core        | Missing        | shell metadata, permission        | shell-level access denied        |
| `shell-offline-state`              | `ShellOfflineState`             | `content` | governance | platform  | global_safe      | Operational Governance | Missing        | shell metadata, session           | offline/disconnected shell       |
| `shell-degraded-service-state`     | `ShellDegradedServiceState`     | `content` | governance | platform  | global_safe      | Operational Governance | Missing        | shell metadata, session           | partial capability mode          |
| `shell-no-data-state`              | `ShellNoDataState`              | `content` | supporting | tenant    | tenant_strict    | Expansion              | Missing        | shell metadata, tenant            | tenant/workspace has no data yet |

---

## Completeness review

**Already strong:** structure, identity/scope, command foundation, notifications/governance, security/support, DoD, and phased build order.

**Still incomplete for enterprise-grade:** state surfaces (Section F), operational governance surfaces, explicit tenant/workspace truth surfaces, restricted/read-only/session-risk surfaces — these are the gaps between “good enough to start” and “finished for multi-tenant enterprise shell architecture.”

---

## Phased build plan

### Phase 1 — Foundation

- `shell-root`
- `shell-header`
- `shell-sidebar`
- `shell-content`
- `shell-overlay-container`
- `shell-tenant-switcher`
- `shell-workspace-switcher`
- `shell-search-bar`

### Phase 2 — Enterprise Core

- `shell-breadcrumbs`
- `shell-org-profile-menu`
- `shell-user-account-menu`
- `shell-command-palette-trigger`
- `shell-command-palette-dialog`
- `shell-policy-banner`
- `shell-notification-center-trigger`
- `shell-notification-center-panel`
- `shell-delegated-access-banner`
- `shell-impersonation-banner`

### Phase 3 — Operational Governance

- `shell-status-indicator`
- `shell-environment-badge`
- `shell-audit-entry-point`
- `shell-maintenance-banner`
- `shell-incident-banner`
- `shell-session-expiry-banner`
- `shell-restricted-mode-banner`
- `shell-sync-status-indicator`
- `shell-read-only-mode-banner`

### Phase 4 — Expansion

- `shell-panel`
- `shell-footer`
- `shell-global-quick-actions`
- `shell-support-panel`
- `shell-assistant-panel`
- `shell-help-entry-point`
- `shell-global-create-trigger`
- `shell-recents-panel`
- `shell-saved-views-entry-point`

---

## DoD profiles (mandatory)

### DoD-G1: Governance declaration complete

- contract key added to `shell-component-contract.ts`
- contract entry has explicit values for:
  - `shellAware`, `zone`, `kind`
  - all participation modes (`shellMetadata`, `navigationContext`, `commandInfrastructure`, `layoutDensity`, `responsiveShell`)
  - `allowOutsideShellProvider`, `allowFeatureLevelShellRebinding`
- registry key added to `shell-component-registry.ts`
- key and component name mapping follows naming convention
- **Matrix alignment:** when a component exists in the enterprise matrix above, its **scope**, **isolation**, and **priority** are documented (in this table until the contract schema absorbs them); contradictions are resolved before merge.

### DoD-G2: Runtime primitive implemented

- component file exists under `apps/web/src/share/components/shell-ui/`
- exported from `apps/web/src/share/components/shell-ui/index.ts`
- no local shell context creation in component code
- consumes canonical shell provider/hook/selectors where applicable

### DoD-G3: Accessibility and UX safety

- semantic role/labeling is present where interactive
- keyboard interaction and focus behavior are preserved
- no regression in existing top-nav / shell interaction patterns

### DoD-G4: Test coverage

- at least one rendering/behavior test for the new component
- test covers main happy path and one negative/empty path
- test proves core shell behavior contract (for example, metadata required vs optional behavior)

### DoD-G5: Governance and CI green

- `pnpm run script:check-shell-governance-report -- --format=json` passes
- `pnpm run script:ui-drift-governance` passes
- report shows no `missingInRegistry` and no unexpected `staleRegistryEntries`
- CI artifact includes updated `shell-governance-report.vNNNN.json`

### DoD-G6: Enterprise matrix hygiene

- new or changed shell surfaces update the **enterprise matrix** section (or the promoted `working_ref` → guardrails workflow) so the matrix does not drift from intent.
- prefer **specific kinds** (`identity`, `security`, `notification`, `governance`) over generic `supporting` when the matrix assigns a finer role.

---

## Execution guardrail for PRs

A PR that introduces a new shell component should include:

- contract update
- registry update
- `pnpm run script:generate-shell-components-guardrails` (refreshes the Current Status table)
- runtime component implementation
- barrel export update
- tests
- governance report confirmation
- matrix row added or updated when the component is part of the enterprise catalog

If one of these is missing, treat the PR as incomplete for shell architecture standards.
