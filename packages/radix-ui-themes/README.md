# @afenda/radix-ui-themes

Canonical Afenda design-system package for Radix behavior, provider defaults,
typed token mappings, and reusable primitive styling.

This package is the replacement consistency layer for Radix-backed UI in the
workspace. It should be the place where shared Radix semantics are authored,
reviewed, and reused.

## What this package owns

- **Provider defaults** via `AfendaTheme`
- **Typed token surfaces** under `src/styles/tokens`
- **Semantic color and prop mappings** under `src/props`
- **Reusable primitive class recipes** under `src/lib/theme/defaultTheme.ts`
- **Shared primitives** under `src/components/ui`

## What this package does not own

- Tailwind v4 bootstrapping and plugin wiring
- App-shell selectors and route-level layout classes
- Feature-specific CSS or one-off page recipes

Those remain in the app host stylesheet, currently `apps/web/src/index.css`.

## Public contract

The package exposes a single design contract composed of three aligned layers:

1. `AfendaTheme` and `resolveAfendaThemeProps()` for provider defaults
2. `AFENDA_THEME_CONTRACT` plus token exports for typed design semantics
3. `defaultTheme`-driven primitives for reusable runtime styling

Use the package exports rather than re-declaring these values in apps or
features.

## Usage

```tsx
import { AfendaTheme } from '@afenda/radix-ui-themes'
import '@radix-ui/themes/styles.css'

function App() {
  return (
    <AfendaTheme>
      <YourApp />
    </AfendaTheme>
  )
}
```

### Resolving defaults explicitly

```tsx
import { resolveAfendaThemeProps } from '@afenda/radix-ui-themes/components'

const themeProps = resolveAfendaThemeProps({
  accentColor: 'jade',
  radius: 'large',
})
```

### Consuming the shared contract

```ts
import { AFENDA_THEME_CONTRACT } from '@afenda/radix-ui-themes/styles'

AFENDA_THEME_CONTRACT.provider.accentColor
AFENDA_THEME_CONTRACT.tokenFamilies.colors.domain.finance.radixScale
```

## Styling boundary

Consumers must still import the Radix Themes stylesheet:

```ts
import '@radix-ui/themes/styles.css'
```

Apps remain responsible for:

- importing `tailwindcss`
- declaring app-level semantic aliases
- owning shell and feature layout selectors

This package remains responsible for:

- Afenda Radix defaults
- token mappings and scales
- shared primitive recipes

## Design-system alignment

Default values are sourced from [`docs/DESIGN_SYSTEM.md`](../../docs/DESIGN_SYSTEM.md),
[`docs/COMPONENTS_AND_STYLING.md`](../../docs/COMPONENTS_AND_STYLING.md), and
[`docs/BRAND_GUIDELINES.md`](../../docs/BRAND_GUIDELINES.md).

| Config            | Default         | Rationale                                |
| ----------------- | --------------- | ---------------------------------------- |
| `accentColor`     | `"indigo"`      | Aligns with Afenda Projects domain color |
| `grayColor`       | `"slate"`       | Warm neutral family for ERP readability  |
| `radius`          | `"medium"`      | Balanced for dense product UI            |
| `scaling`         | `"100%"`        | Standard product scale                   |
| `appearance`      | `"inherit"`     | Respects host light/dark preference      |
| `panelBackground` | `"translucent"` | Matches current shell treatment          |

## Migration direction

- New shared Radix work should be added here, not to deprecated UI packages.
- Feature code should prefer primitives from `@afenda/radix-ui-themes/components/ui/*`.
- App styles should consume package semantics instead of recreating shared
  recipes locally.
- Inconsistent one-off patterns should be migrated toward the package contract
  over time.

## Package structure

```text
src/
├── components/
│   ├── index.ts
│   ├── _internal/
│   ├── theme.tsx
│   ├── theme.props.ts
│   └── ui/
├── helpers/
├── lib/
│   ├── theme/
│   └── utils/
├── props/
└── styles/
    ├── afenda-theme-config.ts
    ├── contract.ts
    └── tokens/
```
