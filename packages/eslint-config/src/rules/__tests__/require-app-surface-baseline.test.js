import { ESLint } from "eslint"
import { afterEach, describe, expect, it } from "vitest"

import rule from "../require-app-surface-baseline.js"

const testFiles = []

async function lintFile(input) {
  const eslint = new ESLint({
    cwd: process.cwd(),
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
              "require-app-surface-baseline": rule,
            },
          },
        },
        rules: {
          "afenda-ui/require-app-surface-baseline": ["error", input.options],
        },
      },
    ],
  })

  testFiles.push(input.filePath)
  const [result] = await eslint.lintText(input.code, {
    filePath: input.filePath,
  })
  return result.messages
}

afterEach(() => {
  testFiles.splice(0)
})

describe("require-app-surface-baseline", () => {
  it("allows an adopted route that renders the required baseline components", async () => {
    const messages = await lintFile({
      filePath:
        "apps/web/src/app/_features/events-workspace/components/events-workspace-pages.tsx",
      options: {
        requiredComponents: ["AppSurface", "StateSurface"],
        forbiddenIdentifiers: ["PageShell"],
      },
      code: `
        export function EventsOpsPage() {
          return (
            <AppSurface contract={surfaceContract}>
              <StateSurface surfaceKind="workspace" kind="loading" title="Loading" description="Loading" />
            </AppSurface>
          )
        }
      `,
    })

    expect(messages).toHaveLength(0)
  })

  it("reports missing required baseline components", async () => {
    const messages = await lintFile({
      filePath:
        "apps/web/src/app/_features/events-workspace/components/events-workspace-pages.tsx",
      options: {
        requiredComponents: ["AppSurface", "StateSurface"],
      },
      code: `
        export function EventsOpsPage() {
          return <div>missing baseline</div>
        }
      `,
    })

    expect(messages).toHaveLength(2)
    expect(messages[0]?.message).toContain('render "AppSurface"')
    expect(messages[1]?.message).toContain('render "StateSurface"')
  })

  it("reports forbidden legacy route-owned identifiers", async () => {
    const messages = await lintFile({
      filePath:
        "apps/web/src/app/_features/events-workspace/components/events-workspace-pages.tsx",
      options: {
        requiredComponents: ["AppSurface"],
        forbiddenIdentifiers: ["PageShell", "AppLoadingState"],
      },
      code: `
        function PageShell() {
          return <AppLoadingState />
        }

        export function EventsOpsPage() {
          return <AppSurface contract={surfaceContract} />
        }
      `,
    })

    expect(messages).toHaveLength(2)
    expect(
      messages.some((message) => message.message.includes('"PageShell"'))
    ).toBe(true)
    expect(
      messages.some((message) => message.message.includes('"AppLoadingState"'))
    ).toBe(true)
  })

  it("requires embedded mode for the settings route surface", async () => {
    const messages = await lintFile({
      filePath:
        "apps/web/src/app/_features/better-auth-settings/better-auth-settings-view.tsx",
      options: {
        requiredComponents: ["AppSurface", "StateSurface", "Settings"],
        requiredComponentProps: {
          Settings: ["embedded"],
        },
      },
      code: `
        export function BetterAuthSettingsView() {
          return (
            <AppSurface contract={contract}>
              <Settings view="account" />
              <StateSurface surfaceKind="workspace" kind="loading" title="Loading" description="Loading" />
            </AppSurface>
          )
        }
      `,
    })

    expect(messages).toHaveLength(1)
    expect(messages[0]?.message).toContain('"Settings"')
    expect(messages[0]?.message).toContain('"embedded"')
  })

  it("reports forbidden route-local shell wrappers when className drift is configured", async () => {
    const messages = await lintFile({
      filePath:
        "apps/web/src/app/_platform/shell/components/app-shell-route-state.tsx",
      options: {
        requiredComponents: ["AppSurface", "StateSurface"],
        forbiddenClassNameSnippets: ["ui-page"],
      },
      code: `
        export function AppShellRouteState() {
          return (
            <section className="ui-page ui-stack-relaxed">
              <AppSurface contract={contract} />
            </section>
          )
        }
      `,
    })

    expect(messages).toHaveLength(2)
    expect(
      messages.some((message) => message.message.includes('"StateSurface"'))
    ).toBe(true)
    expect(
      messages.some((message) => message.message.includes('"ui-page"'))
    ).toBe(true)
  })
})
