import { readFile } from "node:fs/promises"
import path from "node:path"

import { findWorkspaceRoot } from "../workspace.js"

export type WorkspaceCatalogVersions = Record<string, string>

function stripYamlQuotes(value: string): string {
  return value.replace(/^["']|["']$/g, "")
}

function stripInlineComment(value: string): string {
  const commentIndex = value.indexOf(" #")
  return commentIndex === -1 ? value : value.slice(0, commentIndex)
}

export async function readWorkspaceCatalogVersions(
  workspaceRoot = findWorkspaceRoot()
): Promise<WorkspaceCatalogVersions> {
  const workspaceFile = path.join(workspaceRoot, "pnpm-workspace.yaml")
  const text = await readFile(workspaceFile, "utf8")
  const catalog: WorkspaceCatalogVersions = {}
  let insideDefaultCatalog = false

  for (const line of text.split(/\r?\n/)) {
    if (/^catalog:\s*$/.test(line)) {
      insideDefaultCatalog = true
      continue
    }

    if (
      insideDefaultCatalog &&
      line.length > 0 &&
      !line.startsWith(" ") &&
      !line.startsWith("#")
    ) {
      break
    }

    if (!insideDefaultCatalog || line.trim().length === 0) {
      continue
    }

    const match = line.match(/^\s{2}("?[^":]+"?|[^:\s]+):\s*(.+)$/)
    if (!match) {
      continue
    }

    const key = stripYamlQuotes(match[1].trim())
    const value = stripYamlQuotes(stripInlineComment(match[2].trim()).trim())
    catalog[key] = value
  }

  return catalog
}
