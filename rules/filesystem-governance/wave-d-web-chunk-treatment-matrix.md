# Wave D Web Chunk Treatment Matrix

## Purpose

This matrix records the current measured web build chunk surface and the intended treatment for each heavy chunk. The goal is not to guess at “performance work later.” It is to make the surviving bundle debt explicit by route/domain.

Measured from:

- `pnpm --filter @afenda/web run build`
- `pnpm --filter @afenda/web run build:analyze`

Measurement date:

- `2026-04-22`

## Production Build Snapshot

| Chunk                            |        Size |      Gzip | Current role                                                       | Treatment decision                                                                                                                                                     | Status                   |
| -------------------------------- | ----------: | --------: | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `vendor-B-QzxGYu.js`             | 2,583.98 kB | 692.61 kB | still-too-large generic dependency bucket                          | continue splitting route-bounded libraries out of the generic vendor bucket; next audit should target remaining always-on UI/runtime stacks inside this chunk          | follow-up required       |
| `vendor-3d-DV6CCTn8.js`          |   883.18 kB | 237.63 kB | marketing-only / visual-heavy 3D stack (`three`, `@react-three/*`) | keep isolated from the always-on vendor bucket; load only on pages that need it                                                                                        | accepted in current wave |
| `index-nCgblMsi.js`              |   634.33 kB | 182.51 kB | app bootstrap, route registry, shell/runtime glue                  | keep under review; next treatment wave should identify what remains eagerly imported into the main entry and which route-only packages can move behind lazy boundaries | follow-up required       |
| `vendor-react-UijJtNKp.js`       |   193.39 kB |  60.75 kB | React core + scheduler                                             | keep combined to avoid circular chunk regressions                                                                                                                      | accepted baseline        |
| `vendor-auth-DSxZJRS1.js`        |   149.77 kB |  44.30 kB | auth-only client stack (`better-auth*`, `@better-auth-ui/*`)       | keep isolated from the always-on vendor bucket                                                                                                                         | accepted in current wave |
| `vendor-motion-CVQw9FtI.js`      |    40.51 kB |  14.17 kB | motion stack (`framer-motion`)                                     | keep isolated; revisit only if it starts leaking into the main entry                                                                                                   | accepted in current wave |
| `router-Bh5VIqtM.js`             |    88.15 kB |  29.72 kB | routing/runtime navigation stack                                   | accepted baseline for now                                                                                                                                              | accepted baseline        |
| `flagship-page-BuyhR6zC.js`      |    51.78 kB |  14.68 kB | flagship landing route payload                                     | route-bounded and acceptable                                                                                                                                           | accepted baseline        |
| `erp-benchmark-page-B2BdFOO7.js` |    22.99 kB |   6.21 kB | ERP benchmark campaign page                                        | route-bounded and acceptable                                                                                                                                           | accepted baseline        |

## Before / After Delta

Measured against the previous production build output before this wave’s manual chunk refinement.

| Chunk family     |                      Before |              After |        Delta | Decision                               |
| ---------------- | --------------------------: | -----------------: | -----------: | -------------------------------------- |
| generic `vendor` |                 3,663.09 kB |        2,583.98 kB | -1,079.11 kB | improved materially; still too large   |
| auth stack       | bundled into generic vendor | 149.77 kB isolated |     isolated | keep split                             |
| 3D stack         | bundled into generic vendor | 883.18 kB isolated |     isolated | keep split                             |
| motion stack     | bundled into generic vendor |  40.51 kB isolated |     isolated | keep split                             |
| main `index`     |                   621.88 kB |          634.33 kB |    +12.45 kB | still needs a later eager-import audit |

## Route / Domain Treatment Decisions

| Surface                       | Current assessment                                            | Next move                                                                                                                               |
| ----------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| marketing 3D/visual pages     | heavy but route-bounded                                       | preserve lazy route ownership; do not merge back into generic vendor                                                                    |
| auth surfaces                 | route-bounded and not part of first-paint marketing/app shell | keep auth stack split from generic vendor                                                                                               |
| app shell / runtime bootstrap | still too eager                                               | inspect route/bootstrap imports and promote more route-only dependencies behind lazy boundaries                                         |
| generic UI/runtime vendor     | still oversized                                               | inspect remaining top contributors from `stats.html`; likely candidates are broad UI/runtime packages still imported by shared surfaces |
| charting/reporting            | not yet a dominant measured chunk in this snapshot            | defer until a route actually pulls enough chart code to justify a dedicated chunk                                                       |
| drag/drop                     | not yet a dominant measured chunk in this snapshot            | defer until feature usage shows it inflating the generic vendor bucket                                                                  |

## Rules For The Next Chunk Wave

- do not split packages only because they are large; split them only when their route/domain ownership is clear
- do not isolate `react` / `react-dom` / `scheduler` separately from the current `vendor-react` baseline without a measured circular-chunk-safe reason
- treat main-entry growth as an eager-import problem, not as a generic “more chunks” problem
- use route/domain ownership as the first decision rule, then bundle size as the second

## Current Conclusion

- The chunk surface is healthier than before this wave.
- The bundle is **not sealed** yet because the generic `vendor` chunk and main `index` entry remain too large.
- The repo now has an explicit treatment decision by route/domain, which is the required output of this wave.
