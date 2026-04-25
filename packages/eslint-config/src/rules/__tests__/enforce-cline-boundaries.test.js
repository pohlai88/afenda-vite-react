import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { ESLint } from "eslint"
import { afterEach, describe, expect, it } from "vitest"

import rule from "../enforce-cline-boundaries.js"

const tempDirs = []

async function lintClineFile(options) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "afenda-cline-boundaries-"))
  tempDirs.push(dir)

  const filePath = path.join(dir, ...options.fileSegments)
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, options.source, "utf8")

  const eslint = new ESLint({
    cwd: dir,
    overrideConfigFile: true,
    ignore: false,
    overrideConfig: [
      {
        files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
        languageOptions: {
          ecmaVersion: "latest",
          sourceType: "module",
          parserOptions: {
            ecmaFeatures: {
              jsx: true,
            },
          },
        },
        plugins: {
          "afenda-ui": {
            rules: {
              "enforce-cline-boundaries": rule,
            },
          },
        },
        rules: {
          "afenda-ui/enforce-cline-boundaries": "error",
        },
      },
    ],
  })

  const [result] = await eslint.lintText(options.source, { filePath })
  return result.messages
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))
  )
})

describe("enforce-cline-boundaries", () => {
  it("blocks relative imports into packages/features-sdk", async () => {
    const messages = await lintClineFile({
      fileSegments: [
        "packages",
        "cline",
        "src",
        "plugins",
        "features-sdk",
        "tools",
        "leak.ts",
      ],
      source:
        'import { shared } from "../../../../../features-sdk/src/sync-pack/cli/shared.js"\n',
    })

    expect(messages).toHaveLength(1)
    expect(messages[0]?.message).toContain(
      "packages/cline may not reach into packages/features-sdk"
    )
  })

  it("blocks non-sync-pack Features SDK package imports", async () => {
    const messages = await lintClineFile({
      fileSegments: ["packages", "cline", "src", "runtime", "bad-import.ts"],
      source: 'import { verify } from "@afenda/features-sdk"\n',
    })

    expect(messages).toHaveLength(1)
    expect(messages[0]?.message).toContain("@afenda/features-sdk/sync-pack")
  })

  it("blocks MCP imports of runtime and plugin internals", async () => {
    const messages = await lintClineFile({
      fileSegments: ["packages", "cline", "src", "mcp-server", "index.ts"],
      source:
        'import { featuresSdkClinePlugin } from "../plugins/features-sdk/plugin.js"\n',
    })

    expect(messages).toHaveLength(1)
    expect(messages[0]?.message).toContain("top-level runtime API")
  })

  it("allows the MCP transport to import runtime/index only", async () => {
    const messages = await lintClineFile({
      fileSegments: ["packages", "cline", "src", "mcp-server", "index.ts"],
      source:
        'import { createDefaultClineRuntime } from "../runtime/index.js"\n',
    })

    expect(messages).toHaveLength(0)
  })

  it("allows the governed public sync-pack surface", async () => {
    const messages = await lintClineFile({
      fileSegments: [
        "packages",
        "cline",
        "src",
        "plugins",
        "features-sdk",
        "tools",
        "index.ts",
      ],
      source:
        'import { syncPackWorkflowCatalog } from "@afenda/features-sdk/sync-pack"\n',
    })

    expect(messages).toHaveLength(0)
  })
})
