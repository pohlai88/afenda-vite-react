# Semantic Layer

`@afenda/shadcn-ui/semantic` is the governed, business-facing semantic UI surface.
It prevents semantic drift by keeping domain truth mapping, semantic primitives, and
UI composition in one stable module.

## What Lives Here

- `components/`: semantic React components (`SemanticBadge`, `SemanticAlert`, `SemanticField`, `SemanticPanel`, `SemanticSection`)
- `domain/`: adapters from domain truth values to semantic presentation models
- `primitives/`: semantic vocabularies (tone, emphasis, density, size, state, surface)
- `internal/`: presentation resolver utilities used by semantic components
- `index.ts`: public entrypoint barrel for consumers

## Design Rules

- Use semantic APIs, not raw design-token class mapping, in feature code.
- Keep domain-to-UI mapping centralized in `domain/` adapters.
- Keep primitives deterministic (`...Values` tuple + schema + inferred type).
- Keep components thin: compose via `internal/presentation` and adapter outputs.
- Support accessibility contracts explicitly (`role`, `aria-labelledby`, `htmlFor`).

## Public API Pattern

- **Primitives** expose:
  - `<name>Values` (canonical tuple)
  - `<name>Schema` (runtime validation)
  - `<Name>` type (inferred from schema)
- **Domain adapters** expose:
  - `<domain>UiStateValues`
  - `<Domain>UiState`
  - `<Domain>UiModel`
  - `get<Domain>UiModel()`
- **Components** expose:
  - typed props interface
  - `forwardRef` component with stable `displayName`

## Usage

```tsx
import {
  InvariantAlert,
  SettlementBadge,
  SemanticField,
  SemanticPanel,
} from "@afenda/shadcn-ui/semantic"

export function Example() {
  return (
    <SemanticPanel header="Settlement status" toolbar={<SettlementBadge state="open" />}>
      <InvariantAlert severity="high" description="Allocation mismatch detected." />
      <SemanticField id="invoice" label="Invoice ID" hint="Use external reference">
        <input id="invoice" className="border px-2 py-1" />
      </SemanticField>
    </SemanticPanel>
  )
}
```

## Extension Checklist

When adding a new semantic domain adapter:

1. Define `...UiStateValues` as a readonly tuple.
2. Define a readonly `...UiModel` interface.
3. Implement a deterministic map with exhaustive keys (`satisfies Record<...>`).
4. Export a single getter (`get...UiModel()`), no side effects.
5. Re-export from `index.ts`.

When adding a new semantic component:

1. Use semantic/domain inputs only (no local semantic maps).
2. Use `forwardRef` and set `displayName`.
3. Keep class composition in `internal/presentation` where possible.
4. Preserve or improve accessibility semantics.
5. Re-export from `index.ts`.
