# Testing — workspace strategy (`@afenda/testing` + `apps/web`)

Testing is a **workspace-level concern**, not a single app file: **unit tests (Vitest)**, future **E2E (e.g. Playwright)**, **Storybook / component and visual workflows**, and **UI / a11y** checks are expected to grow together. Shared glue lives in **[`packages/testing/`](../packages/testing/)** (`@afenda/testing`); each app keeps **runners and config** (e.g. **`apps/web/vite.config.ts`** `test` block) and imports workspace setup from there.

**Today:** the web client runs **[Vitest](https://vitest.dev/)** (Jest-compatible API) and **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)**. **`@testing-library/jest-dom`** matchers are registered in **`@afenda/testing/vitest/setup`**, and shared `test` block defaults (include patterns, coverage thresholds, pool, mocks) are provided by **`@afenda/testing/vitest/defaults`** — both referenced from **`apps/web/vite.config.ts`** (no app-local shim needed).

```bash
# From repo root — web app (jsdom)
pnpm --filter @afenda/web test        # watch mode
pnpm --filter @afenda/web test:run    # CI
pnpm --filter @afenda/web test:coverage

# Workspace testing package (node; shared defaults + package tests)
pnpm --filter @afenda/testing test
pnpm --filter @afenda/testing test:run
pnpm --filter @afenda/testing test:coverage

# All workspace packages that define test:run (via Turborepo)
pnpm run test:run
```

Configuration: **`apps/web/vite.config.ts`** uses `test: getAfendaVitestTestOptions()` (defaults: `environment: 'jsdom'`, shared `setupFiles`, `include`, coverage, mocks, pool). **`packages/testing/vitest.config.ts`** uses the same factory with `environment: 'node'` and `setupFiles: []`, then sets `name: '@afenda/testing'` for Vitest project labeling. Exported types: **`AfendaVitestOptions`**, **`VitestEnvironment`** (see `defaults.ts`).

### i18n validation & Vitest

- **Locale parity & release gates:** `pnpm run script:validate-i18n` (included in root `pnpm run check`) verifies `en` vs `ms` / `id` / `vi` key parity, forbids empty strings, checks glossary English matches canonical resources, fails on unresolved audit **`review`** rows affecting release namespaces (`shell`, `auth`, `dashboard`), and enforces the non-`en` “differs from English” ratio (with documented allowlists / prefix exclusions in [`apps/web/src/share/i18n/policy.ts`](../apps/web/src/share/i18n/policy.ts)).
- **Cross-reference audit:** `pnpm run script:i18n-crossref-audit` refreshes [`apps/web/src/share/i18n/audit/conflicts.json`](../apps/web/src/share/i18n/audit/conflicts.json) from [`glossary/canonical-terms.json`](../apps/web/src/share/i18n/glossary/canonical-terms.json) plus sample Frappe/Odoo inputs under [`scripts/data/`](../scripts/data/).
- **Unit tests:** [`apps/web/src/share/i18n/__test__/config.test.ts`](../apps/web/src/share/i18n/__test__/config.test.ts) and [`format.test.ts`](../apps/web/src/share/i18n/__test__/format.test.ts) — call **`initI18n()`** in `beforeAll` when exercising formatters or language persistence.

---

## Essential patterns

### Test file location (`__test__/` convention)

Tests **must** live under `__test__/` directories — never colocated next to source files. This keeps the source tree clean while keeping tests close to the code they cover:

```
src/features/auth/
  components/
    LoginView.tsx
  __test__/
    login-view.test.tsx        # imports from ../components/LoginView
src/share/query/
  get-http-status-from-unknown.ts
  __test__/
    get-http-status-from-unknown.test.ts
```

Include pattern (set by `getAfendaVitestTestOptions()`): `src/**/__test__/**/*.{test,spec}.{ts,tsx}`

### Basic component test

Prefer **`userEvent`** over raw **`fireEvent`** for realistic interaction. With **`globals: true`** in Vitest you can use **`describe` / `test` / `expect`** without imports; **`vi.fn()`** replaces **`jest.fn()`**.

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

import { Button } from '../components/Button'

describe('Button', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  test('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByRole('button', { name: 'Click me' }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

**`@testing-library/user-event`** is already listed in **`apps/web/package.json`**.

### Form testing

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

import { ContactForm } from '../ContactForm'

describe('ContactForm', () => {
  test('submits form with valid data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<ContactForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'John Doe',
      })
    })
  })

  test('shows validation errors', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/name is required/i)).toBeInTheDocument()
  })
})
```

### Async data + API mocking (MSW)

**[MSW](https://mswjs.io/)** is optional—add **`msw`** as a dev dependency. Below uses **MSW v2** style (`http`, `HttpResponse`); adjust if your version differs.

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'

import { UserList } from '../UserList'

const server = setupServer(
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
    ])
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('UserList', () => {
  test('displays users after loading', async () => {
    render(<UserList />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })
})
```

