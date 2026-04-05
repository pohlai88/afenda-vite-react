# Prettier guide (Afenda)

This document describes how **Afenda** uses **[Prettier](https://prettier.io/)** for **repo-wide formatting**, paired with **ESLint** for correctness. **`eslint-config-prettier`** turns off ESLint rules that **clash** with Prettier’s output — it must stay **last** in the ESLint config array ([ESLint](./eslint.md)).

**Status:** **Adopted** — formatting is **repo-wide** from the **repository root** (single config).

**Official documentation:**

- [prettier.io](https://prettier.io/)
- [Configuration](https://prettier.io/docs/en/configuration.html) — config file discovery, **`package.json`** `"prettier"` key, precedence
- [Options](https://prettier.io/docs/en/options.html)
- [CLI](https://prettier.io/docs/en/cli.html) — **`--check`**, **`--write`**, **`--config`**
- [Ignore](https://prettier.io/docs/en/ignore.html) — **`.prettierignore`**, **`prettier-ignore`** comments
- [Prettier vs linters](https://prettier.io/docs/en/why-prettier.html)
- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) — disabling conflicting ESLint rules; [flat config notes](https://github.com/prettier/eslint-config-prettier/blob/main/README.md) (**`eslint-config-prettier/flat`**, order, plugin naming)
- [Prettier on GitHub](https://github.com/prettier/prettier)

**Afenda overview:** [Project configuration](../PROJECT_CONFIGURATION.md) §Prettier.

---

## Where it lives

| Path | Role |
| --- | --- |
| [`prettier.config.js`](../../prettier.config.js) | Rules (ESM **`export default`** compatible with root **`"type": "module"`**) |
| [`.prettierignore`](../../.prettierignore) | Excluded paths (build output, lockfiles, etc.) |
| Root [`package.json`](../../package.json) | `format`, `format:check`, **lint-staged** |

Prettier resolves config by **walking up** from each file ([Configuration](https://prettier.io/docs/en/configuration.html)); keep **one** canonical config at the repo root for Afenda.

---

## How we use Prettier

| Topic | Convention |
| --- | --- |
| **Single config** | No per-package Prettier unless a rare exception is approved |
| **CI** | Run **`pnpm format:check`** (via Turbo) alongside **`pnpm lint`** |
| **Editor** | Format on save recommended |
| **ESLint order** | **`eslintConfigPrettier`** is the **final** entry in [`eslint.config.js`](../../eslint.config.js) so no later block re-enables stylistic rules that fight Prettier ([eslint-config-prettier README](https://github.com/prettier/eslint-config-prettier/blob/main/README.md)) |
| **Flat config** | This repo imports **`eslint-config-prettier`** directly; upstream also documents **`eslint-config-prettier/flat`** — follow the package version you have. Use **standard** ESLint plugin names (`@typescript-eslint`, not ad hoc aliases) so eslint-config-prettier can turn off the right rules |

### CLI (illustrative)

```bash
# Check formatting (CI / local)
pnpm exec prettier . --check

# Write formatting (local / scripted)
pnpm exec prettier . --write
```

**`--check`** prints a short summary when files differ ([CLI](https://prettier.io/docs/en/cli.html)). Prefer **`pnpm format`** / **`pnpm format:check`** from root [`package.json`](../../package.json) so flags stay consistent.

### When to skip formatting

Use **`// prettier-ignore`** (or language-appropriate comments) **sparingly** for generated matrices, rare JSX layout, etc. ([Ignore](https://prettier.io/docs/en/ignore.html)). Prefer fixing the config or the code structure first.

---

## Red flags

- **Fighting** Prettier with conflicting ESLint style rules — remove or disable them; keep **eslint-config-prettier** **last**.
- Putting **eslint-config-prettier** **before** custom **`rules`** that re-enable **`indent`**, **`quotes`**, etc.
- **Mass reformat** mixed with feature commits (split PRs when possible).
- **Aliasing** ESLint plugins to non-standard names so **eslint-config-prettier** cannot match rule prefixes ([README warning](https://github.com/prettier/eslint-config-prettier/blob/main/README.md)).

---

## Related documentation

- [ESLint](./eslint.md)
- [Project configuration](../PROJECT_CONFIGURATION.md)
- [TypeScript](./typescript.md) — formatting-adjacent editor settings

**External:** [prettier.io](https://prettier.io/) · [Prettier GitHub](https://github.com/prettier/prettier) · [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)

**Context7 library IDs (doc refresh):** `/prettier/prettier` · `/prettier/eslint-config-prettier`
