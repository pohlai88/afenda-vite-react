import type { RepoGuardFinding } from "./repo-guard.js"

export interface RepoGuardWaiver {
  readonly id: string
  readonly checkKey: string
  readonly ruleId: string
  readonly pathPattern: string
  readonly severityCap: RepoGuardFinding["severity"]
  readonly reason: string
  readonly owner: string
  readonly approvedBy: string
  readonly createdAt: string
  readonly expiresOn: string
}

export interface RepoGuardWaiverRegistry {
  readonly version: number
  readonly waivers: readonly RepoGuardWaiver[]
}

export interface RepoGuardWaiverViolation {
  readonly waiverId: string
  readonly severity: "warn" | "error"
  readonly message: string
}

export interface RepoGuardWaiverSoonToExpire {
  readonly waiverId: string
  readonly checkKey: string
  readonly ruleId: string
  readonly pathPattern: string
  readonly expiresOn: string
}

export interface RepoGuardWaiverReport {
  readonly generatedAt: string
  readonly registryPath: string
  readonly waiverCount: number
  readonly activeWaiverCount: number
  readonly expiredWaiverCount: number
  readonly soonToExpireCount: number
  readonly valid: boolean
  readonly violations: readonly RepoGuardWaiverViolation[]
  readonly soonToExpireWaivers: readonly RepoGuardWaiverSoonToExpire[]
  readonly applicableWaivers: readonly RepoGuardWaiver[]
}
