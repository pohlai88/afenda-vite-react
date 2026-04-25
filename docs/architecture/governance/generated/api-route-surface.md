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

- Generated at: `2026-04-25T17:18:18.414Z`
- Route count: 14
- Methods: `GET`, `POST`

## Surface summary

- `auth-v1`: 5 route(s)
- `commands`: 1 route(s)
- `health`: 1 route(s)
- `me`: 1 route(s)
- `ops`: 3 route(s)
- `root`: 1 route(s)
- `users`: 2 route(s)

## Mounted routes

| Method | Path                                     | Base path          | Surface    |
| ------ | ---------------------------------------- | ------------------ | ---------- |
| `GET`  | `/`                                      | `/`                | `root`     |
| `GET`  | `/api/users`                             | `/api/users`       | `users`    |
| `POST` | `/api/users`                             | `/api/users`       | `users`    |
| `GET`  | `/api/v1/auth/intelligence`              | `/api/v1/auth`     | `auth-v1`  |
| `GET`  | `/api/v1/auth/sessions`                  | `/api/v1/auth`     | `auth-v1`  |
| `POST` | `/api/v1/auth/sessions/revoke`           | `/api/v1/auth`     | `auth-v1`  |
| `POST` | `/api/v1/auth/tenant-context/activate`   | `/api/v1/auth`     | `auth-v1`  |
| `GET`  | `/api/v1/auth/tenant-context/candidates` | `/api/v1/auth`     | `auth-v1`  |
| `POST` | `/api/v1/commands/execute`               | `/api/v1/commands` | `commands` |
| `GET`  | `/api/v1/me`                             | `/api/v1/me`       | `me`       |
| `GET`  | `/api/v1/ops/audit`                      | `/api/v1/ops`      | `ops`      |
| `GET`  | `/api/v1/ops/counterparties`             | `/api/v1/ops`      | `ops`      |
| `GET`  | `/api/v1/ops/events-workspace`           | `/api/v1/ops`      | `ops`      |
| `GET`  | `/health`                                | `/health`          | `health`   |
