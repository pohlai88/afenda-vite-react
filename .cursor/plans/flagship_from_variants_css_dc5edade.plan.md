---
name: Flagship from variants CSS
overview: >-
  Single doc: evolve canonical flagship from experimental landing variants
  (CSS-first, hero-local scroll motion, extend marketing.css primitives, Three
  route-only); baseline before changes; matrix + phases + exit criteria inline.
---

# Flagship from experimental variants — consolidated plan

**Intent:** Borrow techniques from `apps/web/src/marketing/pages/landing` variants to strengthen [`afenda-flagship-page.tsx`](apps/web/src/marketing/pages/landing/flagship/afenda-flagship-page.tsx) without turning the canonical page into an experiment. Align with [**ADR-0006**](docs/decisions/ADR-0006-marketing-feature-topology.md): flagship = canonical brand face; variants = exploration. Every borrow passes a **`canonical-safe: yes`** gate.

**Non-goals (default bundle):** Do **not** add `three`, `@react-three/fiber`, or `@react-three/drei` to flagship. Heavy 3D stays on **variant routes** already code-split via `import()` in [`marketing-page-registry.ts`](apps/web/src/marketing/marketing-page-registry.ts) ([**PERFORMANCE.md**](docs/PERFORMANCE.md) — prefer route boundaries).

---

## 1. Baseline (do this first — measure, don’t guess)

Record numbers before you change behavior ([**PERFORMANCE.md**](docs/PERFORMANCE.md)):

1. **Lighthouse** (or equivalent) on `/marketing/flagship` — performance + a11y snapshot.
2. **Chunks** — Vite/Rollup output or analyzer: what loads for the flagship route (initial vs lazy).
3. **`prefers-reduced-motion`** — walk hero + sections with reduce motion on; note motion-only information.
4. **Mobile** — short scroll check on **Safari** and **Chrome** (jank, broken sticky).

Use this as the comparison baseline before merge.

---

## 2. Inventory matrix (cost ≠ imports only)

Heavy UX cost can come from **fixed/sticky stacks**, **blend/filter/backdrop**, and **tall scroll + sticky viewports** — without any new package. Examples: [**4.Forensic-BW.tsx**](apps/web/src/marketing/pages/landing/4.Forensic-BW.tsx) (`mix-blend-difference`, fixed structure); [**8.Polaris.tsx**](apps/web/src/marketing/pages/landing/8.Polaris.tsx) (tall scroll, sticky layers, blooms). Build one table with columns:

| Column                        | Purpose                                                                                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **motif**                     | Visual idea (grid, hairline, grain, bloom, …)                                                                                                           |
| **mechanism**                 | CSS / SVG / FM / Canvas                                                                                                                                 |
| **fixed / sticky**            | Fixed overlay? Sticky theater?                                                                                                                          |
| **blend / filter / backdrop** | e.g. `mix-blend-*`, blur layers                                                                                                                         |
| **scroll coupling**           | none / in-view / progress-bound transforms                                                                                                              |
| **viewport-height theater**   | e.g. huge scroll height + sticky viewport                                                                                                               |
| **new deps**                  | Optional; often `none`                                                                                                                                  |
| **canonical-safe**            | **yes / no** ([ADR-0006](docs/decisions/ADR-0006-marketing-feature-topology.md))                                                                        |
| **flagship target section**   | hero, canon, CTA, or **not flagship**                                                                                                                   |
| **recommended form**          | extend **class** in [`marketing.css`](apps/web/src/marketing/marketing.css); **component** colocated under `pages/landing/flagship/`; or **route-only** |

---

## 3. Brand and layer budget

