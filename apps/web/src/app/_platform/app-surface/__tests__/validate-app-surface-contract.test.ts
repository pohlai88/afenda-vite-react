import { describe, expect, it, vi } from "vitest"

import type { AppSurfaceContract } from "../contract/app-surface-contract"
import { validateAppSurfaceContract } from "../services/validate-app-surface-contract"

function createContract(): AppSurfaceContract {
  return {
    kind: "workspace",
    header: {
      title: "Events operations",
      description: "Keep the queue governed.",
      actions: [
        {
          id: "open-events",
          kind: "link",
          label: "Open events",
          href: "/app/events",
        },
        {
          id: "retry",
          kind: "button",
          label: "Retry",
          onAction: vi.fn(),
        },
      ],
    },
    metaRow: {
      items: [
        {
          id: "tenant",
          label: "Tenant",
          value: "Acme Ops",
        },
      ],
    },
    content: {
      sections: [{ id: "queue" }, { id: "detail" }],
    },
    stateSurface: {
      loading: {
        title: "Loading events operations",
        description: "Please wait while the operating surface loads.",
      },
      empty: {
        title: "No records yet",
        description: "This surface does not have any records yet.",
      },
      failure: {
        title: "Events operations unavailable",
        description: "Afenda could not load this surface right now.",
      },
      forbidden: {
        title: "Surface unavailable",
        description: "You do not have access to this route.",
      },
    },
  }
}

describe("validateAppSurfaceContract", () => {
  it("accepts a valid app surface contract", () => {
    expect(() => validateAppSurfaceContract(createContract())).not.toThrow()
  })

  it("rejects duplicate section ids", () => {
    const contract: AppSurfaceContract = {
      ...createContract(),
      content: {
        sections: [{ id: "queue" }, { id: "queue" }],
      },
    }

    expect(() => validateAppSurfaceContract(contract)).toThrow(
      "app_surface_contract_invalid:duplicate_section_ids"
    )
  })

  it("rejects invalid action specs", () => {
    const contract: AppSurfaceContract = {
      ...createContract(),
      header: {
        ...createContract().header,
        actions: [
          {
            id: "broken-action",
            kind: "button",
            label: "Retry",
          },
        ],
      },
    }

    expect(() => validateAppSurfaceContract(contract)).toThrow(
      "app_surface_contract_invalid:invalid_action_spec"
    )
  })
})
