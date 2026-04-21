import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { ESLint } from "eslint"
import { afterEach, describe, expect, it } from "vitest"

import rule from "../no-auth-scroll-trap.js"

const tempDirs = []

async function lintAuthLayout(cssSource) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "afenda-auth-scroll-trap-"))
  tempDirs.push(dir)

  const routesDir = path.join(dir, "routes")
  const cssPath = path.join(dir, "auth.css")
  const layoutPath = path.join(routesDir, "auth-layout.tsx")

  await mkdir(routesDir, { recursive: true })
  await writeFile(
    layoutPath,
    'import "../auth.css"\nexport function AuthLayout() {\n  return null\n}\n',
    "utf8"
  )
  await writeFile(cssPath, cssSource, "utf8")

  const eslint = new ESLint({
    cwd: dir,
    overrideConfigFile: true,
    ignore: false,
    overrideConfig: [
      {
        files: ["**/*.tsx"],
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
              "no-auth-scroll-trap": rule,
            },
          },
        },
        rules: {
          "afenda-ui/no-auth-scroll-trap": "error",
        },
      },
    ],
  })

  const code = await readFile(layoutPath, "utf8")
  const [result] = await eslint.lintText(code, { filePath: layoutPath })
  return result.messages
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))
  )
})

describe("no-auth-scroll-trap", () => {
  it("reports fixed viewport heights on auth shell selectors", async () => {
    const messages = await lintAuthLayout(`
      .auth-shell-grid {
        height: 100dvh;
      }
    `)

    expect(messages).toHaveLength(1)
    expect(messages[0]?.message).toContain("fixed viewport height")
    expect(messages[0]?.message).toContain(".auth-shell-grid")
  })

  it("reports hidden overflow on auth shell selectors", async () => {
    const messages = await lintAuthLayout(`
      .auth-shell {
        overflow: hidden;
      }
    `)

    expect(messages).toHaveLength(1)
    expect(messages[0]?.message).toContain("hide overflow")
    expect(messages[0]?.message).toContain(".auth-shell")
  })

  it("allows content-driven auth shell sizing", async () => {
    const messages = await lintAuthLayout(`
      .auth-shell {
        min-height: 100dvh;
      }

      .auth-shell-grid {
        min-height: 100dvh;
      }
    `)

    expect(messages).toHaveLength(0)
  })
})
