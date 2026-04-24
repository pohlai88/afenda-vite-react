import { spawnSync } from "node:child_process"

const commands = [
  "pnpm run script:check-governance-registry",
  "pnpm run script:check-governance-bindings",
  "pnpm run script:check-afenda-config",
  "pnpm run script:check-repo-guard -- --read-only",
] as const

for (const command of commands) {
  console.log(`\n[governance-fast] ${command}`)

  const result = spawnSync(command, {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: true,
  })

  if (result.status === 0) {
    continue
  }

  process.exit(typeof result.status === "number" ? result.status : 1)
}

console.log("\n[governance-fast] preflight governance checks passed.")
