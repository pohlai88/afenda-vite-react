import { describe, expect, it } from "vitest"

import { parseThemeTokenSource } from "../src/tokenization/token-contract"
import { themeTokenSource } from "../src/tokenization/token-source"

describe("token-contract", () => {
  it("parses the canonical token source", () => {
    expect(() => parseThemeTokenSource(themeTokenSource)).not.toThrow()
  })

  it("rejects missing primitive light token coverage", () => {
    const light = {
      ...(themeTokenSource.colors.primitive.light as Record<string, string>),
    }
    delete light.background

    const invalid = {
      ...themeTokenSource,
      colors: {
        ...themeTokenSource.colors,
        primitive: {
          ...themeTokenSource.colors.primitive,
          light,
        },
      },
    }

    expect(() => parseThemeTokenSource(invalid)).toThrow()
  })

  it("rejects missing derived dark token coverage", () => {
    const derivedDark = {
      ...(themeTokenSource.colors.derived.dark as Record<string, string>),
    }
    delete derivedDark["surface-hover"]

    const invalid = {
      ...themeTokenSource,
      colors: {
        ...themeTokenSource.colors,
        derived: {
          ...themeTokenSource.colors.derived,
          dark: derivedDark,
        },
      },
    }

    expect(() => parseThemeTokenSource(invalid)).toThrow()
  })

  it("rejects missing runtime family members", () => {
    const controlSizes = {
      ...(themeTokenSource.runtime.controlSizes as Record<string, string>),
    }
    delete controlSizes["control-md"]

    const invalid = {
      ...themeTokenSource,
      runtime: {
        ...themeTokenSource.runtime,
        controlSizes,
      },
    }

    expect(() => parseThemeTokenSource(invalid)).toThrow()
  })

  it("rejects unknown top-level keys", () => {
    const invalid = {
      ...themeTokenSource,
      nonsense: true,
    }

    expect(() => parseThemeTokenSource(invalid)).toThrow()
  })

  it("rejects missing light or dark mode blocks", () => {
    const primitive = {
      ...(themeTokenSource.colors.primitive as Record<string, unknown>),
    }
    delete primitive.dark

    const invalid = {
      ...themeTokenSource,
      colors: {
        ...themeTokenSource.colors,
        primitive,
      },
    }

    expect(() => parseThemeTokenSource(invalid)).toThrow()
  })
})