### Custom hooks

Use **`renderHook`** from **`@testing-library/react`**. Wrap state updates in **`act`** from **`react`** when needed.

```tsx
import { renderHook, act } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { useCounter } from '../useCounter'

describe('useCounter', () => {
  test('initializes with 0', () => {
    const { result } = renderHook(() => useCounter())
    expect(result.current.count).toBe(0)
  })

  test('increments', () => {
    const { result } = renderHook(() => useCounter())

    act(() => {
      result.current.increment()
    })

    expect(result.current.count).toBe(1)
  })
})
```

---

## Query priorities

1. **`getByRole`** — preferred (accessible, resilient).
2. **`getByLabelText`** — forms.
3. **`getByText`** — copy.
4. **`getByTestId`** — last resort.

```tsx
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/email/i)
// Avoid querying by class name or implementation details.
```

---

## Vitest setup (workspace + app)

- **Shared defaults:** [`packages/testing/src/vitest/defaults.ts`](../packages/testing/src/vitest/defaults.ts) — `getAfendaVitestTestOptions(options?)` returns a typed `InlineConfig` fragment (include patterns, coverage, thresholds, mocks, pool). Use the same entry point everywhere; pass **`environment`** (`'jsdom' | 'node' | 'happy-dom' | 'edge-runtime'`) and **`setupFiles`** as needed.
- **Shared setup:** [`packages/testing/src/vitest/setup.ts`](../packages/testing/src/vitest/setup.ts) — matchers (`@testing-library/jest-dom/vitest`) and future global hooks (e.g. MSW). Listed in `setupFiles` by default for browser-style apps; omit or replace for pure Node packages.
- **Web app:** **`apps/web/vite.config.ts`** → `test: getAfendaVitestTestOptions()` (jsdom + `@afenda/testing/vitest/setup`).
- **Testing package:** **`packages/testing/vitest.config.ts`** mirrors apps by spreading the same factory, then adds a project name:

```ts
/// <reference types="vitest/config" />
import { getAfendaVitestTestOptions } from './src/vitest/defaults'
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    ...getAfendaVitestTestOptions({ environment: 'node', setupFiles: [] }),
    name: '@afenda/testing',
  },
})
```

- **Convenience:** `getAfendaVitestNodeTestOptions({ setupFiles? })` is a thin wrapper around `getAfendaVitestTestOptions({ environment: 'node', setupFiles: setupFiles ?? [] })` when you prefer a dedicated name.

### Runtime env overrides

The defaults factory reads `process.env` so CI and local runs can diverge without editing config:

