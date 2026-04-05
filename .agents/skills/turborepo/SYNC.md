# Sync Info

- **Upstream:** [Vercel Turborepo skills](https://turborepo.com/docs/guides/ai) (`vercel/turborepo` on GitHub)
- **Bundled copy:** `.agents/skills/turborepo` (this repo)
- **Previous vendor SHA:** `77190449c8c2595ab05eff2a43d633d3de651c2b` (2026-03-16)
- **Last refresh:** 2026-04-05 via `npx skills add vercel/turborepo --yes` (writes `.agents/skills/turborepo` in this repo)

## Refresh the skill (official installer)

Non-interactive (defaults):

```bash
npx skills add vercel/turborepo --yes
```

Interactive (pick agent targets such as Cursor / Codex):

```bash
npx skills add vercel/turborepo
```

If your CLI version targets a different folder, merge into `.agents/skills/turborepo` manually.

## This workspace

- Root orchestration: `turbo.json`, `pnpm-workspace.yaml`, `package.json` scripts use **`turbo run` only** (see `SKILL.md`).
- Enterprise defaults: transit-linked `lint` / `typecheck` / `build`, `VITE_*` env hashing, `.env` inputs, GitHub Actions + optional Remote Cache (`.env.turbo.example`, `.github/workflows/ci.yml`).
