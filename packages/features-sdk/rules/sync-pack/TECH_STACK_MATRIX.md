---
title: Tech Stack Matrix
description: Default Afenda internal app stack and category-specific overrides for generated feature packs.
status: active
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
surfaceType: rules
relatedDomain: feature-sync-pack
order: 40
---

# Tech Stack Matrix

## Default Afenda Internal App Stack

Frontend:

- React + Vite + TypeScript
- shadcn/ui + Radix UI
- Tailwind CSS
- TanStack Query
- React Router

Backend:

- Node.js + TypeScript
- Hono as the default API framework
- Drizzle ORM
- Postgres
- Zod validation

Auth / Security:

- Tenant-aware auth
- RBAC / permission contracts
- RLS where needed
- Audit log by default

AI / ML:

- OpenAI-compatible provider layer
- RAG-ready document interface
- Vector DB optional, not default

Data / Analytics:

- Postgres first
- DuckDB / ClickHouse only when scale requires
- CSV/XLSX import-export utilities
- BI/reporting surface later

Infra:

- Docker-ready package boundaries
- pnpm workspace
- Turborepo
- GitHub Actions
- OpenTelemetry-ready logging

Version contract:

- Prefer `catalog:` for dependencies present in `pnpm-workspace.yaml`.
- Zod must resolve to major version 4.
- Tailwind CSS and Tailwind Vite integration must resolve to major version 4.
- Vite must follow the workspace catalog pin unless a package has an approved exception.
- New scaffold output must include enough dependency metadata for `sync-pack:doctor` to detect drift before CI.

## Category Overrides

- Communication AI/ML: provider abstraction, prompt/version tracking, document ingestion contract, eval notes.
- Business SaaS: tenant-aware workflow, approvals, audit records, role/permission matrix.
- Content & Publishing: workflow states, revisions, asset references, preview/publish contract.
- Data & Analytics: ingestion model, metric definitions, export formats, lineage notes.
- Infrastructure & Operations: health checks, event logs, operational runbook, incident states.
- Productivity & Utilities: user preferences, import/export, task/state persistence.
- Security & Privacy: threat model, access review, audit retention, data classification.
- Mini-developer: sandbox boundaries, generated artifact policy, approval gate, rollback plan.
