import { spawnSync } from "node:child_process"

interface GovernanceStage {
  readonly id: string
  readonly title: string
  readonly command: string
}

const continueOnError = process.argv.includes("--continue-on-error")

const stages: readonly GovernanceStage[] = [
  {
    id: "registry",
    title: "Governance registry integrity",
    command: "pnpm run script:check-governance-registry",
  },
  {
    id: "bindings",
    title: "Governance bindings validity",
    command: "pnpm run script:check-governance-bindings",
  },
  {
    id: "repo-guard",
    title: "Repository integrity preflight",
    command: "pnpm run script:check-repo-guard -- --read-only",
  },
  {
    id: "domains",
    title: "Registered governance checks",
    command: "pnpm run script:run-governance-checks -- --read-only",
  },
  {
    id: "waivers",
    title: "Governance waiver validity",
    command: "pnpm run script:check-governance-waivers -- --read-only",
  },
  {
    id: "aggregate",
    title: "Governance aggregate integrity",
    command: "pnpm run script:check-governance-aggregate",
  },
  {
    id: "register",
    title: "Governance register consistency",
    command: "pnpm run script:check-governance-register",
  },
  {
    id: "honesty",
    title: "Governance honesty tests",
    command: "pnpm run script:test-governance-honesty",
  },
] as const

const failures: Array<{ stage: GovernanceStage; exitCode: number }> = []

for (const stage of stages) {
  console.log(`\n[governance] ${stage.title}`)
  console.log(`[governance] command: ${stage.command}`)

  const result = spawnSync(stage.command, {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: true,
  })
  const exitCode = typeof result.status === "number" ? result.status : 1

  if (exitCode === 0) {
    console.log(`[governance] stage passed: ${stage.id}`)
    continue
  }

  failures.push({ stage, exitCode })
  console.error(
    `[governance] stage failed: ${stage.id} (exit ${String(exitCode)})`
  )

  if (!continueOnError) {
    console.error(
      `[governance] fail-fast stop after ${stage.id}. Re-run after fixing the first blocker or use --continue-on-error for a full sweep.`
    )
    process.exit(exitCode)
  }
}

if (failures.length > 0) {
  console.error("\n[governance] failing stages summary:")
  for (const failure of failures) {
    console.error(
      `- ${failure.stage.id}: ${failure.stage.title} (exit ${String(failure.exitCode)})`
    )
  }
  process.exit(1)
}

console.log(
  `\n[governance] strict read-only governance check passed (${String(stages.length)} stages).`
)
