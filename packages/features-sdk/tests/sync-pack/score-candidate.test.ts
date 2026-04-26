import { describe, expect, it } from "vitest"

import {
  createSyncPackRankingReportRow,
  getTechStackForCategory,
  scoreCandidate,
  type AppCandidate,
} from "../../src/index.js"

function candidate(overrides: Partial<AppCandidate> = {}): AppCandidate {
  return {
    id: "bookmark-manager",
    name: "Bookmark Manager",
    source: "openalternative",
    sourceUrl: "https://openalternative.co/categories",
    sourceCategory: "Productivity & Utilities",
    internalCategory: "productivity-utilities",
    lane: "operate",
    priority: "good-to-have",
    buildMode: "inspire",
    internalUseCase:
      "Provide a personal bookmark organizer for internal users.",
    openSourceReferences: ["https://openalternative.co/categories"],
    licenseReviewRequired: false,
    securityReviewRequired: false,
    dataSensitivity: "low",
    ownerTeam: "Workspace Tools",
    status: "candidate",
    ...overrides,
  }
}

describe("scoreCandidate", () => {
  it("is deterministic for a critical candidate", () => {
    const result = scoreCandidate(
      candidate({
        id: "iam-sso-audit",
        name: "IAM SSO Audit",
        internalCategory: "security-privacy",
        lane: "platform",
        priority: "critical",
        buildMode: "adapt",
        internalUseCase:
          "Provide IAM, SSO, access review, security audit, and compliance evidence.",
        licenseReviewRequired: true,
        securityReviewRequired: true,
        dataSensitivity: "high",
      })
    )

    expect(result.recommendedPriority).toBe("critical")
    expect(result.declaredPriorityMatchesRecommendation).toBe(true)
  })

  it("is deterministic for an essential candidate", () => {
    const result = scoreCandidate(
      candidate({
        id: "knowledge-workflow",
        name: "Knowledge Workflow",
        priority: "essential",
        buildMode: "adapt",
        internalUseCase:
          "Provide knowledge base workflow automation and team handoff tracking.",
        dataSensitivity: "medium",
      })
    )

    expect(result.recommendedPriority).toBe("essential")
    expect(result.declaredPriorityMatchesRecommendation).toBe(true)
  })

  it("is deterministic for a good-to-have candidate", () => {
    const result = scoreCandidate(candidate())

    expect(result.recommendedPriority).toBe("good-to-have")
    expect(result.declaredPriorityMatchesRecommendation).toBe(true)
  })

  it("builds a decision-oriented ranking row", () => {
    const criticalCandidate = candidate({
      id: "iam-sso-audit",
      name: "IAM SSO Audit",
      internalCategory: "security-privacy",
      lane: "platform",
      priority: "critical",
      buildMode: "adapt",
      internalUseCase:
        "Provide IAM, SSO, access review, security audit, and compliance evidence.",
      licenseReviewRequired: true,
      securityReviewRequired: true,
      dataSensitivity: "high",
      status: "approved",
    })
    const result = scoreCandidate(criticalCandidate)
    const ranking = createSyncPackRankingReportRow(criticalCandidate, result)

    expect(ranking.confidence).toBe("high")
    expect(ranking.likelyImplementationSurfaces).toContain("apps/web")
    expect(ranking.likelyImplementationSurfaces).toContain("apps/api")
    expect(ranking.requiredValidation).toContain(
      "Complete security review before implementation starts."
    )
  })
})

describe("getTechStackForCategory", () => {
  it("returns the default stack and category override", () => {
    const recommendation = getTechStackForCategory("communication-ai-ml")

    expect(recommendation.defaultStack.frontend).toContain(
      "React + Vite + TypeScript"
    )
    expect(recommendation.defaultStack.backend).toContain(
      "Hono as the default API framework"
    )
    expect(recommendation.categoryOverride).toContain("Provider abstraction")
    expect(recommendation.categoryOverride).toContain("Eval notes")
  })
})
