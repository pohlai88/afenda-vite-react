import type { AdminTier } from "./contracts"

const basicModules = ["hrm-basic", "crm-basic", "pm", "excel-ai"] as const
const proModules = [
  ...basicModules,
  "mrp",
  "otb",
  "accounting-vas",
  "tpm",
] as const
const enterpriseModules = [
  ...proModules,
  "ai-copilot",
  "accounting-ifrs",
  "ecommerce",
  "custom-sdk",
] as const

export function getModulesForTier(tier: AdminTier): readonly string[] {
  switch (tier) {
    case "enterprise":
      return enterpriseModules
    case "pro":
      return proModules
    default:
      return basicModules
  }
}
