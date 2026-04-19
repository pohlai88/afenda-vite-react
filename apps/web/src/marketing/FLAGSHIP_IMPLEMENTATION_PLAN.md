# Marketing Flagship Implementation Plan

## Purpose

This document is the shared working contract for the canonical marketing
homepage in [`pages/landing/flagship/`](./pages/landing/flagship/).

Use it when discussing:

- what "done" means for the flagship
- what is already implemented
- what remains
- which language the team should use when describing the work

This is not an ADR.

This is an execution document.

---

## Current status

- **State:** In progress
- **Estimated completion:** `82%`
- **Current page:** [`pages/landing/flagship/afenda-flagship-page.tsx`](./pages/landing/flagship/afenda-flagship-page.tsx)
- **Route contract:** `/` and `/marketing/flagship` resolve to the canonical flagship page when `marketing.config.ts` is in `flagship` mode
- **Current narrative state:** the page now follows the forensic-monument direction across all five major chambers
- **Current implementation fact:** the flagship now has a coherent five-section forensic-monument spine with a system-first hero, executable interrogation, a pressure-chamber NexusCanon, explicit failure exposure, and a verdict-led CTA

### Current completion by area

| Area                         | Status | Notes                                                                                                                      |
| ---------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------- |
| Routing + topology           | High   | Canon-first route behavior is in place                                                                                     |
| Flagship page structure      | High   | The five-section flagship spine is now fully implemented                                                                   |
| Visual refinement            | High   | The page is coherent and severe; the remaining work is compression and pacing, not invention                               |
| Motion system                | Medium | Restrained Framer Motion is active in hero, canon, failure, and CTA sections, but still needs final calibration            |
| Cinematic NexusCanon chamber | High   | The chamber now reads as a pressure field rather than a premium diagram, but still has headroom for a stronger lock moment |
| Responsive + QA polish       | Medium | Baseline works and focused tests pass, but final tuning remains                                                            |

### Implemented now vs still provisional

| Area                 | Current state                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------- |
| HeroSystemActivation | Implemented as system-first accusation with restrained scroll-linked motion and tighter void |
| InterrogationSection | Implemented as executable doctrine and validation                                            |
| NexusCanonSection    | Implemented as the one cinematic pressure chamber with scatter, drag, compression, and lock  |
| FailureModesSection  | Implemented as explicit competitive and evidentiary pressure                                 |
| CTAReckoningSection  | Implemented as a verdict-led conversion block                                                |

---

## Shared language

These terms should be used consistently in reviews, commits, and planning.

### Canonical page

The **flagship** page is the true public homepage.

- `/`
- `/marketing`
- `/marketing/flagship`

These should all express the same canonical public face unless configuration
explicitly enables random mode.

### Variant

A **variant** is an editorial or experimental landing page.

Variants are:

- valuable
- expressive
- reusable as idea sources

Variants are not:

- the canonical homepage
- the default brand contract

### Doctrine

**Doctrine** is the product law the machine executes.

In the flagship, doctrine is strongest when expressed as validation logic rather
than philosophy copy.

Preferred pattern:

- `CHECK_001: ORIGIN VERIFIED?`
- `CHECK_002: CAUSAL LINK PRESENT?`
- `CHECK_003: STATE CONSISTENCY MAINTAINED?`
- `CHECK_004: CROSS-ENTITY CONTINUITY PRESERVED?`

Doctrine should read like system enforcement, not marketing slogans.

### NexusCanon chamber

The **NexusCanon** section is the one cinematic section on the page.

Its role is:

- scatter
- drag
- compression
- lock

It must stay controlled. It is the page’s only true cinematic chamber, not a
license to animate everything.

### Failure modes

The **failure modes** section is where the flagship stops implying superiority
and states exactly where ordinary systems break.

It should:

- expose failure conditions directly
- show what ordinary systems cannot defend
- show why AFENDA survives that pressure

### Reckoning CTA

The **reckoning CTA** is the closing conversion block.

Its job is to:

- restate the system claim
- create final narrative pressure
- present entry actions cleanly

---

## Integrated learnings

These are the durable points we should actively integrate from the latest
flagship direction work.

