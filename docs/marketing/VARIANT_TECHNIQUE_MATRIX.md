# Experimental landing variants — technique matrix

Canonical flagship lives under `pages/landing/flagship/`. Numbered files under `pages/landing/` are **exploration**, not identity ([ADR-0006](../decisions/ADR-0006-marketing-feature-topology.md)). This matrix scores **reuse patterns** for flagship — **canonical-safe: yes** only if aligned with brand docs and layer budget.

**Column guide**

| Column                        | Meaning                                                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **motif**                     | Dominant visual idea                                                                                                            |
| **mechanism**                 | Primary implementation                                                                                                          |
| **fixed / sticky**            | Layout behavior cost                                                                                                            |
| **blend / filter / backdrop** | Compositing cost                                                                                                                |
| **scroll coupling**           | Motion tied to scroll progress                                                                                                  |
| **viewport-height theater**   | Very tall scroll + sticky viewport                                                                                              |
| **new deps**                  | Extra npm packages                                                                                                              |
| **canonical-safe**            | Suitable to echo on flagship without diluting brand (ADR-0006)                                                                  |
| **flagship target**           | Where a _pattern_ could apply (not full-screen copy)                                                                            |
| **recommended form**          | `class` (extend [marketing.css](../../apps/web/src/marketing/marketing.css)), `colocate` (`landing/flagship/`), or `route-only` |

## Variants (registry order)

| Variant              | motif                             | mechanism                         | fixed/sticky         | blend/filter | scroll coupling                   | vh theater | new deps               | canonical-safe                                 | flagship target              | recommended form             |
| -------------------- | --------------------------------- | --------------------------------- | -------------------- | ------------ | --------------------------------- | ---------- | ---------------------- | ---------------------------------------------- | ---------------------------- | ---------------------------- |
| Moire                | Editorial B&W grid, monolith hero | CSS grid lines + FM parallax      | fixed overlay grid   | mask fades   | progress on hero                  | no         | none                   | partial (tone)                                 | hero grid echo               | class                        |
| Kinetic Absolutism   | Kinetic type, striking layout     | FM + CSS                          | varies               | low          | some                              | no         | none                   | partial                                        | motion tokens                | colocate                     |
| Single-Life          | Single-thread narrative           | FM, sections                      | varies               | low          | some                              | no         | none                   | partial                                        | section reveals              | class                        |
| Forensic             | Blueprint, telemetry, hairlines   | CSS + FM, `mix-blend-difference`  | **fixed** structural | **high**     | yes                               | sections   | none                   | partial (not full blend on flagship)           | hairlines as **token** lines | class                        |
| Topology             | Particle / axis field             | **R3F + three**                   | canvas full viewport | GPU          | camera stages                     | yes        | **three, fiber, drei** | yes (as story) / no (embed on flagship)        | n/a for default flagship     | **route-only**               |
| Monochrom            | Monochrome product story          | CSS + FM                          | varies               | low          | optional                          | no         | none                   | partial                                        | cards/surfaces               | class                        |
| Resolve              | Resolve / closure narrative       | FM, layout                        | varies               | low          | some                              | no         | none                   | partial                                        | CTA band                     | class                        |
| Polaris              | Forensic singularity              | layered SVG/CSS, **sticky** stack | **sticky** viewport  | blur, bloom  | **strong**                        | **yes**    | none                   | partial (sticky theater too heavy for default) | avoid full parity            | route-only or future chapter |
| Surface              | Surface / depth                   | CSS + FM                          | varies               | medium       | some                              | no         | none                   | partial                                        | panels                       | class                        |
| Monument             | Monument typography               | type + space                      | varies               | low          | optional                          | no         | none                   | partial                                        | headings rhythm              | class                        |
| Beastmode            | High-impact CTA / proof           | cards + motion                    | varies               | low–medium   | some                              | no         | none                   | partial                                        | CTA (content)                | colocate                     |
| Flagship (canonical) | Product ERP narrative             | DS cards + marketing.css          | section-relative     | controlled   | in-view + **hero-local** parallax | no         | none                   | **yes** — identity                             | all sections                 | flagship page                |

## Policy

- **Three / R3F** on marketing: **route-only** by default (variant routes + dynamic `import()`). See [marketing-webgl-route-only.md](../decisions/marketing-webgl-route-only.md).
- Prefer extending **`.flagship-grid`**, **`.flagship-grain`**, and `.marketing-root::before` ambient before adding a **second** full-viewport fixed layer ([BRAND_GUIDELINES.md](../BRAND_GUIDELINES.md), [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) §11).
