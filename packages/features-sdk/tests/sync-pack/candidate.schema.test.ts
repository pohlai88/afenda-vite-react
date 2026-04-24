import { describe, expect, it } from "vitest"

import {
  appCandidateSchema,
  featureCategories,
  getFeatureLane,
  type AppCandidate,
} from "../../src/index.js"

const validCandidate = {
  id: "iam-sso-control-plane",
  name: "IAM SSO Control Plane",
  source: "openalternative",
  sourceUrl: "https://openalternative.co/categories",
  sourceCategory: "Security & Privacy",
  internalCategory: "security-privacy",
  lane: "platform",
  priority: "critical",
  buildMode: "adapt",
  internalUseCase:
    "Provide IAM, SSO, access review, and audit evidence for internal apps.",
  openSourceReferences: ["https://openalternative.co/categories"],
  licenseReviewRequired: true,
  securityReviewRequired: true,
  dataSensitivity: "high",
  ownerTeam: "Platform Security",
  status: "candidate",
} as const satisfies AppCandidate

describe("appCandidateSchema", () => {
  it("accepts a valid candidate", () => {
    expect(appCandidateSchema.parse(validCandidate)).toEqual(validCandidate)
  })

  it.each([
    "source",
    "internalCategory",
    "priority",
    "buildMode",
    "ownerTeam",
    "status",
    "licenseReviewRequired",
    "securityReviewRequired",
    "dataSensitivity",
  ] as const)("rejects candidates missing %s", (field) => {
    const candidate = { ...validCandidate }
    delete candidate[field]

    expect(appCandidateSchema.safeParse(candidate).success).toBe(false)
  })

  it("rejects mismatched category lane mappings", () => {
    expect(
      appCandidateSchema.safeParse({
        ...validCandidate,
        internalCategory: "data-analytics",
        lane: "operate",
      }).success
    ).toBe(false)
  })
})

describe("getFeatureLane", () => {
  it("maps every category to the correct lane", () => {
    expect(
      featureCategories.map((category) => [category, getFeatureLane(category)])
    ).toMatchInlineSnapshot(`
        [
          [
            "communication-ai-ml",
            "intelligence",
          ],
          [
            "business-saas",
            "operate",
          ],
          [
            "content-publishing",
            "operate",
          ],
          [
            "data-analytics",
            "intelligence",
          ],
          [
            "infrastructure-operations",
            "platform",
          ],
          [
            "productivity-utilities",
            "operate",
          ],
          [
            "security-privacy",
            "platform",
          ],
          [
            "mini-developer",
            "platform",
          ],
        ]
      `)
  })
})
