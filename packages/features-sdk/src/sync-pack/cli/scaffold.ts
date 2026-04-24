#!/usr/bin/env node

import path from "node:path"

import { featureCategorySchema } from "../schema/category.schema.js"
import { writeTechStackScaffold } from "../scaffold/stack-scaffold.js"
import { findWorkspaceRoot } from "../workspace.js"

import {
  parseCliCommand,
  printCommandHelp,
  requireSyncPackCommandDefinition,
  runCli,
} from "./shared.js"

const command = requireSyncPackCommandDefinition("scaffold")

await runCli(async () => {
  const cli = parseCliCommand(command)

  if (cli.helpRequested) {
    printCommandHelp(command)
    return
  }

  const workspaceRoot = findWorkspaceRoot()
  const appId = cli.getOptionValue("--app-id") ?? "sync-pack-app"
  const category = featureCategorySchema.parse(
    cli.getOptionValue("--category") ?? "mini-developer"
  )
  const packageName = cli.getOptionValue("--package-name")
  const outputDirectory =
    cli.getOptionValue("--out") ??
    path.join(workspaceRoot, ".artifacts", "sync-pack-scaffold", appId)
  const result = await writeTechStackScaffold({
    appId,
    category,
    packageName,
    outputDirectory,
    workspaceRoot,
  })

  console.log(
    `Generated Sync-Pack scaffold for ${result.manifest.packageName}.`
  )
  console.log(`Output: ${result.outputDirectory}`)
  console.log(`Files: ${result.writtenFiles.length}`)
}, "Feature Sync-Pack scaffold")
