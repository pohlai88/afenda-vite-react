import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import assert from "node:assert/strict"
import test from "node:test"

import type { FileSurvivalRolloutDefinition } from "../afenda-config.js"
import { FILE_SURVIVAL_ROLE_PRECEDENCE } from "../afenda-config.js"
import {
  generateFileSurvivalReport,
  renderFileSurvivalHtmlPreview,
  renderFileSurvivalMarkdownReport,
} from "./file-survival-governance.js"

test("classifies marketing file-survival scenarios from doctrine and evidence", () => {
  const fixture = createFixtureRepo({
    "apps/web/src/marketing/marketing-page-registry.ts": `
export const marketingPageRegistry = {
  about: () => import("./pages/company/about/page"),
  truth: () => import("./pages/product/truth-engine-page"),
  privacy: () => import("./pages/legal/privacy-policy-page"),
}
`,
    "apps/web/src/marketing/marketing-routes.tsx": `
import { marketingPageRegistry } from "./marketing-page-registry"

export const marketingRoutes = marketingPageRegistry
`,
    "apps/web/src/marketing/marketing-layout.tsx": `
import "./marketing.css"

export function MarketingLayout() {
  return null
}
`,
    "apps/web/src/marketing/marketing-theme-provider.tsx": `
export function MarketingThemeProvider() {
  return null
}
`,
    "apps/web/src/marketing/marketing.config.ts": `
export const marketingConfig = { locale: "en" }
`,
    "apps/web/src/marketing/marketing-configured-home.tsx": `
export function MarketingConfiguredHome() {
  return null
}
`,
    "apps/web/src/marketing/marketing-random-home.tsx": `
export function MarketingRandomHome() {
  return null
}
`,
    "apps/web/src/marketing/marketing-loading-fallback.tsx": `
export function MarketingLoadingFallback() {
  return null
}
`,
    "apps/web/src/marketing/components/index.ts": `
export { SharedCard } from "./shared-card"
`,
    "apps/web/src/marketing/components/shared-card.tsx": `
export function SharedCard() {
  return <aside>Shared card</aside>
}
`,
    "apps/web/src/marketing/pages/company/about/page.tsx": `
import { SharedCard } from "@/marketing/components"
import { aboutContent } from "./content"
import { aboutEditorial } from "./about-page-editorial"
import AboutHero from "./section-01-hero"
import AboutSectionBody from "./section-02-body"
import mysteryValue from "./mystery"

export default function AboutPage() {
  return (
    <main data-title={aboutContent.title} data-annotation={aboutEditorial.annotation}>
      <AboutHero />
      <AboutSectionBody />
      <SharedCard />
      <div>{mysteryValue}</div>
    </main>
  )
}
`,
    "apps/web/src/marketing/pages/company/about/content.ts": `
export const aboutContent = {
  title: "About",
  eyebrow: "Doctrine first",
}
`,
    "apps/web/src/marketing/pages/company/about/about-page-editorial.ts": `
export const aboutEditorial = {
  annotation: "Route-owned editorial boundary",
}
`,
    "apps/web/src/marketing/pages/company/about/page-motion.ts": `
export const aboutMotionDelay = 0.08
`,
    "apps/web/src/marketing/pages/company/about/section-01-hero.tsx": `
import { aboutMotionDelay } from "./page-motion"

const heroClaims = ["proof", "continuity", "scope"]

function renderHeroClaims() {
  return heroClaims.map((claim) => <li key={claim}>{claim}</li>)
}

export default function AboutHero() {
  return (
    <section data-delay={aboutMotionDelay}>
      <h1>About</h1>
      <ul>{renderHeroClaims()}</ul>
    </section>
  )
}
`,
    "apps/web/src/marketing/pages/company/about/section-02-body.tsx": `
import { aboutMotionDelay } from "./page-motion"

const proofPoints = ["lineage", "clarity", "ownership"]

function renderProofPoints() {
  return proofPoints.map((item) => <li key={item}>{item}</li>)
}

export default function AboutSectionBody() {
  return (
    <section data-delay={aboutMotionDelay}>
      <h2>Evidence</h2>
      <ul>{renderProofPoints()}</ul>
    </section>
  )
}
`,
    "apps/web/src/marketing/pages/company/about/section-03-wrapper.tsx": `
import AboutSectionBody from "./section-02-body"

export default function AboutSectionWrapper() {
  return <AboutSectionBody />
}
`,
    "apps/web/src/marketing/pages/company/about/section-04-re-export.tsx": `
export { default } from "./section-02-body"
`,
    "apps/web/src/marketing/pages/company/about/section-05-orphan.tsx": `
export default function AboutOrphanSection() {
  return <section>Orphan</section>
}
`,
    "apps/web/src/marketing/pages/company/about/mystery.ts": `
const mysteryValue = "mystery"
export default mysteryValue
`,
    "apps/web/src/marketing/pages/company/about/orphan.ts": `
export const orphanValue = "orphan"
`,
    "apps/web/src/marketing/marketing-unknown.ts": `
export const marketingUnknown = "runtime mystery"
`,
    "apps/web/src/marketing/pages/product/truth-engine-view.tsx": `
export default function TruthEngineView() {
  return <main>Truth engine</main>
}
`,
    "apps/web/src/marketing/pages/product/truth-engine-page.tsx": `
import TruthEngineView from "./truth-engine-view"

export default function TruthEnginePage() {
  return <TruthEngineView />
}
`,
    "apps/web/src/marketing/pages/legal/privacy-policy-body.tsx": `
export default function PrivacyPolicyBody() {
  return <article>Privacy policy</article>
}
`,
    "apps/web/src/marketing/pages/legal/privacy-policy-page.tsx": `
import { Suspense, lazy } from "react"

const PrivacyPolicyBody = lazy(() => import("./privacy-policy-body"))

export default function PrivacyPolicyPage() {
  return (
    <Suspense fallback={null}>
      <PrivacyPolicyBody />
    </Suspense>
  )
}
`,
  })

  try {
    const report = generateFileSurvivalReport(
      createMarketingRollout(),
      buildFixtureOptions(fixture)
    )

    assert.equal(
      findFinding(
        report,
        "apps/web/src/marketing/pages/company/about/section-04-re-export.tsx"
      )?.category,
      "wrapper"
    )
    assert.equal(
      findFinding(
        report,
        "apps/web/src/marketing/pages/company/about/section-03-wrapper.tsx"
      )?.category,
      "wrapper"
    )
    assert.equal(
      findFinding(report, "apps/web/src/marketing/components/shared-card.tsx")
        ?.category,
      "shared-single-use"
    )
    assert.equal(
      findFinding(
        report,
        "apps/web/src/marketing/pages/company/about/section-05-orphan.tsx"
      )?.category,
      "dead"
    )
    assert.equal(
      findFinding(
        report,
        "apps/web/src/marketing/pages/company/about/mystery.ts"
      )?.category,
      "unknown-role-consumed"
    )
    assert.equal(
      findFinding(
        report,
        "apps/web/src/marketing/pages/company/about/orphan.ts"
      )?.category,
      "unknown-role-unconsumed"
    )
    assert.equal(
      findFinding(report, "apps/web/src/marketing/marketing-unknown.ts")
        ?.category,
      "unknown-role-protected-scope"
    )
    assert.equal(
      findFinding(report, "apps/web/src/marketing/pages/company/ghost")
        ?.category,
      "empty-folder"
    )

    assert.equal(
      findFinding(
        report,
        "apps/web/src/marketing/pages/product/truth-engine-page.tsx"
      ),
      undefined
    )
    assert.equal(
      findFinding(
        report,
        "apps/web/src/marketing/pages/legal/privacy-policy-page.tsx"
      ),
      undefined
    )
    assert.equal(
      findFinding(
        report,
        "apps/web/src/marketing/pages/company/about/page.tsx"
      ),
      undefined
    )
    assert.equal(
      findFinding(
        report,
        "apps/web/src/marketing/pages/company/about/content.ts"
      ),
      undefined
    )
    assert.equal(
      findFinding(
        report,
        "apps/web/src/marketing/pages/company/about/about-page-editorial.ts"
      ),
      undefined
    )
    assert.equal(
      findFinding(
        report,
        "apps/web/src/marketing/pages/company/about/page-motion.ts"
      ),
      undefined
    )
    assert.equal(
      findFinding(report, "apps/web/src/marketing/marketing-layout.tsx"),
      undefined
    )
    assert.equal(
      findFinding(report, "apps/web/src/marketing/components/index.ts"),
      undefined
    )

    const wrapperFinding = findFinding(
      report,
      "apps/web/src/marketing/pages/company/about/section-04-re-export.tsx"
    )
    assert.equal(wrapperFinding?.ciBlocking, true)
    assert.equal(wrapperFinding?.owner, "marketing-route:company")
    assert.equal(wrapperFinding?.ownerSource, "config")
    const sharedSingleUseFinding = findFinding(
      report,
      "apps/web/src/marketing/components/shared-card.tsx"
    )
    assert.equal(sharedSingleUseFinding?.owner, "marketing-shared-surface")
    assert.equal(sharedSingleUseFinding?.ownerSource, "config")
    assert.equal(sharedSingleUseFinding?.severity, "error")
    assert.equal(sharedSingleUseFinding?.ciBlocking, true)
    const protectedUnknownFinding = findFinding(
      report,
      "apps/web/src/marketing/marketing-unknown.ts"
    )
    assert.equal(protectedUnknownFinding?.owner, "marketing-runtime")
    assert.equal(protectedUnknownFinding?.ownerSource, "fallback")

    assert.equal(report.resolver.unresolvedImportCount, 0)
    assert.equal(report.resolver.ignoredAssetImportCount, 1)
    assert.equal(report.resolver.integrityStatus, "ok")
    assert.equal(report.reportTrust, "trusted")
    assert.equal(report.rolloutStatus, "blocked")
    assert.equal(report.ownerCoverage.configOwnedCount, 25)
    assert.equal(report.ownerCoverage.fallbackOwnedCount, 1)
    assert.deepEqual(report.ownerCoverage.fallbackOwnedPaths, [
      "apps/web/src/marketing/marketing-unknown.ts",
    ])
    assert.equal(
      report.ownerAccountability[0]?.owner,
      "marketing-route:company"
    )
    assert.equal(report.ownerAccountability[0]?.blockingFindingCount, 3)
  } finally {
    cleanupFixtureRepo(fixture)
  }
})

