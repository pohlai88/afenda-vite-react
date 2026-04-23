import { execFileSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

type RootPackageJson = {
  packageManager?: string
}

function fail(message: string): never {
  console.error(`Toolchain governance failed: ${message}`)
  process.exit(1)
}

const repoRoot = process.cwd()
const rootPackageJsonPath = path.join(repoRoot, "package.json")
const npmrcPath = path.join(repoRoot, ".npmrc")

const rootPackageJson = JSON.parse(
  readFileSync(rootPackageJsonPath, "utf8")
) as RootPackageJson
const runtimeNodeVersion = process.version.replace(/^v/, "")
const pnpmExecPath = process.env.npm_execpath

const expectedPnpmVersion = rootPackageJson.packageManager?.startsWith("pnpm@")
  ? rootPackageJson.packageManager.slice("pnpm@".length)
  : null

if (!existsSync(npmrcPath)) {
  fail("root .npmrc is missing.")
}

const npmrc = readFileSync(npmrcPath, "utf8")
const npmrcNodeVersion =
  npmrc
    .split(/\r?\n/)
    .find((line) => line.trim().startsWith("use-node-version="))
    ?.split("=")[1]
    ?.trim() ?? null

if (!expectedPnpmVersion) {
  fail("root package.json must declare packageManager as pnpm@<version>.")
}

if (!pnpmExecPath) {
  fail("npm_execpath is missing; run this check through pnpm.")
}

if (!npmrcNodeVersion) {
  fail("root .npmrc must declare use-node-version=<version>.")
}

const pnpmExecInvocation = /\.(?:cmd|exe)$/i.test(pnpmExecPath)
  ? { file: pnpmExecPath, args: ["--version"] }
  : { file: process.execPath, args: [pnpmExecPath, "--version"] }

const pnpmVersion = execFileSync(
  pnpmExecInvocation.file,
  pnpmExecInvocation.args,
  {
    cwd: repoRoot,
    encoding: "utf8",
  }
).trim()

if (runtimeNodeVersion !== npmrcNodeVersion) {
  fail(
    `current Node runtime (${runtimeNodeVersion}) does not match .npmrc use-node-version (${npmrcNodeVersion}).`
  )
}

if (pnpmVersion !== expectedPnpmVersion) {
  fail(
    `pnpm runtime (${pnpmVersion}) does not match root packageManager (${expectedPnpmVersion}).`
  )
}

const pnpmShimDiagnostic = resolveWindowsPnpmShimDiagnostic(
  repoRoot,
  npmrcNodeVersion
)

console.log(
  `Toolchain governance passed: node ${runtimeNodeVersion}, pnpm ${pnpmVersion}.`
)

if (pnpmShimDiagnostic !== null) {
  console.warn(pnpmShimDiagnostic)
}

function resolveWindowsPnpmShimDiagnostic(
  cwd: string,
  expectedNodeVersion: string
): string | null {
  if (process.platform !== "win32") {
    return null
  }

  try {
    const pnpmShimPaths = execFileSync("where.exe", ["pnpm"], {
      cwd,
      encoding: "utf8",
    })
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)

    if (pnpmShimPaths.length === 0) {
      return null
    }

    const pnpmShimPath = pnpmShimPaths[0]
    const shimDirectory = path.dirname(pnpmShimPath)
    const shimNodePath = path.join(shimDirectory, "node.exe")

    if (!existsSync(shimNodePath)) {
      return null
    }

    const shimNodeVersion = execFileSync(shimNodePath, ["-v"], {
      cwd,
      encoding: "utf8",
    })
      .trim()
      .replace(/^v/, "")

    if (shimNodeVersion === expectedNodeVersion) {
      return null
    }

      return [
      "Toolchain governance warning:",
      `pnpm shim "${pnpmShimPath}" boots with "${shimNodePath}" at Node ${shimNodeVersion},`,
      `but .npmrc requires Node ${expectedNodeVersion}.`,
      "This mismatch can trigger pnpm engine warnings even when repo scripts run under the correct Node version.",
    ].join(" ")
  } catch {
    return null
  }
}