| Variable                     | Effect                                                                                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `VITEST_POOL`                | Pool: `forks`, `threads`, or `vmThreads` (invalid values ignored)                                                                         |
| `VITEST_COVERAGE_STRICT`     | Set to `1` to use the **strict** coverage preset                                                                                          |
| `VITEST_COVERAGE_LINES`      | Override lines threshold (number; non-numeric values ignored)                                                                             |
| `VITEST_COVERAGE_STATEMENTS` | Override statements threshold                                                                                                             |
| `VITEST_COVERAGE_FUNCTIONS`  | Override functions threshold                                                                                                              |
| `VITEST_COVERAGE_BRANCHES`   | Override branches threshold                                                                                                               |
| `VITEST_*` (native)          | Vitest also honors `VITEST_MIN_THREADS`, `VITEST_MAX_THREADS`, `VITEST_POOL_TIMEOUT`, etc. ([config](https://vitest.dev/config/#options)) |

Vitest loads **`VITE_`**-prefixed vars from `.env` in test mode; use Vite’s **`loadEnv`** in config if you need every variable from `.env` files ([guide](https://vitest.dev/guide/features#environment-variables)).

### Coverage thresholds

Presets live in **`COVERAGE_PRESETS`** in `defaults.ts` — **default** (low floor for an early-stage tree) vs **strict** when `VITEST_COVERAGE_STRICT=1`. Per-metric env vars above override the active preset for that metric only.

| Metric     | Default preset | Strict preset |
| ---------- | -------------- | ------------- |
| Lines      | 5%             | 80%           |
| Statements | 5%             | 80%           |
| Functions  | 5%             | 70%           |
| Branches   | 3%             | 50%           |

Ratchet the **`default`** preset in `defaults.ts` as coverage grows; use env overrides for experiments without committing threshold changes.

### ESLint and test files

**`eslint.config.js`** treats `**/__test__/**/*.{js,ts,tsx}` (and `*.{test,spec}.{ts,tsx}`) as test files: Vitest globals and relaxed `no-unsafe-*` rules for assertion APIs. Production **`src/**`\*\* code keeps full type-checked rules.

Optional extras (only if you need them): mock **`fetch`**, **`matchMedia`**, **`ResizeObserver`**, etc., in **`packages/testing`** (shared) or an app-only setup module listed in **`setupFiles`** after the workspace entry.

---

## Custom `render` (providers)

If most tests need **TanStack Query**, **React Router**, or a **theme**, create **`apps/web/test/test-utils.tsx`** and wrap **`render`**:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

function AllProviders({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

export * from '@testing-library/react'
export { renderWithProviders as render }
```

Use **`MemoryRouter`** from **`react-router-dom`** when routes matter. Do **not** assume MUI—this repo does not use Material UI by default.

---

## Common issues

### `act` warnings

Use **`userEvent`** (async) and **`waitFor`**; wrap discrete synchronous updates in **`act`** when the library does not do it for you.

### Cleanup and mocks

Vitest + RTL usually handle DOM cleanup. Clear mocks when needed:

```ts
import { afterEach, vi } from 'vitest'

afterEach(() => {
  vi.clearAllMocks()
})
```

### Timers

```ts
import { afterEach, beforeEach, vi } from 'vitest'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})
```

---

## Accessibility (a11y) testing & WCAG-oriented practice

Automated **eslint-plugin-jsx-a11y** is enabled for **`**/src/**/\*.{ts,tsx}`** via **`eslint.config.js`** (`jsxA11y.flatConfigs.recommended`). Run the normal lint pipeline:

```bash
pnpm lint
# or app only:
pnpm --filter @afenda/web lint
```

There is **no separate `lint:a11y` script** today—a11y rules run with **`eslint`**.

**Design principles:** [Design system](./DESIGN_SYSTEM.md). Prefer RTL queries that mirror how assistive tech exposes the UI (**`getByRole`**, **`getByLabelText`**).

### Manual / tooling

- **Contrast:** use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) or browser DevTools. If you add **tenant-configurable brand colors**, validate **WCAG AA** (normal text **4.5:1**, large text **3:1**, UI components **3:1**) in product code or admin UI—there is **no** shared `validateColorContrast` helper in this repo until you add one.
- **Lighthouse** (Chrome) → Accessibility category for smoke audits.
- **Axe DevTools** (browser extension) for deeper issue lists.

### Keyboard checklist (interactive components)

- Tab / Shift+Tab through focusable elements in logical order.
- **Enter** / **Space** on buttons and controls that behave as buttons.
- **Escape** closes dialogs, menus, and popovers where expected.
- Focus visible: align with [Design system](./DESIGN_SYSTEM.md) (focus rings, tokens).

### Screen readers

Prefer **semantic HTML** (`button`, `a`, `label` + `htmlFor`, headings in order). For **icon-only** controls, set **`aria-label`**. For dynamic status text, consider **`aria-live`** (polite/assertive).

### Motion

Respect **`prefers-reduced-motion`** for large animations ([Design system](./DESIGN_SYSTEM.md), global CSS).

### RTL + a11y

Using **`getByRole`** and **`getByLabelText`** in tests nudges components toward accessible names and roles—see patterns above.

---

## Resources

- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library queries](https://testing-library.com/docs/queries/about)
- [MSW](https://mswjs.io/docs/)
- [WCAG 2.1 quick reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA APG](https://www.w3.org/WAI/ARIA/apg/)
- [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)

---

## Related docs

- [`packages/testing/README.md`](../packages/testing/README.md) — workspace testing package (`@afenda/testing`)
- [State management](./STATE_MANAGEMENT.md) — forms, Query client
- [Performance](./PERFORMANCE.md) — list rendering and test doubles
- [Project configuration](./PROJECT_CONFIGURATION.md) — scripts and tooling
- [Project structure](./PROJECT_STRUCTURE.md) — where tests live (`__test__/` directories inside each source folder)
- [Components and styling](./COMPONENTS_AND_STYLING.md)
- [Design system](./DESIGN_SYSTEM.md)
