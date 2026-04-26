import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { DbStudioPage } from "../components/db-studio-page"

const mockedUseQuery = vi.fn()

vi.mock("@tanstack/react-query", () => ({
  useQuery: (...args: unknown[]) => mockedUseQuery(...args),
}))

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        "db_studio.title": "DB Studio",
        "db_studio.description":
          "Read-only catalogs: business glossary, truth governance overlays, domain coverage, physical enums, and recent tenant audit evidence.",
        "db_studio.glossary_heading": "Business glossary",
        "db_studio.glossary_card_description":
          "Business terms mapped to tables, enums, and Drizzle modules.",
        "db_studio.search_label": "Search terms, aliases, or ids",
        "db_studio.error":
          "Could not load data. Check the API and your session.",
        "db_studio.matrix_heading": "Domain module matrix",
        "db_studio.matrix_card_description":
          "How many glossary entries fall under each domain module.",
        "db_studio.matrix_class": "Domain module",
        "db_studio.matrix_count": "Terms",
        "db_studio.enums_heading": "Allowlisted enums",
        "db_studio.enums_card_description":
          "Enum labels from PostgreSQL (allowlisted types only).",
        "db_studio.audit_heading": "Recent audit (tenant)",
        "db_studio.audit_card_description":
          "Append-only audit evidence for the selected tenant.",
        "db_studio.audit_need_tenant":
          "Select a tenant to load recent audit rows.",
        "db_studio.meta_strip_aria": "Snapshot freshness",
        "db_studio.meta_glossary_title": "Glossary snapshot",
        "db_studio.meta_truth_title": "Truth governance snapshot",
        "db_studio.meta_unavailable": "Not loaded",
        "db_studio.meta_generated": "Generated",
        "db_studio.meta_commit": "Commit",
        "db_studio.meta_content_hash": "YAML hash",
        "db_studio.layer_nav_aria": "Jump to modeling layer",
        "db_studio.nav_catalog": "Catalog",
        "db_studio.nav_governance": "Governance",
        "db_studio.nav_logical": "Logical coverage",
        "db_studio.nav_physical": "Physical enums",
        "db_studio.nav_evidence": "Audit evidence",
        "db_studio.truth_heading": "Truth governance registry",
        "db_studio.truth_description":
          "Truth class, scope model, and time model overlays — distinct from the business glossary.",
        "db_studio.truth_empty": "No truth registry rows yet.",
        "db_studio.truth_column_empty": "None defined",
        "db_studio.truth_classes_heading": "Truth classes",
        "db_studio.scope_models_heading": "Scope models",
        "db_studio.time_models_heading": "Time models",
        "db_studio.artifact_bindings_heading": "Artifact bindings",
        "db_studio.bindings_col_artifact": "Artifact",
        "db_studio.bindings_col_truth": "Truth class",
        "db_studio.bindings_col_scope": "Scope",
        "db_studio.bindings_col_time": "Time",
        "db_studio.bindings_col_notes": "Notes",
      })[key] ?? key,
  }),
}))

vi.mock("@/app/_platform/tenant/tenant-scope-context", () => ({
  useOptionalTenantIdHeaders: vi.fn(() => ({
    "X-Tenant-Id": "tenant-1",
  })),
  useOptionalTenantScope: vi.fn(() => ({
    status: "ready",
    selectedTenantId: "tenant-1",
    me: {
      tenant: {
        memberships: [
          {
            tenantId: "tenant-1",
            tenantName: "Acme Operations",
          },
        ],
      },
    },
  })),
}))

describe("DbStudioPage", () => {
  it("renders a governed loading surface while the core studio payloads are pending", () => {
    mockedUseQuery
      .mockReturnValueOnce({
        data: undefined,
        isPending: true,
        isError: false,
      })
      .mockReturnValueOnce({
        data: undefined,
        isPending: true,
        isError: false,
      })
      .mockReturnValueOnce({
        data: undefined,
        isPending: true,
        isError: false,
      })
      .mockReturnValueOnce({
        data: undefined,
        isPending: false,
        isError: false,
      })

    render(<DbStudioPage />)

    expect(screen.getByText("Loading DB Studio")).toBeInTheDocument()
  })

  it("renders DB Studio inside the app surface contract once catalog data is available", () => {
    mockedUseQuery
      .mockReturnValueOnce({
        data: {
          entries: [
            {
              id: "glossary-1",
              business_primary_term: "Shipment evidence",
              domain_module: "operations.events",
              aliases: [],
              technical: {},
            },
          ],
          domain_modules: [
            {
              id: "operations.events",
              label: "Operations / Events",
            },
          ],
          generated_at: "2026-04-22T12:00:00.000Z",
          source_commit: "abc123",
          source_content_sha256: "deadbeef",
          document_kind: "glossary_snapshot",
        },
        isPending: false,
        isError: false,
      })
      .mockReturnValueOnce({
        data: {
          enums: [
            {
              enum_name: "ops_status",
              value: "draft",
              sort_order: 1,
            },
          ],
        },
        isPending: false,
        isError: false,
      })
      .mockReturnValueOnce({
        data: {
          description: "Truth registry",
          truth_classes: [],
          scope_models: [],
          time_models: [],
          artifact_bindings: [],
          generated_at: "2026-04-22T12:15:00.000Z",
          source_commit: "abc123",
          source_content_sha256: "cafebabe",
          document_kind: "truth_governance_snapshot",
        },
        isPending: false,
        isError: false,
      })
      .mockReturnValueOnce({
        data: {
          items: [],
        },
        isPending: false,
        isError: false,
      })

    render(<DbStudioPage />)

    expect(
      screen.getByRole("heading", { name: "DB Studio" })
    ).toBeInTheDocument()
    expect(screen.getByText("Acme Operations")).toBeInTheDocument()
    expect(screen.getByText("Business glossary")).toBeInTheDocument()
    expect(screen.getByText("Shipment evidence")).toBeInTheDocument()
  })
})