test("degraded trust suppresses blocking outside protected scopes", () => {
  const fixture = createFixtureRepo({
    "apps/web/src/marketing/marketing-page-registry.ts": `
export const marketingPageRegistry = {
  about: () => import("./pages/company/about/page"),
}
`,
    "apps/web/src/marketing/marketing-routes.tsx": `
import { marketingPageRegistry } from "./marketing-page-registry"

export const marketingRoutes = marketingPageRegistry
`,
    "apps/web/src/marketing/marketing-layout.tsx": `
export function MarketingLayout() {
  return null
}
`,
    "apps/web/src/marketing/marketing-theme-provider.tsx": `
export function MarketingThemeProvider() {
  return null
}
`,
    "apps/web/src/marketing/marketing.config.ts": `
export const marketingConfig = { locale: "en" }
`,
    "apps/web/src/marketing/marketing-configured-home.tsx": `
export function MarketingConfiguredHome() {
  return null
}
`,
    "apps/web/src/marketing/marketing-random-home.tsx": `
export function MarketingRandomHome() {
  return null
}
`,
    "apps/web/src/marketing/marketing-loading-fallback.tsx": `
export function MarketingLoadingFallback() {
  return null
}
`,
    "apps/web/src/marketing/pages/company/about/page.tsx": `
import "./missing-side-effect"
import AboutSectionWrapper from "./section-03-wrapper"

export default function AboutPage() {
  return <AboutSectionWrapper />
}
`,
    "apps/web/src/marketing/pages/company/about/section-02-body.tsx": `
export default function AboutSectionBody() {
  return <section>Body</section>
}
`,
    "apps/web/src/marketing/pages/company/about/section-03-wrapper.tsx": `
import AboutSectionBody from "./section-02-body"

export default function AboutSectionWrapper() {
  return <AboutSectionBody />
}
`,
  })

  try {
    const report = generateFileSurvivalReport(
      {
        ...createMarketingRollout(),
        resolverUnresolvedWarningThreshold: 0,
      },
      buildFixtureOptions(fixture)
    )

    const wrapperFinding = findFinding(
      report,
      "apps/web/src/marketing/pages/company/about/section-03-wrapper.tsx"
    )

    assert.equal(report.reportTrust, "degraded")
    assert.equal(report.rolloutStatus, "review")
    assert.equal(report.resolver.integrityStatus, "degraded")
    assert.equal(wrapperFinding?.ciBlocking, false)
  } finally {
    cleanupFixtureRepo(fixture)
  }
})

