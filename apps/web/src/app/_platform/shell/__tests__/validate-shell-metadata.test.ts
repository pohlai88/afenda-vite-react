import { describe, expect, it } from "vitest"

import type { ShellMetadata } from "../contract/shell-metadata-contract"
import { shellMetadataValidationCodes } from "../contract/shell-metadata-validation-codes"
import { validateShellMetadata } from "../services/validate-shell-metadata"

describe("validateShellMetadata", () => {
  it("reports missing titleKey for empty metadata", () => {
    const metadata: ShellMetadata = {}

    expect(validateShellMetadata(metadata)).toEqual([
      {
        code: shellMetadataValidationCodes.EMPTY_TITLE_KEY,
        message: "Shell metadata titleKey is required and must not be empty.",
        path: "titleKey",
      },
    ])
  })

  it("returns no issues for valid title and breadcrumb metadata", () => {
    const metadata: ShellMetadata = {
      titleKey: "nav.profile",
      breadcrumbs: [
        {
          id: "dashboard",
          labelKey: "nav.dashboard",
          to: "/dashboard",
        },
        {
          id: "settings",
          labelKey: "nav.settings",
          to: "/dashboard/settings",
        },
        {
          id: "profile",
          labelKey: "nav.profile",
          to: "/dashboard/settings/profile",
        },
      ],
    }

    expect(validateShellMetadata(metadata)).toEqual([])
  })

  it("reports an empty titleKey", () => {
    const metadata: ShellMetadata = {
      titleKey: "   ",
    }

    expect(validateShellMetadata(metadata)).toEqual([
      {
        code: shellMetadataValidationCodes.EMPTY_TITLE_KEY,
        message: "Shell metadata titleKey is required and must not be empty.",
        path: "titleKey",
      },
    ])
  })

  it("reports an empty breadcrumb id", () => {
    const metadata: ShellMetadata = {
      titleKey: "nav.dashboard",
      breadcrumbs: [
        {
          id: "   ",
          labelKey: "nav.dashboard",
          to: "/dashboard",
        },
      ],
    }

    expect(validateShellMetadata(metadata)).toEqual([
      {
        code: shellMetadataValidationCodes.EMPTY_BREADCRUMB_ID,
        message: "Breadcrumb id must not be empty.",
        path: "breadcrumbs[0].id",
      },
    ])
  })

  it("reports two empty breadcrumb ids as two empty issues, not duplicates", () => {
    const metadata: ShellMetadata = {
      titleKey: "nav.x",
      breadcrumbs: [
        { id: "", labelKey: "a", to: "/a" },
        { id: "", labelKey: "b", to: "/b" },
      ],
    }

    expect(validateShellMetadata(metadata)).toEqual([
      {
        code: shellMetadataValidationCodes.EMPTY_BREADCRUMB_ID,
        message: "Breadcrumb id must not be empty.",
        path: "breadcrumbs[0].id",
      },
      {
        code: shellMetadataValidationCodes.EMPTY_BREADCRUMB_ID,
        message: "Breadcrumb id must not be empty.",
        path: "breadcrumbs[1].id",
      },
    ])
  })

  it("reports duplicate breadcrumb ids", () => {
    const metadata: ShellMetadata = {
      titleKey: "nav.settings",
      breadcrumbs: [
        {
          id: "dashboard",
          labelKey: "nav.dashboard",
          to: "/dashboard",
        },
        {
          id: "dashboard",
          labelKey: "nav.settings",
          to: "/dashboard/settings",
        },
      ],
    }

    expect(validateShellMetadata(metadata)).toEqual([
      {
        code: shellMetadataValidationCodes.DUPLICATE_BREADCRUMB_ID,
        message: 'Duplicate breadcrumb id "dashboard" detected.',
        path: "breadcrumbs[1].id",
      },
    ])
  })

  it("reports an empty breadcrumb labelKey", () => {
    const metadata: ShellMetadata = {
      titleKey: "nav.dashboard",
      breadcrumbs: [
        {
          id: "dashboard",
          labelKey: "   ",
          to: "/dashboard",
        },
      ],
    }

    expect(validateShellMetadata(metadata)).toEqual([
      {
        code: shellMetadataValidationCodes.EMPTY_BREADCRUMB_LABEL_KEY,
        message: "Breadcrumb labelKey must not be empty.",
        path: "breadcrumbs[0].labelKey",
      },
    ])
  })

  it("reports an empty breadcrumb target string", () => {
    const metadata: ShellMetadata = {
      titleKey: "nav.dashboard",
      breadcrumbs: [
        {
          id: "dashboard",
          labelKey: "nav.dashboard",
          to: "   ",
        },
      ],
    }

    expect(validateShellMetadata(metadata)).toEqual([
      {
        code: shellMetadataValidationCodes.EMPTY_BREADCRUMB_TO,
        message: "Breadcrumb `to` must not be an empty string.",
        path: "breadcrumbs[0].to",
      },
    ])
  })

  it("reports multiple issues in deterministic order", () => {
    const metadata: ShellMetadata = {
      titleKey: " ",
      breadcrumbs: [
        {
          id: "",
          labelKey: "",
          to: "",
        },
        {
          id: "",
          labelKey: " ",
          to: " ",
        },
      ],
    }

    expect(validateShellMetadata(metadata)).toEqual([
      {
        code: shellMetadataValidationCodes.EMPTY_TITLE_KEY,
        message: "Shell metadata titleKey is required and must not be empty.",
        path: "titleKey",
      },
      {
        code: shellMetadataValidationCodes.EMPTY_BREADCRUMB_ID,
        message: "Breadcrumb id must not be empty.",
        path: "breadcrumbs[0].id",
      },
      {
        code: shellMetadataValidationCodes.EMPTY_BREADCRUMB_LABEL_KEY,
        message: "Breadcrumb labelKey must not be empty.",
        path: "breadcrumbs[0].labelKey",
      },
      {
        code: shellMetadataValidationCodes.EMPTY_BREADCRUMB_TO,
        message: "Breadcrumb `to` must not be an empty string.",
        path: "breadcrumbs[0].to",
      },
      {
        code: shellMetadataValidationCodes.EMPTY_BREADCRUMB_ID,
        message: "Breadcrumb id must not be empty.",
        path: "breadcrumbs[1].id",
      },
      {
        code: shellMetadataValidationCodes.EMPTY_BREADCRUMB_LABEL_KEY,
        message: "Breadcrumb labelKey must not be empty.",
        path: "breadcrumbs[1].labelKey",
      },
      {
        code: shellMetadataValidationCodes.EMPTY_BREADCRUMB_TO,
        message: "Breadcrumb `to` must not be an empty string.",
        path: "breadcrumbs[1].to",
      },
    ])
  })

  it("allows breadcrumbs without targets when titleKey matches terminal labelKey", () => {
    const metadata: ShellMetadata = {
      titleKey: "nav.users",
      breadcrumbs: [
        {
          id: "users",
          labelKey: "nav.users",
        },
      ],
    }

    expect(validateShellMetadata(metadata)).toEqual([])
  })
})
