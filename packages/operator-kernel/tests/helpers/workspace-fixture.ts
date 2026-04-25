import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

export const repoRoot = path.resolve(
  fileURLToPath(new URL("../../../../", import.meta.url))
)

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8")
}

export async function createSyncPackWorkspaceFixture(): Promise<string> {
  const workspaceRoot = await mkdtemp(
    path.join(os.tmpdir(), "operator-kernel-sync-pack-ws-")
  )

  await writeFile(
    path.join(workspaceRoot, "pnpm-workspace.yaml"),
    `packages:
  - "apps/*"
  - "packages/*"

catalog:
  zod: ^4.3.6
  vite: 7.3.2
  vitest: ^4.1.4
  typescript: ~5.9.3
  drizzle-orm: ^0.45.1
  "@types/node": ^24.12.2
  "@types/react": ^19.2.14
  "@types/react-dom": ^19.2.3
  eslint: ^9.39.4
`,
    "utf8"
  )

  await writeJson(path.join(workspaceRoot, "package.json"), {
    name: "fixture",
    private: true,
    devDependencies: {
      eslint: "catalog:",
      tsx: "^4.21.0",
    },
  })

  await writeJson(path.join(workspaceRoot, "apps", "web", "package.json"), {
    name: "@afenda/web-fixture",
    dependencies: {
      react: "^19.2.4",
      "react-dom": "^19.2.4",
      "@tanstack/react-query": "^5.96.2",
      "react-router-dom": "^7.14.0",
      "radix-ui": "^1.4.3",
      "class-variance-authority": "^0.7.1",
      hono: "^4.12.10",
      zod: "catalog:",
    },
    devDependencies: {
      tailwindcss: "^4.2.2",
      "@tailwindcss/vite": "^4.2.2",
      "@vitejs/plugin-react": "^5.2.0",
      vite: "catalog:",
      vitest: "catalog:",
      typescript: "catalog:",
    },
  })

  return workspaceRoot
}

export async function removeWorkspaceFixture(
  workspaceRoot: string
): Promise<void> {
  await rm(workspaceRoot, { recursive: true, force: true })
}