- Follow [**BRAND_GUIDELINES.md**](docs/BRAND_GUIDELINES.md) §4 (gradient scarcity — not on cards/buttons as generic decoration) and [**DESIGN_SYSTEM.md**](docs/DESIGN_SYSTEM.md) §11 (no decorative blur blobs / gradient abuse).
- [`marketing.css`](apps/web/src/marketing/marketing.css) already has a **fixed ambient plane** on `.marketing-root::before` (~303–327). Treat a **second** full-view fixed hero layer as **exceptional**; prefer extending **`.flagship-grid`**, **`.flagship-grain`**, and existing section surfaces (e.g. canon field patterns in flagship) before adding competing planes.

---

## 4. Phase A — extend primitives (no parallel “ambient” stacks)

1. Evolve **`.flagship-grid`**, **`.flagship-grain`**, canon/section patterns in **`marketing.css`** and reuse what **CanonSection** and other flagship sections already use.
2. Do **not** invent duplicate utility families unless a motif cannot map to tokens.
3. **Colocation:** flagship-only UI → `pages/landing/flagship/`. Promote to [`pages/_components`](apps/web/src/marketing/pages/_components/) only if **multiple** marketing pages need the same block.

---

## 5. Motion consolidation + Phase B (scroll)

- [`marketing-reveal.ts`](apps/web/src/marketing/pages/_components/marketing-reveal.ts) already has shared ease + `getMarketingReveal` (`whileInView`).
- Flagship still has local `EASE_OUT`, `getHeroReveal`, `getSectionReveal` in [`afenda-flagship-page.tsx`](apps/web/src/marketing/pages/landing/flagship/afenda-flagship-page.tsx) (~32, ~141–156). **Unify shared easing** (single source); align helpers where semantics match; thin wrappers only if hero vs section must differ.

**Phase B — hero-local scroll only**

- `useScroll` / `useTransform` on a **hero-local ref**, not page-global progress driving the whole page.
- Parallax **background / panel / grid** layers; keep **headline copy** mostly static.
- Respect **`prefers-reduced-motion`** (flatten or disable transforms).

---

## 6. Phase C — WebGL / Three (closed policy)

**Default:** **Three / R3F is route-only** for marketing (e.g. [`5.Topology-BW.tsx`](apps/web/src/marketing/pages/landing/5.Topology-BW.tsx) + registry splits). **Not** embedded in flagship unless product approves a **measured** exception.

Document in a short note beside [**ADR-0006**](docs/decisions/ADR-0006-marketing-feature-topology.md) or under `docs/decisions/`: default route-only + exception criteria.

---

## 7. Exit criteria

- **Perf:** Compare Lighthouse (or agreed metric) to **§1 baseline**; note chunk regressions.
- **A11y:** Focus visibility; **contrast** on overlays/grids ([**DESIGN_SYSTEM.md**](docs/DESIGN_SYSTEM.md) §12); **reduced-motion** parity (no information only in motion).
- **Mobile:** Safari + Chrome scroll sanity.
- **Brand:** No new decorative blobs / gradient-on-card violations.
- **Governance:** Flagship-bound rows in the matrix stay **`canonical-safe: yes`**.

---

## 8. References (links)

[ADR-0006](docs/decisions/ADR-0006-marketing-feature-topology.md) · [PERFORMANCE.md](docs/PERFORMANCE.md) · [BRAND_GUIDELINES.md](docs/BRAND_GUIDELINES.md) §4 · [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) §11–12 · [marketing.css](apps/web/src/marketing/marketing.css) (`.marketing-root::before`, `.flagship-grid`, `.flagship-grain`) · [marketing-page-registry.ts](apps/web/src/marketing/marketing-page-registry.ts)

---

## 9. Execution checklist (single ordered list)

1. Run **§1 Baseline** and save numbers.
2. Fill **§2 matrix** for variants you might borrow from.
3. **§4 Phase A** — extend `marketing.css` / colocate under `landing/flagship/`.
4. **§5** — dedupe motion constants; **§5 Phase B** — hero-local scroll if approved.
5. **§6** — confirm route-only WebGL policy is documented.
6. Verify **§7 Exit** before merge.
