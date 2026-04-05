# XYFlow guide (Afenda)

This document describes **planned** use of **[React Flow](https://reactflow.dev/)** (**[`@xyflow/react`](https://www.npmjs.com/package/@xyflow/react)**) from **[xyflow](https://github.com/xyflow/xyflow)** for **interactive node–edge** UIs (workflows, diagrams, org-style graphs). The same org ships **Svelte Flow** (**`@xyflow/svelte`**) for non-React stacks—we standardize on **`@xyflow/react`** for **`apps/web`**.

**Status:** **Planned** — **`@xyflow/react`** is **not** in [`apps/web/package.json`](../../apps/web/package.json) today (a legacy template elsewhere pins **`^12.10.0`** for reference only).

**Official documentation:**

- [reactflow.dev](https://reactflow.dev/) — product home
- [Installation & requirements](https://reactflow.dev/learn/getting-started/installation-and-requirements) — **`pnpm add @xyflow/react`**, **`@xyflow/react/dist/style.css`**
- [Learn](https://reactflow.dev/learn) — concepts and guides
- [API reference](https://reactflow.dev/api-reference) — **`<ReactFlow />`**, hooks, types
- [Hooks & providers](https://reactflow.dev/learn/advanced-use/hooks-providers) — **`ReactFlowProvider`**, **`useNodesState`**, **`useEdgesState`**, **`addEdge`**
- [Accessibility](https://reactflow.dev/learn/advanced-use/accessibility) — **`nodesFocusable`**, **`edgesFocusable`**, **`disableKeyboardA11y`**, **`ariaLabelConfig`**
- [Performance](https://reactflow.dev/learn/advanced-use/performance) — **`React.memo`**, stable **`nodeTypes` / `edgeTypes`**, avoid over-subscribing to **`nodes` / `edges`**
- [Examples](https://reactflow.dev/examples)
- [Troubleshooting / migration](https://reactflow.dev/learn/troubleshooting) — version upgrade notes
- [xyflow on GitHub](https://github.com/xyflow/xyflow)

For **static** KPI or time-series charts, prefer lighter **chart** libraries; use React Flow when **editing** or **exploring** a **graph** is the primary task.

---

## Target stack (when adopted)

| Piece | Notes |
| --- | --- |
| **`@xyflow/react`** | Canvas, built-in interactions (pan/zoom, connect, select) |
| **Styles** | Import **`@xyflow/react/dist/style.css`** once (see [installation](https://reactflow.dev/learn/getting-started/installation-and-requirements)) |
| **State** | **`useNodesState` / `useEdgesState`** or a **store**; persist via [HTTP API](../API.md) with explicit contracts |
| **Providers** | **`ReactFlowProvider`** when using **`useReactFlow`** or nested panels outside the main tree ([hooks & providers](https://reactflow.dev/learn/advanced-use/hooks-providers)) |

---

## How we will use XYFlow

| Topic | Convention |
| --- | --- |
| **Placement** | Prefer **`apps/web/src/features/<domain>/...`** for substantial flows ([AGENTS.md](../../AGENTS.md)) |
| **Performance** | Cap **node/edge** counts, profile large canvases, follow [performance](https://reactflow.dev/learn/advanced-use/performance) guidance ([Performance](../PERFORMANCE.md)) |
| **State** | Keep **graph state** predictable; **save/load** through the **API** with versioned DTOs ([State management](../STATE_MANAGEMENT.md)) |
| **a11y** | Enable keyboard support where appropriate; offer **list/table** alternatives for **compliance-critical** tasks ([Design system](../DESIGN_SYSTEM.md), [accessibility](https://reactflow.dev/learn/advanced-use/accessibility)) |
| **Adoption** | e.g. **`pnpm add @xyflow/react --filter @afenda/web`** — align major with **React 19** + docs for that release ([pnpm](./pnpm.md)) |

---

## Red flags

- **Canvas-only** workflows for **critical** actions with **no** non-visual equivalent.
- **Unstable `nodeTypes` / `edgeTypes`** objects recreated every render ([common patterns](https://reactflow.dev/learn/advanced-use/performance)).
- **Treating** React Flow as a **charting** library for simple read-only metrics (heavier than needed).

---

## Deeper reference

- [Components and styling](../COMPONENTS_AND_STYLING.md) — composition, tokens
- Skill (optional): [web-design-guidelines](../../.agents/skills/web-design-guidelines/SKILL.md) for a11y review

---

## Related documentation

- [Performance](../PERFORMANCE.md)
- [Design system](../DESIGN_SYSTEM.md)
- [Components and styling](../COMPONENTS_AND_STYLING.md)
- [State management](../STATE_MANAGEMENT.md)
- [API reference](../API.md)
- [React](./react.md)

**External:** [reactflow.dev](https://reactflow.dev/) · [xyflow GitHub](https://github.com/xyflow/xyflow)

**Context7 library IDs (doc refresh):** `/websites/reactflow_dev` · `/xyflow/xyflow`
