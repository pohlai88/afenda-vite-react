# Shell UI Rules

This folder is for standalone shell-facing UI pieces only.

**Layout:** `components/` holds implementation files; `index.ts` is the only supported import surface.

## Purpose

Components in this folder are small UI building blocks that can be embedded into
larger shell compositions such as top navigation, headers, sidebars, or page
chrome.

## Boundary Rule

- `shell-ui` contains standalone pieces only.
- If a component combines more than two primitives or starts orchestrating
  multiple concerns, it no longer belongs in `shell-ui`.
- Composite shell structures must live in a different slice.

### Registry-governed zone primitives (exception)

Components **registered** in `packages/shadcn-ui` `shell-component-registry` (see
`SHELL_COMPONENTS_GUARDRAILS.md`) may live here even when they are **layout shells**
or thin wrappers around lower-level UI — for example `ShellRoot`, `ShellHeader`,
`ShellSidebar`, `ShellContent`, `ShellOverlayContainer`, or facades that delegate
to `GlobalSearchBar` / `ScopeSwitcher` under governed `Shell*` names.

Those primitives must stay **thin**: layout markers, `data-shell-*` attributes,
semantic wrappers, and delegation — not full app navigation, route orchestration,
or feature policy.

## What Belongs Here

- Shell title
- Shell action slot
- Sidebar toggle button
- Small shell labels, dividers, badges, or status indicators

**Shell action triggers** (buttons that combine icon + label + badge, keyboard hints,
dropdown affordances, etc.) are **composed blocks**, not standalone primitives.
They live under **`block-ui/trigger/`** and are consumed by **`navigation/`** panels
and the top nav.

## What Does Not Belong Here

- Top navigation (`top-nav-bar`, primary nav orchestration)
- App-specific header implementations (composed chrome — not the governed `ShellHeader` wrapper)
- Full sidebar implementations (`SideNavBar` — not the governed `ShellSidebar` wrapper)
- Mobile navigation
- Footer
- Breadcrumb containers derived from routing and metadata
- **Unregistered** layout wrappers or ad hoc shell composition roots
- Command palette dialog (belongs in `navigation`)
- Full notification or **truth alert** panels (those live in `navigation/`)
- **Trigger blocks** (belongs in `block-ui/trigger/`)
- **Theme / scope switch blocks** (belongs in `block-ui/switch-toggle/`)

## Anti-Dump Rules

- Do not place route-aware composite components here.
- Do not place provider implementations here.
- Do not place app-level layout wrappers here.
- Do not colocate auth, tenant, or navigation policy here.
- Do not let this folder become the default home for anything "shell-like".

## Composition Rule

Standalone `shell-ui` pieces may be consumed by larger components, but those
larger components must live outside this folder.

Examples:

- `shell-title.tsx` belongs here.
- `shell-action-slot.tsx` belongs here.
- `scope-switcher.tsx` / `theme-toggle.tsx` belong in **`block-ui/switch-toggle/`** (composed blocks).
- `trigger/command-palette-trigger.tsx` belongs in **`block-ui/trigger/`**, not here.
- `app-header.tsx` does not belong here.
- `top-nav.tsx` does not belong here.
- `command-palette.tsx` lives in **`search/`** (not `shell-ui`).

## Naming Policy

- Files and folders use kebab-case.
- Public exports go through `index.ts`.
- Names should describe the smallest reusable responsibility.

## Content main state frames

`ShellLoadingFrame`, `ShellEmptyStateFrame`, and `ShellDegradedFrame` all map to the
`content.main` slot in shell doctrine. **Mount only one** of these (or normal page
content) as the primary surface in the main region at a time.

### Decision matrix

| State | When to use | Key signals | Example |
| --- | --- | --- | --- |
| **ShellLoadingFrame** | Data is still loading or computing; user should wait before real content. | Pending fetch, route transition, initial load. | User opens “Reports” and the query is in flight. |
| **ShellEmptyStateFrame** | System is healthy but there is nothing to show yet. | Empty query result, no records created, valid empty list. | New tenant opens “Projects” with zero projects. |
| **ShellDegradedFrame** | Partial outage, error, compliance block, or operational warning. | API error, governance denial, service degradation. | Dashboard unavailable due to outage; policy blocks viewing a resource. |

### Usage guidance

- Prefer a clear sequence: **loading** while fetching, then **empty** if the response is success-with-no-rows, or **degraded** on failure / block (not all flows need all three).
- **Empty:** use `children` for primary actions (e.g. “Create project”).
- **Degraded:** use `description` / `children` for retry, help, or support links.

### Route-level flow (which frame to mount)

Wireframe-style flow (plain text; readable in any editor or GitHub without diagram tooling):

```text
                    +---------------------------+
                    | Route / page mounts       |
                    +-------------+-------------+
                                  |
                                  v
                    +---------------------------+
                    | Wait on async work?       |
                    | (fetch, route, shell gate)|
                    +-------------+-------------+
                          yes     |     no
              +-------------------+---+-------------------+
              v                       v
   +----------------------+   +---------------------------+
   | ShellLoadingFrame    |   | Outcome already known     |
   | (until request ends) |   | (skip loading)            |
   +----------+-----------+   +-------------+-------------+
              |                             |
              +-------------+---------------+
                            v
               +---------------------------+
               | Outcome after load / gate |
               +-------------+-------------+
          +-----------+-----------+-----------+
          v           v           v
   +-----------+ +-----------+ +----------------+
   | Has rows  | | Success,  | | Error, policy, |
   | to show   | | zero rows | | or degraded    |
   +-----+-----+ +-----+-----+ +--------+-------+
         |             |              |
         v             v              v
   +-----------+ +-----------+ +----------------+
   | Normal    | | ShellEmpty| | ShellDegraded  |
   | content   | | StateFrame| | Frame          |
   +-----------+ +-----------+ +----------------+
```

Normative registry and contracts: `packages/shadcn-ui/src/lib/constant/policy/shell/` and `SHELL_COMPONENTS_GUARDRAILS.md`.
