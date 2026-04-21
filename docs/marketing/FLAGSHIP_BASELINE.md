# Flagship / marketing baseline (measure before variant-inspired changes)

Re-run and replace **Recorded** fields when the marketing shell or flagship page changes materially. See [PERFORMANCE.md](../PERFORMANCE.md).

## How to collect

1. **Lighthouse** — Chrome DevTools → Lighthouse → mobile/desktop on `https://<host>/marketing/flagship` (or local dev URL). Note Performance and Accessibility scores.
2. **Chunks** — From repo root: `pnpm --filter @afenda/web exec vite build`. Inspect `apps/web/dist/assets/js/` for lazy chunks; flagship ships as a **separate** hashed chunk when loaded via route.
3. **`prefers-reduced-motion`** — OS: enable “Reduce motion”. Reload `/marketing/flagship`, confirm hero and sections do not rely on motion-only cues.
4. **Mobile scroll** — Physical device or emulator: Safari and Chrome, full-page scroll through hero and long sections; note jank or broken `position: sticky`.

## Last capture (update when re-baselining)

| Metric                                     | Recorded                                                                                   |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Date                                       | 2026-04-20                                                                                 |
| Lighthouse Performance (mobile)            | _fill on run_                                                                              |
| Lighthouse Accessibility                   | _fill on run_                                                                              |
| Flagship lazy chunk (example)              | `afenda-flagship-page-*.js` ≈ **26.6 kB** raw / **7.3 kB** gzip (from `vite build` output) |
| Main entry chunk (index-\*.js, indicative) | ~ **541 kB** raw / **154 kB** gzip — shared app shell; compare trends, not single absolute |
| Vendor chunk                               | Large shared `vendor-*.js` — not marketing-specific                                        |
| Reduced-motion pass                        | _pass/fail + notes_                                                                        |
| Mobile Safari scroll                       | _pass/fail + notes_                                                                        |
| Mobile Chrome scroll                       | _pass/fail + notes_                                                                        |

## Notes

- Topology variant chunk (`5.Topology-BW-*.js`) is **~13.8 kB** gzip ~4.8 kB in same build — Three/R3F + scene code is separated from flagship.
- After any flagship visual or motion change, re-run Lighthouse on flagship and compare to this table.
