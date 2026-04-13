import { describe, expect, it, vi } from "vitest"

import type { ShellMetadata } from "../contract/shell-metadata-contract"
import { shellMetadataValidationCodes } from "../contract/shell-metadata-validation-codes"
import { resolveShellMetadata } from "../services/resolve-shell-metadata"

describe("resolveShellMetadata", () => {
  it("returns the supplied metadata when provided", () => {
    const metadata: ShellMetadata = {
      titleKey: "nav.dashboard",
      breadcrumbs: [
        {
          id: "dashboard",
          labelKey: "nav.dashboard",
          to: "/dashboard",
        },
      ],
    }

    expect(
      resolveShellMetadata({
        metadata,
      })
    ).toBe(metadata)
  })

  it("returns a stable empty object when metadata is undefined", () => {
    const first = resolveShellMetadata({
      metadata: undefined,
    })

    const second = resolveShellMetadata({
      metadata: undefined,
    })

    expect(first).toEqual({})
    expect(second).toEqual({})
    expect(first).toBe(second)
  })

  it("does not validate by default", () => {
    const onValidationIssues = vi.fn()

    resolveShellMetadata({
      metadata: {
        titleKey: " ",
      },
      onValidationIssues,
    })

    expect(onValidationIssues).not.toHaveBeenCalled()
  })

  it("emits validation issues when validation is enabled", () => {
    const onValidationIssues = vi.fn()

    resolveShellMetadata({
      metadata: {
        titleKey: " ",
        breadcrumbs: [
          {
            id: "",
            labelKey: "",
            to: "",
          },
        ],
      },
      validate: true,
      onValidationIssues,
    })

    expect(onValidationIssues).toHaveBeenCalledTimes(1)
    expect(onValidationIssues).toHaveBeenCalledWith([
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
    ])
  })

  it("does not emit validation callback when validation passes", () => {
    const onValidationIssues = vi.fn()

    const metadata: ShellMetadata = {
      titleKey: "nav.dashboard",
      breadcrumbs: [
        {
          id: "dashboard",
          labelKey: "nav.dashboard",
          to: "/dashboard",
        },
      ],
    }

    const result = resolveShellMetadata({
      metadata,
      validate: true,
      onValidationIssues,
    })

    expect(result).toBe(metadata)
    expect(onValidationIssues).not.toHaveBeenCalled()
  })

  it("returns the stable empty object when validation is enabled and metadata is undefined", () => {
    const onValidationIssues = vi.fn()

    const result = resolveShellMetadata({
      metadata: undefined,
      validate: true,
      onValidationIssues,
    })

    expect(result).toEqual({})
    expect(onValidationIssues).not.toHaveBeenCalled()
  })

  it("supports validation without a callback", () => {
    const metadata: ShellMetadata = {
      titleKey: " ",
    }

    expect(() =>
      resolveShellMetadata({
        metadata,
        validate: true,
      })
    ).not.toThrow()
  })
})
