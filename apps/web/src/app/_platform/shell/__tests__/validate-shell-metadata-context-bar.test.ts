import { describe, expect, it } from "vitest"

import type { ShellMetadata } from "../contract/shell-metadata-contract"
import { shellMetadataValidationCodes } from "../contract/shell-metadata-validation-codes"
import { validateShellMetadata } from "../services/validate-shell-metadata"

describe("validateShellMetadata contextBar", () => {
  it("reports invalid context bar payload as INVALID_CONTEXT_BAR", () => {
    const metadata: ShellMetadata = {
      titleKey: "breadcrumb.events",
      contextBar: {
        tabs: [
          {
            id: " ",
            labelKey: "context_bar.events.tabs.overview",
            kind: "link",
            to: "",
          },
        ],
      },
    }

    expect(validateShellMetadata(metadata)).toEqual(
      expect.arrayContaining([
        {
          code: shellMetadataValidationCodes.INVALID_CONTEXT_BAR,
          message:
            "[SHELL_CONTEXT_BAR_TAB_INVALID_ID] Context bar tab id must not be empty.",
          path: "contextBar.tabs[0].id",
        },
        {
          code: shellMetadataValidationCodes.INVALID_CONTEXT_BAR,
          message:
            '[SHELL_CONTEXT_BAR_TAB_MISSING_LINK_TARGET] Context bar link tab requires a non-empty "to".',
          path: "contextBar.tabs[0].to",
        },
      ])
    )
  })
})
