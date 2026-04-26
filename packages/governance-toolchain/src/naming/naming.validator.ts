import type {
  NamingContract,
  NamingContractValidationOptions,
  NamingContractViolation,
} from "./naming.contract.js"

const DEFAULT_ALLOWED_SPECIAL_STEMS = new Set([
  "README",
  "ADR_TEMPLATE",
  "ATC_TEMPLATE",
])

export function validateNamingContract(
  contract: NamingContract,
  options: NamingContractValidationOptions = {}
): readonly NamingContractViolation[] {
  const violations: NamingContractViolation[] = []
  const allowedSpecialStems = new Set(
    options.allowSpecialStems ?? DEFAULT_ALLOWED_SPECIAL_STEMS
  )

  if (allowedSpecialStems.has(contract.stem)) {
    return violations
  }

  if (contract.isRoleOnly) {
    violations.push({
      severity: "error",
      rule: "role-without-subject",
      path: contract.path,
      message:
        "Governed filenames must include a subject and may not consist only of an artifact role.",
    })
    return violations
  }

  if (
    contract.primarySubject &&
    options.bannedGenericSubjects?.includes(contract.primarySubject)
  ) {
    violations.push({
      severity: "error",
      rule: "generic-name",
      path: contract.path,
      message:
        "Generic or catch-all filenames are not allowed in controlled naming domains.",
    })
  }

  const requiredRoles = contract.directoryName
    ? (options.requiredRoleByDirectoryName?.[contract.directoryName] ?? [])
    : []

  if (
    requiredRoles.length > 0 &&
    !requiredRoles.some((requiredRole) =>
      contract.roleSegments.includes(requiredRole)
    )
  ) {
    const expectedRoles = requiredRoles.map((role) => `"${role}"`).join(" or ")
    violations.push({
      severity: "error",
      rule: "directory-role-contract",
      path: contract.path,
      message: `Files inside "${contract.directoryName}" directories must encode the ${expectedRoles} artifact role in the filename.`,
    })
  }

  return violations
}
