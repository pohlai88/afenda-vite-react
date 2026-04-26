---
title: API route surface
description: Generated inventory of the live Hono route tree mounted by apps/api/src/app.ts.
status: generated
owner: web-api-architecture
truthStatus: supporting
docClass: supporting-doc
relatedDomain: api-contract
order: 999
---

# API route surface

This file is generated from `apps/api/src/app.ts` by `scripts/governance/generate-api-route-surface.ts`.
Use it as the route-inventory truth surface. [docs/API.md](../../../API.md) is the narrative companion.

- Generated at: `2026-04-26T03:14:47.936Z`
- Route count: 59
- Methods: `GET`, `POST`

## Surface summary

- `auth-v1`: 5 route(s)
- `commands`: 1 route(s)
- `health`: 1 route(s)
- `mdm`: 6 route(s)
- `me`: 1 route(s)
- `ops`: 3 route(s)
- `other`: 39 route(s)
- `root`: 1 route(s)
- `users`: 2 route(s)

## Mounted routes

| Method | Path                                         | Base path            | Surface    |
| ------ | -------------------------------------------- | -------------------- | ---------- |
| `GET`  | `/`                                          | `/`                  | `root`     |
| `GET`  | `/api/users`                                 | `/api/users`         | `users`    |
| `POST` | `/api/users`                                 | `/api/users`         | `users`    |
| `GET`  | `/api/v1/auth/intelligence`                  | `/api/v1/auth`       | `auth-v1`  |
| `GET`  | `/api/v1/auth/sessions`                      | `/api/v1/auth`       | `auth-v1`  |
| `POST` | `/api/v1/auth/sessions/revoke`               | `/api/v1/auth`       | `auth-v1`  |
| `POST` | `/api/v1/auth/tenant-context/activate`       | `/api/v1/auth`       | `auth-v1`  |
| `GET`  | `/api/v1/auth/tenant-context/candidates`     | `/api/v1/auth`       | `auth-v1`  |
| `POST` | `/api/v1/commands/execute`                   | `/api/v1/commands`   | `commands` |
| `GET`  | `/api/v1/finance/allocations`                | `/api/v1/finance`    | `other`    |
| `POST` | `/api/v1/finance/allocations`                | `/api/v1/finance`    | `other`    |
| `GET`  | `/api/v1/finance/invoices`                   | `/api/v1/finance`    | `other`    |
| `POST` | `/api/v1/finance/invoices`                   | `/api/v1/finance`    | `other`    |
| `GET`  | `/api/v1/finance/invoices/:invoiceId`        | `/api/v1/finance`    | `other`    |
| `POST` | `/api/v1/finance/invoices/:invoiceId/open`   | `/api/v1/finance`    | `other`    |
| `POST` | `/api/v1/finance/invoices/:invoiceId/paid`   | `/api/v1/finance`    | `other`    |
| `POST` | `/api/v1/finance/invoices/:invoiceId/void`   | `/api/v1/finance`    | `other`    |
| `GET`  | `/api/v1/finance/settlements`                | `/api/v1/finance`    | `other`    |
| `POST` | `/api/v1/finance/settlements`                | `/api/v1/finance`    | `other`    |
| `GET`  | `/api/v1/knowledge/activity`                 | `/api/v1/knowledge`  | `other`    |
| `POST` | `/api/v1/knowledge/answer`                   | `/api/v1/knowledge`  | `other`    |
| `GET`  | `/api/v1/knowledge/attachments/index`        | `/api/v1/knowledge`  | `other`    |
| `POST` | `/api/v1/knowledge/attachments/index`        | `/api/v1/knowledge`  | `other`    |
| `POST` | `/api/v1/knowledge/capture`                  | `/api/v1/knowledge`  | `other`    |
| `GET`  | `/api/v1/knowledge/comments`                 | `/api/v1/knowledge`  | `other`    |
| `POST` | `/api/v1/knowledge/comments`                 | `/api/v1/knowledge`  | `other`    |
| `GET`  | `/api/v1/knowledge/documents`                | `/api/v1/knowledge`  | `other`    |
| `POST` | `/api/v1/knowledge/entities/extract`         | `/api/v1/knowledge`  | `other`    |
| `GET`  | `/api/v1/knowledge/metrics/intelligence`     | `/api/v1/knowledge`  | `other`    |
| `GET`  | `/api/v1/knowledge/metrics/search-quality`   | `/api/v1/knowledge`  | `other`    |
| `GET`  | `/api/v1/knowledge/relations`                | `/api/v1/knowledge`  | `other`    |
| `POST` | `/api/v1/knowledge/relations`                | `/api/v1/knowledge`  | `other`    |
| `GET`  | `/api/v1/knowledge/revisions`                | `/api/v1/knowledge`  | `other`    |
| `POST` | `/api/v1/knowledge/revisions`                | `/api/v1/knowledge`  | `other`    |
| `POST` | `/api/v1/knowledge/search`                   | `/api/v1/knowledge`  | `other`    |
| `POST` | `/api/v1/knowledge/search/semantic`          | `/api/v1/knowledge`  | `other`    |
| `GET`  | `/api/v1/knowledge/sharing-rules`            | `/api/v1/knowledge`  | `other`    |
| `POST` | `/api/v1/knowledge/sharing-rules`            | `/api/v1/knowledge`  | `other`    |
| `POST` | `/api/v1/knowledge/workflow/alpha`           | `/api/v1/knowledge`  | `other`    |
| `POST` | `/api/v1/legacy-erp/ingest`                  | `/api/v1/legacy-erp` | `other`    |
| `POST` | `/api/v1/legacy-erp/pull/counterparties`     | `/api/v1/legacy-erp` | `other`    |
| `POST` | `/api/v1/legacy-erp/pull/items`              | `/api/v1/legacy-erp` | `other`    |
| `POST` | `/api/v1/legacy-erp/transform`               | `/api/v1/legacy-erp` | `other`    |
| `GET`  | `/api/v1/mdm/counterparties`                 | `/api/v1/mdm`        | `mdm`      |
| `POST` | `/api/v1/mdm/counterparties`                 | `/api/v1/mdm`        | `mdm`      |
| `GET`  | `/api/v1/mdm/counterparties/:counterpartyId` | `/api/v1/mdm`        | `mdm`      |
| `GET`  | `/api/v1/mdm/items`                          | `/api/v1/mdm`        | `mdm`      |
| `POST` | `/api/v1/mdm/items`                          | `/api/v1/mdm`        | `mdm`      |
| `GET`  | `/api/v1/mdm/items/:itemId`                  | `/api/v1/mdm`        | `mdm`      |
| `GET`  | `/api/v1/me`                                 | `/api/v1/me`         | `me`       |
| `GET`  | `/api/v1/ops/audit`                          | `/api/v1/ops`        | `ops`      |
| `GET`  | `/api/v1/ops/counterparties`                 | `/api/v1/ops`        | `ops`      |
| `GET`  | `/api/v1/ops/events-workspace`               | `/api/v1/ops`        | `ops`      |
| `GET`  | `/health`                                    | `/health`            | `health`   |
| `GET`  | `/health/live`                               | `/health`            | `other`    |
| `GET`  | `/health/ready`                              | `/health`            | `other`    |
| `GET`  | `/health/startup`                            | `/health`            | `other`    |
| `GET`  | `/health/version`                            | `/health`            | `other`    |
| `GET`  | `/metrics`                                   | `/`                  | `other`    |