### 1. The flagship must become evidence, not presentation

Variants can remain expressive and conceptual.

The flagship should feel like:

- system activation
- interrogation
- forced alignment
- declaration of canonical truth

Working sentence:

> The user is not browsing.
> The user is being measured by the system.

### 2. Hero is strongest as accusation, not monument

The opening should not behave like a generic editorial showcase.

Preferred hero language:

- `SYSTEM ACTIVE`
- `UNVERIFIED INPUT DETECTED`
- `UNVERIFIED INPUT`
- `PROVE IT`

This is stronger than a purely aesthetic black-and-white opening.

Current implementation note:

- the hero now leads with system judgment, minimal explanation, and stronger
  whitespace discipline; it should not drift back toward presentation language

### 3. Doctrine is strongest when executed as validation

Doctrine should be treated as system checks, not a passive list of principles.

Preferred interrogation pattern:

- `CHECK_001: ORIGIN VERIFIED?`
- `CHECK_002: CAUSAL LINK PRESENT?`
- `CHECK_003: STATE CONSISTENCY MAINTAINED?`
- `CHECK_004: CROSS-ENTITY CONTINUITY PRESERVED?`

Preferred machine results:

- `FAIL`
- `UNKNOWN`
- `DRIFT DETECTED`
- `RECORD INVALID`

This is now the active direction for the flagship hero/doctrine work.

Current implementation note:

- the section now reads like execution and verdict; the remaining headroom is
  compression, not structural change

### 4. NexusCanon must feel like pressure, not explanation

The chamber is strongest when it behaves like:

- suspended fragments
- forced convergence
- vertical compression
- lock

It should not drift back toward:

- a polished diagram
- a premium explainer
- symmetric decorative layout

Current implementation note:

- the chamber now behaves more like a truth collider than a diagram, but the
  final lock moment can still become more unforgettable

### 5. Motion should be restrained and scroll-linked when used

The strongest motion direction is:

- slow
- architectural
- reduced-motion aware
- lightly scroll-linked in hero or canon sections

Avoid global theatrics, cursor gimmicks, or constant ambient animation.

### 6. Visual law should stay almost monochrome

Preferred system:

- `95%` black / white
- minimal state accent only if functionally necessary
- borders, rails, telemetry, and negative space over decorative polish

### 7. The flagship should feel unavoidable, not cool

Decision rule:

- if it feels "cool", it is probably too soft
- if it feels "unavoidable", it is probably correct

---

## Target flagship architecture

This is the intended section model.

```text
AfendaFlagshipPage
├── FlagshipAmbientLayer
├── TopTelemetryRail
├── HeroSystemActivation
├── InterrogationSection
├── NexusCanonSection
├── FailureModesSection
└── CTAReckoningSection
```

### Section responsibilities

| Section              | Responsibility                                                                      |
| -------------------- | ----------------------------------------------------------------------------------- |
| HeroSystemActivation | Establish cold system activation and distrust of unverified input                   |
| InterrogationSection | Execute doctrine as interrogation and validation                                    |
| NexusCanonSection    | Provide one controlled cinematic pressure chamber with mechanical inevitability     |
| FailureModesSection  | Show failure pressure, ordinary-system collapse, and AFENDA’s evidentiary advantage |
| CTAReckoningSection  | Deliver final conversion pressure without softening the system voice                |

---

## Build phases

The flagship should be built in this order.

### Phase 1

- Hero
- Doctrine
- CTA

Refined rule:

- Hero should read as `System Activation`
- Doctrine should read as `Interrogation`
- CTA may remain present, but authority must come before invitation

This phase must already feel useful and canonical without advanced motion.

**Current status:** mostly implemented, but CTA copy/tension still needs final polish.

### Phase 2

- NexusCanon
- Failure modes

This is where the flagship stops being accusation-only and becomes a serious
enterprise-grade evidentiary surface.

**Current status:** implemented.

### Phase 3

- typography and spacing compression
- motion refinement
- final QA hardening

This phase is for tightening inevitability across the whole page, not adding
more spectacle.

---

## Motion policy

### Allowed

