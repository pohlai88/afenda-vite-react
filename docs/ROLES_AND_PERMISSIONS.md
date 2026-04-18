# Roles and permissions (RBAC + PBAC)

Afenda uses **both** ideas; they answer different questions:

| Concept                                    | Meaning here                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RBAC (role-based access control)**       | **Who gets what bundle:** users are assigned **one or more roles** per tenant (`tenant_membership_roles`). Admins manage **roles** and **role ↔ permission** mappings. This is classic RBAC at the **data and admin UI** layer.                                                                                       |
| **PBAC (permission-based access control)** | **What you check at runtime:** the API does **not** authorize with a single coarse role name alone. It resolves **`hasPermission(tenant, permissionKey)`** from the DB (union of all permissions from all of the user’s roles). **Permissions** are the atomic grants; **roles** are named groupings of those grants. |

So **RBAC is not removed**—roles remain the main way permissions are **assigned** and **managed**. **PBAC** describes the **enforcement** primitive: stable **permission keys**, not “is admin?” as the only gate.

**This repo** does not yet ship the full **roles + permissions** schema in application code (`apps/web`); when you add `apps/api` + [Database package](../packages/_database/README.md), implement role tables and `hasPermission` there, and optionally mirror resolved permission keys in session or JWT claims for UI convenience—see [Authentication](./AUTHENTICATION.md).

The **decision** “can this identity perform action X on resource Y?” should be enforced on the **server** (`hasPermission` / policy check on every API call). The SPA may mirror permission keys for **navigation and UX** only.

---

## 1. Principles

1. **Database (or policy service) is source of truth** — Revocations apply on the next API request; do not trust a stale client list for authorization.
2. **Union of roles** — `effectivePermissions = union(role1.permissions, role2.permissions, …)` per tenant membership.
3. **Keys are stable strings** — e.g. `finance:journal:post`, `inventory:stock:adjust`. Use a consistent `category:resource:action` (or your convention) and document keys in one registry.
4. **Tenant scope** — Permissions are evaluated **in the context of a tenant** ([Glossary](./GLOSSARY.md)); super-admin / cross-tenant roles are product-specific.

---

## 2. Session and UI (Vite SPA)

| Concern          | Usage                                                                                                                                                           |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **API / server** | `hasPermission(tenantId, permissionKey)` (or equivalent) against DB or policy engine. **Always** for mutations and sensitive reads.                             |
| **Browser**      | Optional copy of permission keys (from `/api/me`, session payload, or token claims) to **show/hide nav**, buttons, and routes. **Not** sufficient for security. |
| **Route guards** | React Router wrappers that redirect if `!can('route:view')` improve UX; **still** enforce on the API.                                                           |

Do **not** use client-only role enums for authorization of ERP data.

---

## 3. Feature flag: custom roles (optional)

If product settings include **`allowCustomRoles`** (or similar):

- **On** — Tenant admins can define **custom roles** in addition to **system** roles (seeded defaults).
- **Off** — Only system roles exist; admins may still tune **which permissions** each system role has if your model allows it.

Implement as tenant JSON / settings table—no Next.js dependency.

---

## 4. Illustrative data model

Adjust names to your migrations; relationships are what matter.

| Table / concept               | Purpose                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| **`permissions`**             | Stable rows: `key`, `name`, `category`, optional `description`. Global or tenant-scoped.     |
| **`roles`**                   | `tenantId`, `name`, `slug`, `isSystem`, optional metadata.                                   |
| **`role_permissions`**        | Many-to-many: role ↔ permission.                                                             |
| **`tenant_memberships`**      | User (or identity) ↔ tenant; links to person/employee if needed.                             |
| **`tenant_membership_roles`** | Many-to-many: **one membership can have multiple roles**—union drives effective permissions. |
| **`tenant_invitations`**      | Optional `roleId`s for invites; on accept, create membership + role rows.                    |

Enum columns like `role = 'admin'` for **display** only are acceptable; **authorization** should still use permission keys or resolved role IDs from the DB.

---

