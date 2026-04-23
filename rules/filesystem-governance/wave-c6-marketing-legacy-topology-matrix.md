# Wave C.6 Marketing Legacy Topology Matrix

This matrix records the bounded delete/quarantine review for the marketing-public lane after the new structured topology became the live runtime surface.

| Legacy surface | Replacement / canonical owner | Decision | Result |
| --- | --- | --- | --- |
| `apps/web/src/marketing/pages/_components/*` | `apps/web/src/marketing/components/*` | Retire the generic `_components` bucket and keep shared marketing primitives under `components/`. | Shared marketing surface is structural and explicit. |
| Flat domain page files such as `pages/company/about-page.tsx`, `pages/legal/trust-center-page.tsx`, `pages/product/truth-engine-page.tsx`, `pages/regional/asia-pacific-page.tsx` | Nested route-owned folders under `pages/company/about/`, `pages/legal/*/`, `pages/product/truth-engine/`, `pages/regional/asia-pacific/` | Retire flat page files once registry and tests point to nested route-owned modules. | Domain pages now follow route-owned topology. |
| `apps/web/src/marketing/pages/landing/flagship/flagship-page-panels.tsx` | Split flagship section files such as `flagship-page-benchmark-panel.tsx`, `flagship-page-proof-surface.tsx`, and `flagship-page-proof-chamber.tsx` | Retire the broad panel bundle in favor of explicit section ownership. | Flagship composition is narrower and clearer. |
| `apps/web/src/marketing/prompt/*.md` | Repo docs only when marketing prompts are still needed | Delete in-source prompt/planning markdown from the runtime feature tree. | Marketing source tree no longer mixes runtime and prompt artifacts. |
