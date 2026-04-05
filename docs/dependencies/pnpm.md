# pnpm guide (Afenda)

This document describes how the **Afenda** monorepo uses **[pnpm](https://pnpm.io/)** — **performant npm** — for **workspaces**, **strict installs**, and **`pnpm --filter`** scripts layered under **Turborepo**.

**Status:** **Adopted** at the **repo root** — **`packageManager`**: **`pnpm@10.33.0`** in root [`package.json`](../../package.json) (use [Corepack](https://nodejs.org/api/corepack.html) or a matching global install so everyone resolves the same pnpm). Workspaces are declared in [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml).

**Official documentation:**

- [pnpm.io](https://pnpm.io/) — overview and CLI
- [`package.json` fields](https://pnpm.io/package_json) — **`packageManager`**, **`pnpm`** field
- [`pnpm-workspace.yaml`](https://pnpm.io/pnpm-workspace_yaml) — **`packages:`** globs, includes/excludes
- [Workspaces](https://pnpm.io/workspaces) — **`workspace:`** protocol, **`workspace:*`**, relative **`workspace:../pkg`**
- [Filtering](https://pnpm.io/filtering) — **`--filter`**, selectors
- [Recursive (`-r`)](https://pnpm.io/cli/recursive) — run across workspace packages
- [`pnpm add`](https://pnpm.io/cli/add) — **`-w`** / **`--ignore-workspace-root-check`**, **`--filter`**, **`--save-catalog`** (pnpm 10.12+)
- [Catalogs](https://pnpm.io/catalogs) — **`catalog`**, **`catalogs:`**, **`catalog:`** in **`package.json`**
- [FAQ](https://pnpm.io/faq) — store location, hard links, same-filesystem notes

pnpm uses a **content-addressable store** and **hard links** into `node_modules`, giving **strict, deduplicated** installs and fast disk use compared to flat `node_modules` trees.

---

## How we use pnpm

| Aspect | Afenda convention |
| --- | --- |
| **Monorepo** | **`apps/*`**, **`packages/*`** via [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml) (**`packages:`** globs — see [workspace file](https://pnpm.io/pnpm-workspace_yaml)) |
| **Internal deps** | **`workspace:*`** (or **`workspace:../other-pkg`**) so resolution stays **inside** the workspace ([workspace protocol](https://pnpm.io/workspaces)) |
| **Single PM** | **`only-allow pnpm`** on `preinstall` so npm/yarn don’t corrupt the lockfile |
| **Scripts** | Root scripts delegate to **Turborepo**; run package scripts with **`pnpm --filter <name>`** |
| **Lockfile** | Commit **`pnpm-lock.yaml`**; CI uses the same pnpm version as **`packageManager`** |
| **Root deps** | Adding deps to the **workspace root** requires **`-w`** (e.g. **`pnpm add -D typescript -w`**) — see [`pnpm add`](https://pnpm.io/cli/add) |

---

## Install and version

- Enable **Corepack** (Node 16.13+): `corepack enable` — then installs respect **`packageManager`** ([Corepack](https://nodejs.org/api/corepack.html)).
- Align **local** pnpm with the repo: `pnpm -v` should match the **`packageManager`** major/minor policy when possible.

Root **`engines.node`** (`^20.19.0 || >=22.12.0`) defines **Node** for the monorepo; it is separate from the pnpm version field.

---

## Store location and multiple drives (FAQ)

From the [pnpm FAQ](https://pnpm.io/faq): the **package store should live on the same drive and filesystem** as the project when you rely on **hard linking**. If the store is on another disk, pnpm **copies** packages instead of linking, which **hurts disk and performance**. If no store path is set, pnpm may create **one store per drive**. On Windows/WSL/macOS mixed setups, keep clones and stores on the same volume when you can.

---

## Daily commands

| Goal | Example |
| --- | --- |
| Install all workspaces | `pnpm install` (repo root) |
| Run a script in one package | `pnpm --filter @afenda/web dev` |
| Add a dep to one package | `pnpm --filter @afenda/web add <pkg>` |
| Add a dev dep to the **root** | `pnpm add -D <pkg> -w` |
| Run from package directory | `cd apps/web && pnpm <script>` |
| Run a script in **all** packages | `pnpm -r run <script>` (see [recursive](https://pnpm.io/cli/recursive) — root may be excluded unless configured) |

Combine **`--filter`** with [Turborepo](./turborepo.md) for graph-aware **`turbo run`** tasks.

---

## Workspaces and `workspace:`

- Declare internal packages under **`apps/*`** / **`packages/*`** per [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml).
- Reference them in **`package.json`** with **`"name": "@afenda/..."`** and **`"workspace:*"`** (or **`workspace:pkg@*`** alias form) so bumps stay consistent ([workspaces](https://pnpm.io/workspaces)).

---

## Catalogs and overrides

When many packages share the same version (e.g. TypeScript, React), use **[pnpm catalogs](https://pnpm.io/catalogs)** in **`pnpm-workspace.yaml`**:

- **`catalog:`** — default catalog; reference in **`package.json`** with **`"react": "catalog:"`** or **`catalog:default`**.
- **`catalogs:`** — named catalogs (e.g. **`catalog:react18`**) for incremental migrations.

**`pnpm add`** can write into a catalog with **`--save-catalog`** / **`--save-catalog-name`** on supported pnpm 10.x versions ([`pnpm add` options](https://pnpm.io/cli/add)).

Use **`pnpm.overrides`** only when you must **force** a transitive version for security or compatibility—document the reason in the PR.

---

## pnpm 10+ features (optional adoption)

The following are **not required** for this repo today but are useful as the monorepo grows:

- **`--allow-build`** / **`onlyBuiltDependencies`** — control which packages may run **postinstall** scripts ([`pnpm add`](https://pnpm.io/cli/add), workspace **`pnpm-workspace.yaml`**).
- **Config dependencies** — In pnpm **v10+**, [`configDependencies`](https://pnpm.io/) in **`pnpm-workspace.yaml`** can install shared **hooks**, **patches**, or **allowBuilds** config into `node_modules/.pnpm-config` **before** the main graph resolves—good for **centralized, versioned** pnpm policy across teams ([pnpm 2025 blog](https://pnpm.io/blog/2025/12/29/pnpm-in-2025)).
- **`devEngines.runtime`** — pnpm can help teams align **Node** (or other runtimes) via **`package.json`** `devEngines` ([same blog](https://pnpm.io/blog/2025/12/29/pnpm-in-2025)). Afenda currently relies on **`engines`** + CI images; adopt **`devEngines`** if you want pnpm-managed runtimes.

Verify current field names and behavior in the [pnpm documentation](https://pnpm.io/) for your exact pnpm minor version.

---

## Red flags

- Running **`npm install`** or **`yarn`** at the root (different lockfile and layout).
- **Different pnpm major** than **`packageManager`** without team agreement.
- **Deleting `pnpm-lock.yaml`** to “fix” conflicts—prefer **`pnpm install`** / targeted overrides with review.

---

## Deeper reference

- Repo: [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml), root [`package.json`](../../package.json), optional **`.npmrc`** (if added later).
- Skills: [pnpm-workspace](../../.agents/skills/pnpm-workspace/SKILL.md), [pnpm](../../.agents/skills/pnpm/SKILL.md).

---

## Related documentation

- [Turborepo](./turborepo.md) — task orchestration on top of pnpm workspaces
- [Project configuration](../PROJECT_CONFIGURATION.md) — scripts and tooling
- [Deployment](../DEPLOYMENT.md) — install commands on Vercel (`pnpm install`)

**External:** [pnpm.io](https://pnpm.io/) · [pnpm GitHub](https://github.com/pnpm/pnpm)

**Context7 library IDs (doc refresh):** `/websites/pnpm_io` · `/pnpm/pnpm`
