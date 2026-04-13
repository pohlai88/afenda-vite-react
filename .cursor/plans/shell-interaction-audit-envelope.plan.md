# Shell interaction audit envelope (refined)

## Key guidance (locked)

- **Shell stays dumb**: UI context, command lifecycle, route, mechanism only. No business inference, no persistence logic, **no `@afenda/database` imports in `apps/web`**.
- **Stable discriminants**: Phase A uses **`kind: "shell.command"`** and **`interactionPhase`** only. **Phase B** (navigation / page entry) is deferred until Phase A stabilizes.
- **7W1H contract**: **Required fields: `kind`, `mechanism` only.** All other 7W1H dimensions optional for flexibility.
- **Transport**: Adapter is **fire-and-forget**; forward correlation headers; **try/catch**, dev warning log only; **never block UX** on audit failure.
- **Outcome propagation**: Executor **`ShellCommandAuditAdapter`** must receive **`outcome`** and **`error`** so `interactionPhase` matches `ShellCommandOutcome` / lifecycle accurately.

## Phasing

| Phase | Scope                                                                                                 |
| ----- | ----------------------------------------------------------------------------------------------------- |
| **A** | Contract, mapper, adapter, executor extension, API route, catalog, tests. **Command lifecycle only.** |
| **B** | Navigation / page entry (router hooks). Add later.                                                    |

## Implementation flow

1. **Contract** — [`shell-interaction-audit-contract.ts`](apps/web/src/app/_platform/shell/contract/shell-interaction-audit-contract.ts)
2. **Mapper** — pure `envelope → DTO` for POST body (no DB types)
3. **Adapter** — `emitShellInteractionAudit(envelope)` → `fetch` POST; reuse api-client base URL / header policy
4. **Executor** — extend audit adapter signatures; wire [`use-shell-command-executor`](apps/web/src/app/_platform/shell/hooks/use-shell-command-executor.ts) behind **`VITE_SHELL_INTERACTION_AUDIT`**
5. **API + catalog** — `shell.interaction.recorded` in [`audit-action-catalog.ts`](packages/_database/src/audit/contracts/audit-action-catalog.ts); `POST /v1/audit/shell-interaction` with Zod; map `interactionPhase` → `audit_outcome`; **`actorType: "person"`** when `actorUserId` present (UI rule in [`validateAuditLog`](packages/_database/src/audit/services/validate-audit-log.ts))
6. **Tests** — mapper unit, API route with mock DB, executor tests updated

## Watchouts

- No shell import of `@afenda/database`.
- Catalog description: **UI interaction evidence only** (not business truth).
- Audit failures must not break command execution.

---

## Concrete TypeScript starting point

### `ShellInteractionKind` (Phase A)

```ts
export type ShellInteractionKind = "shell.command"
// Phase B: | "shell.navigation" | ...
```

### `ShellInteractionMechanism`

```ts
export type ShellInteractionMechanism =
  | "click"
  | "keyboard"
  | "programmatic"
  | "navigation"
```

### `interactionPhase` alignment

Align with command lifecycle + outcomes:

- `started` — after successful `start` / before handler completes (optional emission)
- `succeeded` — `ok: true` outcome
- `failed` — `ok: false` with error
- `cancelled` — reserved if cancellation is introduced later

Map to API `audit_outcome` (`success` | `failed` | `rejected` | `partial`): e.g. `succeeded` → `success`, `failed` with validation/unauthorized → `rejected` vs `failed` per server policy (document in API mapper).

### `ShellInteractionAuditEnvelope` (sketch)

```ts
export interface ShellInteractionAuditEnvelope {
  kind: ShellInteractionKind
  mechanism: ShellInteractionMechanism
  interactionPhase: "started" | "succeeded" | "failed" | "cancelled"

  // Who (optional)
  actorUserId?: string
  actingAsUserId?: string

  // What (optional)
  actionType?: string
  commandId?: string
  shellSurface?: "header" | "breadcrumb" | "sidebar" | "content" | string

  // When (optional; server can default)
  occurredAt?: string

  // Where (optional)
  routeId?: string
  pathname?: string
  shellRegion?: string

  // Why (optional)
  reasonCategory?: string
  metadataReasonKey?: string

  // Which (optional; opaque — shell does not infer business)
  tenantId?: string
  targetModule?: string
  targetFeature?: string
  targetEntityRef?: string

  // Whom (optional)
  affectedSubjectRef?: string

  // 1H / summary (optional; terminal phases should set when known)
  commandOutcomeCategory?: string // from ShellCommandOutcome.category when terminal
  errorMessage?: string // non-PII diagnostic snippet if failed
}
```

### Mapper output DTO (sketch)

Pure function, e.g. `mapShellInteractionAuditPayload(envelope): ShellInteractionAuditRequestBody`

```ts
/** JSON body for POST /v1/audit/shell-interaction — no DB imports */
export interface ShellInteractionAuditRequestBody {
  action: "shell.interaction.recorded" // mirrors catalog key for client; server may ignore and force
  interactionPhase: ShellInteractionAuditEnvelope["interactionPhase"]
  actor?: {
    userId?: string
    actingAsUserId?: string
  }
  subject?: {
    type: "shell_interaction"
    id: string // stable opaque id: e.g. uuid from client or `${commandId}:${requestId}`
  }
  metadata: {
    sevenW1H: Record<string, unknown> // or structured nested object mirroring optional envelope fields
  }
}
```

Server merges into `insertGovernedAuditLog` with `metadata.extra` or nested `sevenW1H` under validated `auditMetadataSchema` (`extra` allows arbitrary keys).

### Adapter signature

```ts
export async function emitShellInteractionAudit(
  envelope: ShellInteractionAuditEnvelope,
  options?: { signal?: AbortSignal }
): Promise<void>
```

Implementation: build DTO via mapper → `fetch` with api base + headers → catch log.

---

## Executor extension (signature sketch)

```ts
export interface ShellCommandAuditAdapter {
  onCommandStarted?(context: ShellCommandExecutionContext): void | Promise<void>
  onCommandSucceeded?(
    context: ShellCommandExecutionContext,
    outcome: ShellCommandOutcome
  ): void | Promise<void>
  onCommandFailed?(
    context: ShellCommandExecutionContext,
    outcome: ShellCommandOutcome,
    error: Error
  ): void | Promise<void>
}
```

Early failure (command not found): call `onCommandFailed` with classified outcome + error.

---

## Todos

- [ ] Add `shell-interaction-audit-contract.ts` (required: `kind`, `mechanism`; optional 7W1H)
- [ ] Add `map-shell-interaction-audit-payload.ts` (pure DTO)
- [ ] Add `shell-interaction-audit-adapter.ts` (fire-and-forget fetch)
- [ ] Extend `ShellCommandAuditAdapter` + executor + `use-shell-command-executor` + env flag
- [ ] Catalog `shell.interaction.recorded` + `POST /v1/audit/shell-interaction` + Zod + outcome mapping
- [ ] Tests: mapper, API, executor

---

_Drafting the contract + mapper signatures above satisfies the “concrete starting point” without implementing code until execution is requested._
