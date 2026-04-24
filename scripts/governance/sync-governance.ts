import { spawnSync } from "node:child_process"

const commands = [
  "pnpm run script:generate-governance-report",
  "pnpm run script:generate-governance-register",
] as const

for (const command of commands) {
  console.log(`\n[governance-sync] ${command}`)

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

console.log("\n[governance-sync] governance derived surfaces refreshed.")
