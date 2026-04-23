if (!process.argv.includes("--ci")) {
  process.argv.push("--ci")
}

await import("../repo-integrity/run-repo-guard.ts")
