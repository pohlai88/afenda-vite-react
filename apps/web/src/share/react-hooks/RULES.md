# React hooks rules

## What lives here

**React hooks** that are **not** Zustand store modules: keyboard shortcuts, `matchMedia`, small reusable UI behavior. They follow the [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) and typically use `useState` / `useEffect` / `useRef` for **local** or **ephemeral** UI concerns.

## Naming: how this differs from `client-store`

| Location                  | `use*` meaning                                                                                                                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`share/react-hooks/`**  | **React-only** hooks: `useGlobalKeydownShortcut`, `useIsMobile`. **No `Store` suffix** — these are not Zustand subscribers.                                                              |
| **`share/client-store/`** | Zustand hooks end with **`Store`**: `useAppShellStore`, `useTruthHealthStore`. Other `use*` exports there are shell **bridge** hooks (no `Store` suffix) that still live next to stores. |

**Both** use the `use` prefix on **exports** because both are real hooks. **Filenames:** this folder uses **`use-*.ts`**; `client-store` uses **`*-store.ts`** or other kebab names **without** a `use-` file prefix. **Differentiation:** `*Store` = Zustand; path **`react-hooks`** = generic reusable behavior without owning a global store module.

## What does not belong here

- New **Zustand** `create()` modules → `share/client-store/`.
- **Feature** hooks that only make sense in one feature → colocate under `features/…`.
