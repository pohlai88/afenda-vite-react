import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  appCandidateArraySchema,
  type AppCandidate,
} from "./schema/candidate.schema.js"

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url))

function isFeaturesSdkRoot(candidateDirectory: string): boolean {
  const seedPath = path.join(
    candidateDirectory,
    "rules",
    "sync-pack",
    "openalternative.seed.json"
  )
  const sourceSyncPackPath = path.join(candidateDirectory, "src", "sync-pack")
  const distSyncPackPath = path.join(candidateDirectory, "dist", "sync-pack")

  return (
    existsSync(seedPath) &&
    (existsSync(sourceSyncPackPath) || existsSync(distSyncPackPath))
  )
}

export function findWorkspaceRoot(startDirectory = process.cwd()): string {
  let currentDirectory = path.resolve(startDirectory)
  const searchedDirectories: string[] = []

  while (true) {
    searchedDirectories.push(currentDirectory)

    if (existsSync(path.join(currentDirectory, "pnpm-workspace.yaml"))) {
      return currentDirectory
    }

    const parentDirectory = path.dirname(currentDirectory)
    if (parentDirectory === currentDirectory) {
      throw new Error(
        [
          "Unable to locate Afenda workspace root.",
          `cwd: ${path.resolve(startDirectory)}`,
          "expected marker: pnpm-workspace.yaml",
          `searched: ${searchedDirectories.join(" -> ")}`,
          "remediation: run this command from inside the Afenda pnpm workspace or pass an explicit workspace root.",
        ].join("\n")
      )
    }

    currentDirectory = parentDirectory
  }
}

export function findFeaturesSdkRoot(startDirectory = process.cwd()): string {
  const searchRoots = [path.resolve(startDirectory), moduleDirectory]
  const searchedDirectories: string[] = []

  for (const searchRoot of searchRoots) {
    let currentDirectory = searchRoot

    while (true) {
      searchedDirectories.push(currentDirectory)

      if (isFeaturesSdkRoot(currentDirectory)) {
        return currentDirectory
      }

      const parentDirectory = path.dirname(currentDirectory)
      if (parentDirectory === currentDirectory) {
        break
      }

      currentDirectory = parentDirectory
    }
  }

  throw new Error(
    [
      "Unable to locate @afenda/features-sdk package root.",
      `cwd: ${path.resolve(startDirectory)}`,
      `module directory: ${moduleDirectory}`,
      "expected markers: rules/sync-pack/openalternative.seed.json and src/sync-pack or dist/sync-pack",
      `searched: ${searchedDirectories.join(" -> ")}`,
      "remediation: run this command from packages/features-sdk, the Afenda workspace, or an installed @afenda/features-sdk package.",
    ].join("\n")
  )
}

export function resolveSeedPath(packageRoot = findFeaturesSdkRoot()): string {
  return path.join(
    packageRoot,
    "rules",
    "sync-pack",
    "openalternative.seed.json"
  )
}

export function resolveGeneratedPacksPath(
  packageRoot = findFeaturesSdkRoot()
): string {
  return path.join(packageRoot, "docs", "sync-pack", "generated-packs")
}

export async function readSeedCandidates(
  seedPath = resolveSeedPath()
): Promise<AppCandidate[]> {
  const rawSeed = await readFile(seedPath, "utf8")
  return appCandidateArraySchema.parse(JSON.parse(rawSeed))
}
