# `@afenda/events`

Shared event-truth primitives for Afenda.

This package exists to keep one small, governed surface for workflow event
materialization:

- `ExecutionLinkage`
- `EventEnvelopeV1`
- deterministic hashing helpers
- deterministic serialization helpers
- lightweight runtime guards

It does **not** own event transport.

## Boundary

`@afenda/events` is the contract layer between:

- workflow truth generation in `apps/api`
- persisted truth/audit linkage
- any future transport or outbox adapter

Current shape:

```txt
truth record transition
-> execution linkage
-> versioned event envelope
-> optional future publish/outbox step
```

What belongs here:

- envelope and linkage types
- versioning
- canonical hashing
- canonical serialization
- shape guards

What does not belong here:

- NATS
- broker clients
- JetStream subjects/streams
- outbox runners
- consumer workers
- domain payload catalogs
- workflow engines

## Why this package exists

Afenda needs event correctness before it needs event transport.

For the current ERP posture, the important invariant is:

```txt
the same committed workflow transition
-> produces the same linkage truth
-> can be wrapped in a stable versioned envelope
```

That is useful even when events are not published anywhere.

## Relationship to `apps/api`

`apps/api/src/workflow/**` is the current producer.

- workflow code builds a transition payload from committed truth
- `createExecutionLinkage()` derives linkage from that transition
- `createEventEnvelopeV1()` wraps the domain payload
- the linkage is written back into truth metadata for auditability

See:

- [truth-event.ts](/C:/NexusCanon/afenda-react-vite/apps/api/src/workflow/adapters/truth-event.ts:1)
- [workflow-execution.contracts.ts](/C:/NexusCanon/afenda-react-vite/apps/api/src/workflow/core/workflow-execution.contracts.ts:1)
- [truth-record.model.ts](/C:/NexusCanon/afenda-react-vite/apps/api/src/truth/truth-record.model.ts:1)

## Transport posture

NATS is intentionally **not** part of this package.

That is a deliberate architecture decision, not a missing feature.

If Afenda later needs async fan-out, the correct shape is:

```txt
@afenda/events = contract
future @afenda/event-bus or @afenda/nats = transport adapter
apps/api = decides when to publish
```

This separation keeps:

- event truth stable
- broker choice replaceable
- transport failure modes out of the contract package

## Versioning rule

Envelope shape changes must be explicit.

- additive helper functions are acceptable
- silent envelope drift is not
- a breaking envelope change requires a new versioned type, for example `EventEnvelopeV2`

## Maintenance checklist

When changing this package:

1. Confirm the change is still contract-level, not runtime transport.
2. Keep payload ownership outside this package.
3. Preserve deterministic hashing and canonical serialization.
4. Update tests for any envelope/linkage shape change.
5. Re-run:
   - `pnpm --filter @afenda/events typecheck`
   - `pnpm --filter @afenda/events test:run`
   - `pnpm --filter @afenda/api typecheck`

## Architecture anchors

- [ADR-0014](/C:/NexusCanon/afenda-react-vite/docs/architecture/adr/ADR-0014-governed-shared-events-package-boundary.md:1)
- [ATC-0012](/C:/NexusCanon/afenda-react-vite/docs/architecture/atc/ATC-0012-governed-shared-events-package-boundary.md:1)