test("reports are deterministic for a fixed timestamp and include doctrine sections", () => {
  const fixture = createFixtureRepo({
    "apps/web/src/marketing/marketing-page-registry.ts": `
export const marketingPageRegistry = {
  about: () => import("./pages/company/about/page"),
}
`,
    "apps/web/src/marketing/marketing-routes.tsx": `
import { marketingPageRegistry } from "./marketing-page-registry"

export const marketingRoutes = marketingPageRegistry
`,
    "apps/web/src/marketing/marketing-layout.tsx": `
export function MarketingLayout() {
  return null
}
`,
    "apps/web/src/marketing/marketing-theme-provider.tsx": `
export function MarketingThemeProvider() {
  return null
}
`,
    "apps/web/src/marketing/marketing.config.ts": `
export const marketingConfig = { locale: "en" }
`,
    "apps/web/src/marketing/marketing-configured-home.tsx": `
export function MarketingConfiguredHome() {
  return null
}
`,
    "apps/web/src/marketing/marketing-random-home.tsx": `
export function MarketingRandomHome() {
  return null
}
`,
    "apps/web/src/marketing/marketing-loading-fallback.tsx": `
export function MarketingLoadingFallback() {
  return null
}
`,
    "apps/web/src/marketing/pages/company/about/page.tsx": `
export default function AboutPage() {
  return <main>About</main>
}
`,
    "apps/web/src/marketing/pages/company/about/ghost.ts": `
export const ghost = "ghost"
`,
  })

  const generatedAt = new Date("2026-04-22T00:00:00.000Z")

  try {
    const left = generateFileSurvivalReport(
      createMarketingRollout(),
      buildFixtureOptions(fixture, generatedAt)
    )
    const right = generateFileSurvivalReport(
      createMarketingRollout(),
      buildFixtureOptions(fixture, generatedAt)
    )

    assert.equal(JSON.stringify(left, null, 2), JSON.stringify(right, null, 2))

    const markdown = renderFileSurvivalMarkdownReport(left)
    const html = renderFileSurvivalHtmlPreview(left)
    assert.match(markdown, /## High-confidence Delete Candidates/u)
    assert.match(markdown, /## Release Control/u)
    assert.match(markdown, /## Remediation Matrix/u)
    assert.match(markdown, /## Owner Accountability Queue/u)
    assert.match(markdown, /## Unknown-role In Protected Scopes/u)
    assert.match(markdown, /## Unknown-role Without Consumers/u)
    assert.match(markdown, /## Appendix/u)
    assert.match(html, /Verdict first\. Lineage second\./u)
    assert.match(html, /Governance Verdict/u)
    assert.match(html, /Who must act/u)
    assert.match(html, /action-toolbar/u)
    assert.match(html, /owner-toolbar/u)
    assert.match(html, /all owners/u)
    assert.match(html, /blocking only/u)
    assert.match(html, /release-strip/u)
    assert.match(html, /How to fix/u)
    assert.match(html, /Why This Is Illegal Or Suspicious/u)
    assert.match(html, /Rollout Status/u)
    assert.match(html, /finding-list/u)
  } finally {
    cleanupFixtureRepo(fixture)
  }
})

function createMarketingRollout(): FileSurvivalRolloutDefinition {
  return {
    id: "marketing",
    scopeRoot: "apps/web/src/marketing",
    sharedRoots: ["apps/web/src/marketing/components"],
    runtimeOwners: [
      "apps/web/src/marketing/marketing-layout.tsx",
      "apps/web/src/marketing/marketing-routes.tsx",
      "apps/web/src/marketing/marketing-page-registry.ts",
      "apps/web/src/marketing/marketing-theme-provider.tsx",
      "apps/web/src/marketing/marketing.config.ts",
      "apps/web/src/marketing/marketing-configured-home.tsx",
      "apps/web/src/marketing/marketing-random-home.tsx",
      "apps/web/src/marketing/marketing-loading-fallback.tsx",
    ],
    rolePatterns: {
      routeOwner: ["**/page.tsx", "**/*-page.tsx"],
      contentOwner: ["**/content.ts", "**/*-editorial.ts", "**/*.config.ts"],
      pageLocalComposition: [
        "**/*hero*.tsx",
        "**/*section*.tsx",
        "**/*wrapper*.tsx",
        "**/*body*.tsx",
        "**/*motion.ts",
      ],
    },
    ignore: [
      "**/__tests__/**",
      "**/*.css",
      "**/*.generated.*",
      "**/dist/**",
      "**/build/**",
    ],
    reviewedExceptions: [],
    protectedScopes: [
      {
        id: "marketing-runtime",
        roots: [
          "apps/web/src/marketing/marketing-layout.tsx",
          "apps/web/src/marketing/marketing-routes.tsx",
          "apps/web/src/marketing/marketing-page-registry.ts",
          "apps/web/src/marketing/marketing-theme-provider.tsx",
          "apps/web/src/marketing/marketing.config.ts",
          "apps/web/src/marketing/marketing-configured-home.tsx",
          "apps/web/src/marketing/marketing-random-home.tsx",
          "apps/web/src/marketing/marketing-loading-fallback.tsx",
          "apps/web/src/marketing/marketing-unknown.ts",
        ],
      },
      {
        id: "marketing-shared-surface",
        roots: ["apps/web/src/marketing/components"],
      },
    ],
    ownerTruth: [
      {
        root: "apps/web/src/marketing/components",
        owner: "marketing-shared-surface",
      },
      {
        root: "apps/web/src/marketing/pages/company",
        owner: "marketing-route:company",
      },
      {
        root: "apps/web/src/marketing/pages/product",
        owner: "marketing-route:product",
      },
      {
        root: "apps/web/src/marketing/pages/legal",
        owner: "marketing-route:legal",
      },
      {
        root: "apps/web/src/marketing/marketing-layout.tsx",
        owner: "marketing-runtime",
      },
      {
        root: "apps/web/src/marketing/marketing-routes.tsx",
        owner: "marketing-runtime",
      },
      {
        root: "apps/web/src/marketing/marketing-page-registry.ts",
        owner: "marketing-runtime",
      },
      {
        root: "apps/web/src/marketing/marketing-theme-provider.tsx",
        owner: "marketing-runtime",
      },
      {
        root: "apps/web/src/marketing/marketing.config.ts",
        owner: "marketing-runtime",
      },
      {
        root: "apps/web/src/marketing/marketing-configured-home.tsx",
        owner: "marketing-runtime",
      },
      {
        root: "apps/web/src/marketing/marketing-random-home.tsx",
        owner: "marketing-runtime",
      },
      {
        root: "apps/web/src/marketing/marketing-loading-fallback.tsx",
        owner: "marketing-runtime",
      },
    ],
    blockingPolicy: {
      rolloutMode: "block",
      blockingCategories: ["wrapper", "dead"],
      blockingConfidence: ["high"],
      protectedScopeBlockingCategories: [
        "unknown-role-protected-scope",
        "shared-single-use",
      ],
      protectedScopeBlockingConfidence: ["high", "medium"],
    },
    rolePrecedence: [...FILE_SURVIVAL_ROLE_PRECEDENCE],
    resolverUnresolvedWarningThreshold: 0,
  }
}

function createFixtureRepo(files: Record<string, string>): string {
  const tempRoot = mkdtempSync(
    path.join(os.tmpdir(), "file-survival-governance-")
  )

  writeFixtureFile(
    tempRoot,
    "apps/web/config/tsconfig/app.json",
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          jsx: "react-jsx",
          baseUrl: "../..",
          paths: {
            "@/*": ["src/*"],
          },
        },
        include: ["../../src/**/*.ts", "../../src/**/*.tsx"],
      },
      null,
      2
    )
  )

  mkdirSync(path.join(tempRoot, "apps/web/src/marketing/pages/company/ghost"), {
    recursive: true,
  })

  for (const [filePath, content] of Object.entries(files)) {
    writeFixtureFile(tempRoot, filePath, content)
  }

  return tempRoot
}

function writeFixtureFile(repoRoot: string, filePath: string, content: string) {
  const absolutePath = path.join(repoRoot, filePath)
  mkdirSync(path.dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, `${content.trim()}\n`, "utf8")
}

function cleanupFixtureRepo(repoRoot: string) {
  rmSync(repoRoot, { recursive: true, force: true })
}

function buildFixtureOptions(repoRoot: string, generatedAt?: Date) {
  return {
    repoRoot,
    generatedAt,
    typescriptConfigPath: path.join(
      repoRoot,
      "apps/web/config/tsconfig/app.json"
    ),
  }
}

function findFinding(
  report: ReturnType<typeof generateFileSurvivalReport>,
  targetPath: string
) {
  return report.findings.find((finding) => finding.path === targetPath)
}
