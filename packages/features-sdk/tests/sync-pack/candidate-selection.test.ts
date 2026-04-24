import { describe, expect, it } from "vitest"

import {
  describeCandidateSelection,
  filterCandidates,
  generateCandidateReport,
  hasCandidateSelection,
  type AppCandidate,
} from "../../src/index.js"

const candidates = [
  {
    id: "internal-support-crm",
    name: "Internal Support CRM",
    source: "openalternative",
    sourceUrl: "https://openalternative.co/business-saas",
    sourceCategory: "Business Software",
    internalCategory: "business-saas",
    lane: "operate",
    priority: "critical",
    buildMode: "adapt",
    internalUseCase: "Support and customer-operations workspace.",
    openSourceReferences: ["https://openalternative.co/business-saas"],
    licenseReviewRequired: true,
    securityReviewRequired: true,
    dataSensitivity: "high",
    ownerTeam: "Operations Platform",
    status: "approved",
  },
  {
    id: "internal-app-builder-sandbox",
    name: "Internal App Builder Sandbox",
    source: "openalternative",
    sourceUrl: "https://openalternative.co/developer-tools",
    sourceCategory: "Developer Tools",
    internalCategory: "mini-developer",
    lane: "platform",
    priority: "essential",
    buildMode: "inspire",
    internalUseCase: "Governed internal builder workflow.",
    openSourceReferences: ["https://openalternative.co/developer-tools"],
    licenseReviewRequired: false,
    securityReviewRequired: true,
    dataSensitivity: "medium",
    ownerTeam: "Developer Platform",
    status: "candidate",
  },
  {
    id: "knowledge-workflow-hub",
    name: "Knowledge Workflow Hub",
    source: "openalternative",
    sourceUrl: "https://openalternative.co/productivity",
    sourceCategory: "Productivity",
    internalCategory: "productivity-utilities",
    lane: "operate",
    priority: "essential",
    buildMode: "adopt",
    internalUseCase: "Knowledge and productivity workflows.",
    openSourceReferences: ["https://openalternative.co/productivity"],
    licenseReviewRequired: true,
    securityReviewRequired: false,
    dataSensitivity: "medium",
    ownerTeam: "Operations Platform",
    status: "approved",
  },
] as const satisfies readonly AppCandidate[]

describe("candidate selection", () => {
  it("filters candidates by category, lane, owner, and pack selectors", () => {
    expect(
      filterCandidates(candidates, {
        category: "business-saas",
      }).map((candidate) => candidate.id)
    ).toEqual(["internal-support-crm"])

    expect(
      filterCandidates(candidates, {
        lane: "platform",
      }).map((candidate) => candidate.id)
    ).toEqual(["internal-app-builder-sandbox"])

    expect(
      filterCandidates(candidates, {
        owner: "operations platform",
      }).map((candidate) => candidate.id)
    ).toEqual(["internal-support-crm", "knowledge-workflow-hub"])

    expect(
      filterCandidates(candidates, {
        pack: "mini-developer/internal-app-builder-sandbox",
      }).map((candidate) => candidate.id)
    ).toEqual(["internal-app-builder-sandbox"])
  })

  it("describes and detects active selection filters", () => {
    expect(hasCandidateSelection({})).toBe(false)
    expect(
      describeCandidateSelection({
        lane: "operate",
        owner: "Operations Platform",
      })
    ).toEqual(["lane=operate", "owner=Operations Platform"])
  })
})

describe("candidate report filtering", () => {
  it("renders filtered report totals and selection summary", () => {
    const report = generateCandidateReport(candidates, {
      filters: {
        owner: "Operations Platform",
      },
    })

    expect(report).toContain("Selected candidates: 2 of 3")
    expect(report).toContain("Applied filters: owner=Operations Platform")
    expect(report).toContain("| internal-support-crm |")
    expect(report).not.toContain("| internal-app-builder-sandbox |")
  })
})