## 5. ERP-oriented permission categories (examples)

Replace SaaS/talent keys with keys that match **your** modules. Start small and extend.

| Category        | Example keys                                                                                   |
| --------------- | ---------------------------------------------------------------------------------------------- |
| **Core**        | `core:dashboard:view`, `core:search:use`                                                       |
| **Finance**     | `finance:gl:read`, `finance:journal:draft`, `finance:journal:post`, `finance:period:close`     |
| **Inventory**   | `inventory:stock:read`, `inventory:stock:adjust`, `inventory:transfer:create`                  |
| **Sales**       | `sales:order:create`, `sales:order:approve`, `sales:pricing:edit`                              |
| **Procurement** | `procurement:po:create`, `procurement:po:approve`                                              |
| **Master data** | `master:customer:manage`, `master:item:manage`, `master:vendor:manage`                         |
| **HR**          | `hr:employee:read`, `hr:employee:edit`, `hr:org:assign`                                        |
| **Reports**     | `reports:financial:run`, `reports:inventory:run`, `reports:export`                             |
| **Admin**       | `admin:tenant:settings`, `admin:roles:manage`, `admin:integrations:manage`, `admin:audit:read` |

**Scoping:** Some actions are further limited by **data scope** (cost center, warehouse, company code)—express with attributes on the membership or separate **scope** tables; PBAC keys say _what_ action; scope rules say _which rows_.

---

## 6. Default roles (illustrative)

Seed names for discussion—rename to your product language.

| Role         | Typical use                                                                   |
| ------------ | ----------------------------------------------------------------------------- |
| **viewer**   | Read-only operational and report access where allowed.                        |
| **operator** | Day-to-day transactions in assigned modules (e.g. warehouse clerk, AR clerk). |
| **manager**  | Approvals, team-scoped reporting, may include subset of write permissions.    |
| **admin**    | Full tenant configuration, roles, integrations, and sensitive master data.    |

Map each role to a **set of permission keys** in `role_permissions`; power users get **multiple roles** if needed.

---

## 7. API patterns (server)

Keep permission helpers in a **single server module** (e.g. `apps/api/src/auth/permissions.ts`), not in Vite.

```typescript
// Pseudocode — runs on the API only
async function hasPermission(
  userId: string,
  tenantId: string,
  key: string
): Promise<boolean> {
  // Resolve membership → roles → union of permission keys; compare key
}

async function requirePermission(
  userId: string,
  tenantId: string,
  key: string
) {
  if (!(await hasPermission(userId, tenantId, key))) {
    throw new ForbiddenError()
  }
}
```

- **`getEffectivePermissions(userId, tenantId)`** — For responses to `/api/me` (UI nav); may be cached briefly, never authoritative for writes.
- **Convenience guards** — `requireFinancePosting`, `requireAdmin`, etc., should **delegate** to `requirePermission` with explicit keys.

---

## 8. UI layouts and navigation

- **Admin / settings** — Require `admin:tenant:settings` or `admin:roles:manage` (examples); hide sidebar entries when keys missing.
- **Module areas** — Finance, Inventory, etc.: gate routes with **permission + feature flags**; align entries with [Project structure](./PROJECT_STRUCTURE.md) routes.
- **ERP scope** — List screens (e.g. “orders I can approve”) combine **permission** with **server-side filters** (org hierarchy, warehouse assignment).

---

## 9. Seeds and demos

Demo data should call a single **`seedPermissionsAndRoles(tenantId)`** (or migration) so every membership has at least one role row in **`tenant_membership_roles`**. Invitations should store **`roleId`** (or equivalent) and apply it on accept.

---

## Related docs

- [Authentication](./AUTHENTICATION.md) — identity, sessions, tokens
- [Database package](../packages/_database/README.md) — where permission tables live
- [Glossary](./GLOSSARY.md) — tenant, user, employee
- [Project structure](./PROJECT_STRUCTURE.md) — route modules and future `features/*`
- [Integrations](./INTEGRATIONS.md) — OAuth scopes vs product permissions
