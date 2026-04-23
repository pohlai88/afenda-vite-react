/**
 * Validates that `sql/hardening/` contains exactly the expected `patch_*.sql` set
 * (no drift vs `verify-hardening-patch-order.ts`).
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

import { HARDENING_PATCH_FILENAMES } from "./verify-hardening-patch-order"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const hardeningDir = path.join(__dirname, "..", "sql", "hardening")

export function verifyHardeningPatches(): void {
  if (!fs.existsSync(hardeningDir)) {
    throw new Error(
      `verify-hardening-patches: missing directory ${hardeningDir}`
    )
  }
  const onDisk = fs
    .readdirSync(hardeningDir)
    .filter((name) => name.startsWith("patch_") && name.endsWith(".sql"))
    .sort()

  const expected = [...HARDENING_PATCH_FILENAMES].sort()
  const a = onDisk.join("\n")
  const b = expected.join("\n")
  if (a !== b) {
    const expectedSet = new Set<string>(expected)
    const missing = expected.filter((f) => !onDisk.includes(f))
    const extra = onDisk.filter((f) => !expectedSet.has(f))
    throw new Error(
      "verify-hardening-patches: sql/hardening patch set does not match scripts/verify-hardening-patch-order.ts\n" +
        (missing.length ? `  missing: ${missing.join(", ")}\n` : "") +
        (extra.length ? `  extra: ${extra.join(", ")}\n` : "")
    )
  }
}

const isMain =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1]!)).href

if (isMain) {
  verifyHardeningPatches()
  console.log("verify-hardening-patches: ok")
}
