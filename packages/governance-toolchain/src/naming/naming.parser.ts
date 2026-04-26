import path from "node:path"

import type {
  NamingContract,
  NamingContractRole,
  NamingContractScope,
} from "./naming.contract.js"

const DOT_ROLE_SUFFIXES: readonly NamingContractRole[] = [
  "adapter",
  "command",
  "commands",
  "contract",
  "context",
  "generated",
  "model",
  "policy",
  "projection",
  "provider",
  "registry",
  "repo",
  "route",
  "routes",
  "schema",
  "service",
  "spec",
  "state-machine",
  "store",
  "stories",
  "test",
  "types",
  "validator",
  "writer",
] as const

const HYPHEN_ROLE_SUFFIXES: readonly NamingContractRole[] = [
  "adapter",
  "command",
  "commands",
  "contract",
  "context",
  "generated",
  "model",
  "policy",
  "projection",
  "provider",
  "registry",
  "repo",
  "route",
  "routes",
  "schema",
  "service",
  "state-machine",
  "store",
  "types",
  "validator",
  "writer",
] as const

const EXACT_ROLE_ONLY_STEMS = new Set<NamingContractRole>([
  "adapter",
  "contract",
  "policy",
  "provider",
  "schema",
  "spec",
  "store",
  "stories",
  "test",
])

function toPosixPath(value: string): string {
  return value.replaceAll("\\", "/")
}

function stripExtension(fileName: string): {
  readonly stem: string
  readonly extension: string
} {
  if (fileName.endsWith(".d.ts")) {
    return {
      stem: fileName.slice(0, -".d.ts".length),
      extension: ".d.ts",
    }
  }

  const extension = path.posix.extname(fileName)
  return {
    stem:
      extension.length > 0 ? fileName.slice(0, -extension.length) : fileName,
    extension,
  }
}

function inferScope(pathSegments: readonly string[]): NamingContractScope {
  const firstSegment = pathSegments[0]
  if (firstSegment === "apps") {
    return "app"
  }
  if (firstSegment === "packages") {
    return "package"
  }
  if (firstSegment === "scripts" || firstSegment === "docs") {
    return "root"
  }

  return "unknown"
}

function inferRoleSegments(stem: string): readonly NamingContractRole[] {
  const roleSegments: NamingContractRole[] = []
  let subjectStem = stem

  if (EXACT_ROLE_ONLY_STEMS.has(stem as NamingContractRole)) {
    return [stem as NamingContractRole]
  }

  const dottedSegments = stem.split(".")
  while (dottedSegments.length > 1) {
    const trailing = dottedSegments.at(-1)
    if (
      !trailing ||
      !DOT_ROLE_SUFFIXES.includes(trailing as NamingContractRole)
    ) {
      break
    }

    roleSegments.unshift(trailing as NamingContractRole)
    dottedSegments.pop()
    subjectStem = dottedSegments.join(".")
  }

  for (const candidate of HYPHEN_ROLE_SUFFIXES) {
    const suffix = `-${candidate}`
    if (subjectStem.endsWith(suffix)) {
      roleSegments.unshift(candidate)
      break
    }
  }

  return roleSegments
}

export function parseNamingContract(filePath: string): NamingContract {
  const normalizedPath = toPosixPath(filePath)
  const pathSegments = normalizedPath.split("/").filter(Boolean)
  const fileName = pathSegments.at(-1) ?? normalizedPath
  const { stem, extension } = stripExtension(fileName)
  const roleSegments = inferRoleSegments(stem)
  let subjectStem = stem

  if (roleSegments.length > 0) {
    if (stem === roleSegments[0]) {
      subjectStem = ""
    } else {
      const dottedSuffix = `.${roleSegments.join(".")}`
      if (stem.endsWith(dottedSuffix)) {
        subjectStem = stem.slice(0, -dottedSuffix.length)
      } else {
        const hyphenSuffix = `-${roleSegments[0]}`
        if (stem.endsWith(hyphenSuffix)) {
          subjectStem = stem.slice(0, -hyphenSuffix.length)
        }
      }
    }
  }

  const primarySubject =
    subjectStem.split(/[-_.]/u).filter(Boolean)[0]?.toLowerCase() ?? null

  return {
    path: normalizedPath,
    fileName,
    stem,
    extension,
    scope: inferScope(pathSegments),
    ownershipPath: pathSegments.slice(0, -1).join("/"),
    directoryName: pathSegments.at(-2) ?? null,
    pathSegments,
    subjectStem,
    primarySubject,
    roleSegments,
    isIndex: stem === "index",
    isRoleOnly: subjectStem.length === 0 && roleSegments.length > 0,
  }
}
