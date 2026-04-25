import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { ESLint } from "eslint"
import { afterEach, describe, expect, it } from "vitest"

import rule from "../no-cline-child-process.js"

const tempDirs = []

async function lintClineRuntimeSource(source) {
  const dir = await mkdtemp(
    path.join(os.tmpdir(), "afenda-cline-child-process-")
  )
  tempDirs.push(dir)

  const filePath = path.join(
    dir,
    "packages",
    "cline",
    "src",
    "runtime",
    "worker.ts"
  )
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, source, "utf8")

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
              "no-cline-child-process": rule,
            },
          },
        },
        rules: {
          "afenda-ui/no-cline-child-process": "error",
        },
      },
    ],
  })

  const [result] = await eslint.lintText(source, { filePath })
  return result.messages
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))
  )
})

describe("no-cline-child-process", () => {
  it("blocks direct child_process imports", async () => {
    const messages = await lintClineRuntimeSource(
      'import { spawn } from "node:child_process"\n'
    )

    expect(messages).toHaveLength(1)
    expect(messages[0]?.message).toContain("may not import child_process")
  })

  it("blocks subprocess execution through child_process namespaces", async () => {
    const messages = await lintClineRuntimeSource(`
      import * as childProcess from "node:child_process"

      childProcess.spawn("node", ["--version"])
    `)

    expect(messages).toHaveLength(2)
    expect(messages[1]?.message).toContain("may not execute subprocess APIs")
  })

  it("allows typed runtime logic with no subprocess access", async () => {
    const messages = await lintClineRuntimeSource(`
      export async function executeWorkflow() {
        return { ok: true }
      }
    `)

    expect(messages).toHaveLength(0)
  })
})
