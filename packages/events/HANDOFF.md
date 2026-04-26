# Events Package Handoff

## What this package is

`packages/events` is Afenda's shared **event contract** package.

It gives the repo one stable place for:

- execution linkage
- versioned event envelopes
- hashing / serialization / validation helpers

It is not a broker package and not an event runtime.

## What you maintain here

Maintain only the small contract surface in [src/index.ts](./src/index.ts):

- `ExecutionLinkage`
- `EventEnvelopeV1`
- `createExecutionHash()`
- `createExecutionLinkage()`
- `createEventEnvelopeV1()`
- `serializeEventEnvelopeV1()`
- `hashEventEnvelopeV1()`
- `isExecutionLinkage()`
- `isEventEnvelopeV1()`

## What you do not add here

Do not add:

- NATS client code
- subject naming
- JetStream configuration
- outbox processing
- retry/dead-letter logic
- workflow orchestration
- domain event payload registries
- app-specific command/event catalogs

If a change needs any of that, it belongs in another package or in `apps/api`.

## Current producer flow

The active producer path is:

```txt
apps/api workflow transition
-> build transition payload from truth record
-> create execution linkage
-> attach linkage back onto truth metadata
-> create versioned event envelope
```

Reference file:

- [truth-event.ts](/C:/NexusCanon/afenda-react-vite/apps/api/src/workflow/adapters/truth-event.ts:1)

## Why the package matters without NATS

Afenda still needs:

- deterministic linkage across workflow truth and event shape
- a versioned envelope boundary
- stable hashing for comparison/audit use

Those concerns exist even when no broker is running.

## If future transport is added

Do not grow this package to absorb transport.

Preferred future split:

```txt
@afenda/events = contract + versioned envelope
future transport package = publish/subscribe runtime
apps/api = chooses when to publish
```

## Validation

Run:

- `pnpm --filter @afenda/events typecheck`
- `pnpm --filter @afenda/events test:run`
- `pnpm --filter @afenda/api typecheck`

## Fast review rule

If a proposed change makes this package look like an event bus, reject it.
If it keeps the package as a thin truth-contract layer, it is probably in-bounds.