- slow opacity shifts
- subtle scale
- sticky transitions
- restrained parallax
- one cinematic section
- restrained scroll-linked movement where it increases authority

### Forbidden

- full-page cursor theatrics
- multiple competing overlays
- violent text splitting
- motion that interrupts reading order
- fake terminal gimmicks
- cinematic overload across the entire page

### Rule

The flagship must be calmer than the variants.

If a motion treatment makes the page feel more like an experiment than a canon,
it is wrong for the flagship.

---

## Remaining work

The remaining `18%` should be treated as these workstreams:

| Workstream                   | Remaining | Outcome                                                                                    |
| ---------------------------- | --------- | ------------------------------------------------------------------------------------------ |
| Copy compression             | `5%`      | remove remaining explanatory drag so every section reads harder and cleaner                |
| Typography and spacing law   | `4%`      | make the page feel like one authored object instead of a stack of strong sections          |
| Canon lock moment            | `3%`      | strengthen the final sense of convergence without violating the one-cinematic-chamber rule |
| Motion calibration           | `3%`      | tighten hero and chamber pacing so movement feels heavier and less decorative              |
| Responsive polish            | `2%`      | better tablet/mobile pacing, rail balance, and chamber density                             |
| Accessibility + QA hardening | `1%`      | reduced-motion, semantics, final checks                                                    |

### Immediate next wave

The next implementation wave should target only:

1. `HeroSystemActivation`
2. `NexusCanonSection`
3. page-wide typography and spacing compression

Execution constraint:

- do not broaden the page structure
- do not add new sections
- do not add product screenshots, feature grids, or generic SaaS patterns
- refine compression and inevitability before adding more technical spectacle

Target result for this wave:

- the hero should read as system judgment with almost no explanatory drag
- NexusCanon should feel more like a pressure chamber than a diagram
- the whole page should feel authored end-to-end rather than assembled section by section

---

## Definition of done

The flagship is not done when the route works.

The flagship is done when all of these are true:

1. `/` feels clearly more canonical than any variant
2. the hero reads like system activation, not poster design
3. doctrine reads like interrogation and validation, not decorative copy
4. NexusCanon feels like the one controlled cinematic pressure chamber
5. failure modes feel enterprise-grade and defensible
6. motion is present but restrained
7. NexusCanon is the only cinematic chamber
8. the CTA close is strong without becoming theatrical noise
9. desktop and mobile both feel intentional
10. reduced-motion users still get a coherent page

### Definition of done for the next wave only

The next wave is done when all of these are true:

1. the hero reads as system judgment with almost no explanatory drag
2. NexusCanon feels more like a pressure chamber than a diagram
3. the page rhythm feels authored end-to-end rather than assembled
4. the current doctrine and failure-mode direction remains intact
5. no new sections are needed to make the page feel stronger

---

## File ownership

### Primary implementation files

- [`pages/landing/flagship/afenda-flagship-page.tsx`](./pages/landing/flagship/afenda-flagship-page.tsx)
- [`marketing.css`](./marketing.css)

### Supporting runtime files

- [`marketing.config.ts`](./marketing.config.ts)
- [`marketing-routes.tsx`](./marketing-routes.tsx)

### Current test coverage

- [`__tests__/afenda-flagship-page.test.tsx`](./__tests__/afenda-flagship-page.test.tsx)
- [`__tests__/marketing-routes.test.tsx`](./__tests__/marketing-routes.test.tsx)
- [`__tests__/marketing.config.test.ts`](./__tests__/marketing.config.test.ts)
- [`../routes/__tests__/route-marketing-parity.test.ts`](../routes/__tests__/route-marketing-parity.test.ts)

---

## Working rule

When discussing changes, prefer this sentence structure:

- "This improves the canon."
- "This belongs to a variant, not the flagship."
- "This strengthens doctrine."
- "This strengthens proof."
- "This should be the one cinematic chamber."
- "This belongs to phase 2, not phase 3."
- "This is scaffold language and still needs pressure."

Avoid vague language like:

- "make it cooler"
- "more futuristic"
- "more intense"
- "more crazy"

The flagship should be judged by authority, doctrine, proof, and control.
