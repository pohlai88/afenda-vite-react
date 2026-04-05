# Testing — workspace strategy (`@afenda/testing` + `apps/web`)

Testing is a **workspace-level concern**, not a single app file: **unit tests (Vitest)**, future **E2E (e.g. Playwright)**, **Storybook / component and visual workflows**, and **UI / a11y** checks are expected to grow together. Shared glue lives in **[`packages/testing/`](../packages/testing/)** (`@afenda/testing`); each app keeps **runners and config** (e.g. **`apps/web/vite.config.ts`** `test` block) and imports workspace setup from there.

**Today:** the web client runs **[Vitest](https://vitest.dev/)** (Jest-compatible API) and **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)**. **`@testing-library/jest-dom`** matchers are registered in **`@afenda/testing/vitest/setup`**, referenced directly from **`apps/web/vite.config.ts`** **`test.setupFiles`** (no app-local **`vitest.setup.ts`** shim).

```bash
# From repo root
pnpm --filter @afenda/web test        # watch mode
pnpm --filter @afenda/web test:run    # CI
pnpm --filter @afenda/web test:coverage
```

Configuration: **`apps/web/vite.config.ts`** → `test` block (`environment: 'jsdom'`, `setupFiles`, `include` patterns).

---

## Essential patterns

### Basic component test

Prefer **`userEvent`** over raw **`fireEvent`** for realistic interaction. With **`globals: true`** in Vitest you can use **`describe` / `test` / `expect`** without imports; **`vi.fn()`** replaces **`jest.fn()`**.

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  test('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole('button', { name: 'Click me' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**`@testing-library/user-event`** is already listed in **`apps/web/package.json`**.

### Form testing

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { ContactForm } from './ContactForm';

describe('ContactForm', () => {
  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ContactForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'John Doe',
      });
    });
  });

  test('shows validation errors', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  });
});
```

### Async data + API mocking (MSW)

**[MSW](https://mswjs.io/)** is optional—add **`msw`** as a dev dependency. Below uses **MSW v2** style (`http`, `HttpResponse`); adjust if your version differs.

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';

import { UserList } from './UserList';

const server = setupServer(
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
    ]);
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserList', () => {
  test('displays users after loading', async () => {
    render(<UserList />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});
```

### Custom hooks

Use **`renderHook`** from **`@testing-library/react`**. Wrap state updates in **`act`** from **`react`** when needed.

```tsx
import { renderHook, act } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { useCounter } from './useCounter';

describe('useCounter', () => {
  test('initializes with 0', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  test('increments', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

---

## Query priorities

1. **`getByRole`** — preferred (accessible, resilient).
2. **`getByLabelText`** — forms.
3. **`getByText`** — copy.
4. **`getByTestId`** — last resort.

```tsx
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email/i);
// Avoid querying by class name or implementation details.
```

---

## Vitest setup (workspace + app)

- **Workspace:** [`packages/testing/src/vitest/setup.ts`](../packages/testing/src/vitest/setup.ts) — shared matchers (`@testing-library/jest-dom/vitest`) and future global hooks (e.g. MSW) for any Vitest consumer.
- **App:** **`apps/web/vite.config.ts`** → `test.setupFiles: ['@afenda/testing/vitest/setup']` — single source of truth; no duplicate setup file under **`apps/web`**.

Optional extras (only if you need them): mock **`fetch`**, **`matchMedia`**, **`ResizeObserver`**, etc., in **`packages/testing`** (shared) or an app-only setup module listed in **`setupFiles`** after the workspace entry.

---

## Custom `render` (providers)

If most tests need **TanStack Query**, **React Router**, or a **theme**, create **`apps/web/test/test-utils.tsx`** and wrap **`render`**:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function AllProviders({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
export { renderWithProviders as render };
```

Use **`MemoryRouter`** from **`react-router-dom`** when routes matter. Do **not** assume MUI—this repo does not use Material UI by default.

---

## Common issues

### `act` warnings

Use **`userEvent`** (async) and **`waitFor`**; wrap discrete synchronous updates in **`act`** when the library does not do it for you.

### Cleanup and mocks

Vitest + RTL usually handle DOM cleanup. Clear mocks when needed:

```ts
import { afterEach, vi } from 'vitest';

afterEach(() => {
  vi.clearAllMocks();
});
```

### Timers

```ts
import { afterEach, beforeEach, vi } from 'vitest';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});
```

---

## Accessibility (a11y) testing & WCAG-oriented practice

Automated **eslint-plugin-jsx-a11y** is enabled for **`**/src/**/*.{ts,tsx}`** via **`eslint.config.js`** (`jsxA11y.flatConfigs.recommended`). Run the normal lint pipeline:

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
- [Project structure](./PROJECT_STRUCTURE.md) — where tests live (`*.test.tsx` next to sources)
- [Components and styling](./COMPONENTS_AND_STYLING.md)
- [Design system](./DESIGN_SYSTEM.md)
