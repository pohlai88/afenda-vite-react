import type {
  AfendaConfig,
  GovernanceEnforcementMaturity,
  GovernanceLifecycleStatus,
} from "../afenda-config.js"

export interface ParsedAtcContract {
  readonly contractId?: string
  readonly domainId?: string
  readonly decisionAnchor?: string
  readonly lifecycleStatus?: GovernanceLifecycleStatus
  readonly enforcementMaturity?: GovernanceEnforcementMaturity
  readonly evidencePath?: string
  readonly checkCommand?: string
  readonly reportCommand?: string
  readonly placeholderContract: boolean
}

export function parseAtcContract(content: string): ParsedAtcContract {
  const contractId = content.match(
    /- \*\*Contract ID:\*\*\s*(ATC-(?:[0-9]{4}|XXXX))/u
  )?.[1]
  const domainId = content.match(
    /- \*\*Bound domain ID:\*\*\s*(GOV-[A-Z-]+-(?:[0-9]{3}|XXXX))/u
  )?.[1]
  const decisionAnchor = content.match(
    /- \*\*Decision anchor:\*\*\s*(ADR-(?:[0-9]{4}|XXXX))/u
  )?.[1]
  const lifecycleStatus = content.match(
    /- \*\*Lifecycle status:\*\*\s*(watcher|bound|partial|enforced|drifted|retired)/u
  )?.[1] as GovernanceLifecycleStatus | undefined
  const enforcementMaturity = content.match(
    /- \*\*Enforcement maturity:\*\*\s*(defined|measured|warned|blocking|runtime-enforced)/u
  )?.[1] as GovernanceEnforcementMaturity | undefined
  const evidencePath = content.match(
    /- \*\*Evidence path:\*\*\s*`([^`]+)`/u
  )?.[1]
  const checkCommand = content.match(
    /- \*\*Check command:\*\*\s*`([^`]+)`/u
  )?.[1]
  const reportCommand = content.match(
    /- \*\*Report command:\*\*\s*`([^`]+)`/u
  )?.[1]

  return {
    contractId,
    domainId,
    decisionAnchor,
    lifecycleStatus,
    enforcementMaturity,
    evidencePath,
    checkCommand,
    reportCommand,
    placeholderContract:
      contractId === "ATC-XXXX" ||
      domainId === "GOV-XXXX-XXXX" ||
      decisionAnchor === "ADR-XXXX",
  }
}

export function evaluateAtcHonesty(input: {
  readonly config: AfendaConfig
  readonly relativePath: string
  readonly atc: ParsedAtcContract
  readonly knownAdrIds: ReadonlySet<string>
  readonly evidenceExists?: boolean
}): string[] {
  const issues: string[] = []
  const { config, relativePath, atc, knownAdrIds, evidenceExists } = input

  if (atc.placeholderContract) {
    return issues
  }

  if (!atc.domainId) {
    issues.push(`${relativePath} must declare a Bound domain ID.`)
    return issues
  }

  const boundDomain = config.governance.domains.find(
    (domain) => domain.id === atc.domainId
  )
  if (!boundDomain) {
    issues.push(
      `${relativePath} references unknown governance domain "${atc.domainId}".`
    )
    return issues
  }

  if (!atc.decisionAnchor) {
    issues.push(`${relativePath} must declare a Decision anchor.`)
  } else if (!knownAdrIds.has(atc.decisionAnchor)) {
    issues.push(
      `${relativePath} references missing decision anchor "${atc.decisionAnchor}".`
    )
  }

  if (!atc.evidencePath) {
    issues.push(`${relativePath} must declare an Evidence path.`)
  } else if (atc.evidencePath !== boundDomain.evidencePath) {
    issues.push(
      `${relativePath} evidence path "${atc.evidencePath}" does not match bound domain evidence path "${boundDomain.evidencePath}".`
    )
  }

  if (
    !atc.checkCommand ||
    !boundDomain.checks.some((check) => check.command === atc.checkCommand)
  ) {
    issues.push(
      `${relativePath} check command must resolve to a bound domain check command.`
    )
  }

  if (!atc.reportCommand || atc.reportCommand !== boundDomain.report.command) {
    issues.push(
      `${relativePath} report command must match the bound domain report command.`
    )
  }

  if (
    atc.enforcementMaturity &&
    maturityRank(atc.enforcementMaturity) >
      maturityRank(boundDomain.enforcementMaturity)
  ) {
    issues.push(
      `${relativePath} claims enforcement maturity "${atc.enforcementMaturity}" stronger than bound domain maturity "${boundDomain.enforcementMaturity}".`
    )
  }

  if (
    atc.lifecycleStatus &&
    lifecycleRank(atc.lifecycleStatus) >
      lifecycleRank(boundDomain.lifecycleStatus)
  ) {
    issues.push(
      `${relativePath} claims lifecycle status "${atc.lifecycleStatus}" stronger than bound domain lifecycle "${boundDomain.lifecycleStatus}".`
    )
  }

  const claimsStrongEnforcement =
    atc.lifecycleStatus === "enforced" ||
    atc.enforcementMaturity === "blocking" ||
    atc.enforcementMaturity === "runtime-enforced"

  if (claimsStrongEnforcement) {
    if (boundDomain.ciBehavior !== "block") {
      issues.push(
        `${relativePath} cannot claim strong enforcement because bound domain "${boundDomain.id}" is not configured as ciBehavior "block".`
      )
    }
    if (boundDomain.checks.length === 0) {
      issues.push(
        `${relativePath} cannot claim strong enforcement because bound domain "${boundDomain.id}" has no registered check command.`
      )
    }
    if (
      !boundDomain.evidencePath.startsWith(".artifacts/reports/governance/")
    ) {
      issues.push(
        `${relativePath} cannot claim strong enforcement because bound domain "${boundDomain.id}" evidence path is outside .artifacts/reports/governance/.`
      )
    }
    if (!boundDomain.report.command.trim()) {
      issues.push(
        `${relativePath} cannot claim strong enforcement because bound domain "${boundDomain.id}" has no registered report command.`
      )
    }
    if (evidenceExists === false) {
      issues.push(
        `${relativePath} cannot claim strong enforcement because evidence file does not exist at "${boundDomain.evidencePath}".`
      )
    }
  }

  return issues
}

function maturityRank(value: GovernanceEnforcementMaturity): number {
  if (value === "defined") {
    return 0
  }
  if (value === "measured") {
    return 1
  }
  if (value === "warned") {
    return 2
  }
  if (value === "blocking") {
    return 3
  }
  return 4
}

function lifecycleRank(value: GovernanceLifecycleStatus): number {
  if (value === "watcher") {
    return 0
  }
  if (value === "bound") {
    return 1
  }
  if (value === "partial") {
    return 2
  }
  if (value === "enforced") {
    return 3
  }
  if (value === "drifted") {
    return 2
  }
  return 0
}
