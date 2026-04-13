/**
 * Smoke-check a running @afenda/api instance (local E2E helper).
 *
 *   pnpm --filter @afenda/api dev
 *   pnpm exec tsx scripts/audit-api-smoke.ts
 *
 * Env: `AUDIT_API_URL` (default `http://localhost:3001`)
 */
const base = (process.env.AUDIT_API_URL ?? "http://localhost:3001").replace(
  /\/$/,
  ""
)

async function main(): Promise<void> {
  const health = await fetch(`${base}/health`)
  if (!health.ok) {
    console.error(`GET /health failed: ${health.status}`)
    process.exit(1)
  }
  const h = (await health.json()) as { ok?: boolean }
  if (!h.ok) {
    console.error("GET /health: unexpected body", h)
    process.exit(1)
  }
  console.info("GET /health OK")

  const tenantId = "00000000-0000-4000-8000-000000000001"
  const demo = await fetch(`${base}/v1/audit/demo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-Id": tenantId,
      "X-Request-Id": "smoke-req-1",
      "X-Correlation-Id": "smoke-corr-1",
    },
    body: JSON.stringify({ subjectId: "smoke-session" }),
  })

  if (!demo.ok) {
    const errText = await demo.text()
    console.error(`POST /v1/audit/demo failed: ${demo.status}`, errText)
    process.exit(1)
  }
  const d = (await demo.json()) as { id?: string }
  console.info("POST /v1/audit/demo OK", d.id ?? d)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
