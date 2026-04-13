export class TenantScopeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "TenantScopeError"
  }
}

export function requireTenantId(tenantId: string): string {
  const normalized = tenantId.trim()
  if (normalized === "") {
    throw new TenantScopeError("A tenant id is required for tenant-owned data.")
  }
  return normalized
}
