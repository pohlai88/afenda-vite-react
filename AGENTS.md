# AGENTS.md – AI Interaction & Execution Guide

**Human contributors:** use `CONTRIBUTING.md` and `docs/` when they exist for the area you are changing.

This file is intentionally scoped for AI assistants (Cursor, Copilot Chat, PR automation bots) and **Afenda monorepo** context below.

## Part A – AI interaction & execution (React Vite feature work)

### 1. Authoritative references (never reproduce content here)

Monorepo guides live under repo-root **`docs/`** (human-readable index: [`docs/README.md`](docs/README.md)). App-specific docs may also live under **`apps/web/docs/`** when added.

| Topic                                                          | Source of truth                                                                                                         |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Monorepo + ERP systems view                                    | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)                                                                          |
| Architecture upgrade policy (triggers + ADR cadence)           | [`docs/ARCHITECTURE_EVOLUTION.md`](docs/ARCHITECTURE_EVOLUTION.md)                                                      |
| Authentication (Vite SPA + backend)                            | [`docs/AUTHENTICATION.md`](docs/AUTHENTICATION.md)                                                                      |
| Roles and permissions (RBAC + PBAC)                            | [`docs/ROLES_AND_PERMISSIONS.md`](docs/ROLES_AND_PERMISSIONS.md)                                                        |
| Third-party integrations (OAuth APIs, webhooks)                | [`docs/INTEGRATIONS.md`](docs/INTEGRATIONS.md)                                                                          |
| Database (PostgreSQL + Drizzle, schema, migrations, audit)     | [`packages/_database/README.md`](packages/_database/README.md) · [`packages/_database/docs/`](packages/_database/docs/) |
| HTTP API (REST contract, tenant routes)                        | [`docs/API.md`](docs/API.md)                                                                                            |
| Documentation scope (normative vs optional; OpenAPI)           | [`docs/DOCUMENTATION_SCOPE.md`](docs/DOCUMENTATION_SCOPE.md)                                                            |
| Dependency stack guides (tooling, UI, infra, planned packages) | [`docs/dependencies/README.md`](docs/dependencies/README.md)                                                            |
| Deployment (Vercel + Vite client)                              | [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)                                                                              |
| Domain glossary (ERP + platform terms)                         | [`docs/GLOSSARY.md`](docs/GLOSSARY.md)                                                                                  |
| Project architecture (app layout)                              | [`docs/PROJECT_STRUCTURE.md`](docs/PROJECT_STRUCTURE.md)                                                                |
| Brand & visual identity                                        | [`docs/BRAND_GUIDELINES.md`](docs/BRAND_GUIDELINES.md)                                                                  |
| Design system (tokens, principles, a11y)                       | [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)                                                                        |
| Component & styling patterns                                   | [`docs/COMPONENTS_AND_STYLING.md`](docs/COMPONENTS_AND_STYLING.md)                                                      |
| shadcn/ui (Vite, when adopted)                                 | [`docs/dependencies/shadcn-ui.md`](docs/dependencies/shadcn-ui.md)                                                      |
| Performance guidance                                           | [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md)                                                                            |
| Testing (Vitest + RTL)                                         | [`docs/TESTING.md`](docs/TESTING.md)                                                                                    |
| State management approach                                      | [`docs/STATE_MANAGEMENT.md`](docs/STATE_MANAGEMENT.md)                                                                  |
| Project / build configuration                                  | [`docs/PROJECT_CONFIGURATION.md`](docs/PROJECT_CONFIGURATION.md)                                                        |
| Vite enterprise practices (`apps/web` + CI checklist)          | [`docs/VITE_ENTERPRISE_WORKSPACE.md`](docs/VITE_ENTERPRISE_WORKSPACE.md)                                                |

### 2. Operating principles (AI perspective)

- Documentation-first
- Reuse-before-build
- Type safety always (no unvetted `any`)
- Deterministic, incremental changes
- Explicit assumption logging

### 3. AI execution protocol (React Vite feature work)

When asked to add or modify UI logic in the **`apps/web`** Vite app:

1. Locate or create an appropriate feature folder under **`apps/web/src/features/*`** (justify new top-level features).
2. Read related docs referenced above before proposing code.
3. Prefer extending existing component, hook, and state patterns ([`docs/PROJECT_STRUCTURE.md`](docs/PROJECT_STRUCTURE.md): ERP UI in `apps/web/src/features/*`, shared client code in `apps/web/src/share/*`, marketing in `apps/web/src/pages/*`).
4. Present proposed file tree and diff plan **before** writing code when the change is non-trivial.
5. After code changes: list validation steps (format, lint, typecheck, tests)—e.g. from repo root: `pnpm run format:check`, `pnpm run lint`, `pnpm run typecheck`, `pnpm run test:run`, and `pnpm run build` as appropriate.

### 4. Guardrails (must enforce)

- Do **not** fabricate file paths, component APIs, or library versions.
- Do **not** remove existing accessibility props (`aria-*`, `alt`, `role`) without rationale and a replacement.
- Do **not** introduce global mutable singletons—use documented state patterns.
- **Always** flag large dependency additions (more than one library) for human confirmation.
- **Always** surface potential performance regressions (unmemoized large lists, heavy renders).

### 5. Component creation checklist

- Typed props interface exported
- Meaningful name plus optional colocated `index.ts` re-export (if the codebase already uses that pattern)
- Accessibility reviewed (labels, semantics)
- Story, example, or usage snippet considered
- Test file added or explicitly deferred with reason

### 6. When the AI should ask or refuse

**Ask** if: feature scope is unclear, patterns conflict, or the target directory is missing.

**Refuse** if: asked to bypass validation, remove type safety, or duplicate an existing documented component.

### 7. Post-change assistant report

Return a bullet summary:

- Files touched (concise)
- New dependencies (if any)
- Type/lint status
- Suggested manual QA steps
- Deferred items (tests, docs)

---

**Protocol alignment:** React Vite sections follow common **Vite + React** practice for an ERP-style web client; paths are adjusted for this repo (`apps/web`).

**Humans:** prefer package-level `CONTRIBUTING.md` / `docs/` for the code you are editing; use Part B for monorepo tooling.

**Workspace metadata:** [`scripts/afenda.config.json`](scripts/afenda.config.json) describes product identity, workspace defaults, and important paths; see [`scripts/afenda.config.schema.json`](scripts/afenda.config.schema.json).

**Scripts layout:** [`scripts/RULES.md`](scripts/RULES.md) defines contribution rules and flat vs one-level-nested folder policy before `scripts/` scales.

---

## Part B – Afenda monorepo (apps and packages)

- **Monorepo:** pnpm workspaces + [Turborepo](https://turborepo.com/docs). Root `package.json` scripts must delegate with `pnpm exec turbo run …` (not inline app builds).
- **Turborepo skill (local):** `.agents/skills/turborepo/SKILL.md` and `references/`.
- **Refresh from Vercel:** [Using AI with Turborepo](https://turborepo.com/docs/guides/ai) — run `npx skills add vercel/turborepo --yes` (or without `--yes` to choose agent targets). See `.agents/skills/turborepo/SYNC.md`.
- **CI / cache:** `.github/workflows/ci.yml`; optional `TURBO_TOKEN` / `TURBO_TEAM` per `.env.turbo.example`.
- **Repo artifacts:** `.artifacts/` for repo-level reports and optional cache; see [`docs/REPO_ARTIFACT_POLICY.md`](docs/REPO_ARTIFACT_POLICY.md).
