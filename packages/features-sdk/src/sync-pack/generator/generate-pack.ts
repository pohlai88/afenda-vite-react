import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  appCandidateSchema,
  type AppCandidate,
} from "../schema/candidate.schema.js"
import { getTechStackForCategory } from "../schema/tech-stack.schema.js"
import {
  getRequiredPackFileNames,
  packTemplateEntries,
  type PackFileName,
} from "../schema/pack-template.schema.js"
import { scoreCandidate } from "../scoring/score-candidate.js"
import { resolveGeneratedPacksPath } from "../workspace.js"

import {
  renderBulletList,
  renderTechStack,
  renderTemplate,
  renderTitle,
  renderYesNo,
  type TemplateContext,
} from "./render-template.js"

const templateRoot = fileURLToPath(new URL("../templates/", import.meta.url))

export interface GenerateFeaturePackOptions {
  readonly candidate: unknown
  readonly outputDirectory?: string
}

export interface GenerateFeaturePackResult {
  readonly candidate: AppCandidate
  readonly packDirectory: string
  readonly writtenFiles: readonly string[]
}

function buildPackContext(candidate: AppCandidate): TemplateContext {
  const score = scoreCandidate(candidate)
  const techStack = getTechStackForCategory(candidate.internalCategory)

  return {
    "candidate.id": candidate.id,
    "candidate.name": candidate.name,
    "candidate.source": candidate.source,
    "candidate.sourceUrl": candidate.sourceUrl,
    "candidate.sourceCategory": candidate.sourceCategory,
    "candidate.internalCategory": candidate.internalCategory,
    "candidate.internalCategoryTitle": renderTitle(candidate.internalCategory),
    "candidate.lane": candidate.lane,
    "candidate.priority": candidate.priority,
    "candidate.buildMode": candidate.buildMode,
    "candidate.internalUseCase": candidate.internalUseCase,
    "candidate.openSourceReferences": renderBulletList(
      candidate.openSourceReferences
    ),
    "candidate.licenseReviewRequired": renderYesNo(
      candidate.licenseReviewRequired
    ),
    "candidate.securityReviewRequired": renderYesNo(
      candidate.securityReviewRequired
    ),
    "candidate.dataSensitivity": candidate.dataSensitivity,
    "candidate.ownerTeam": candidate.ownerTeam,
    "candidate.status": candidate.status,
    "score.recommendedPriority": score.recommendedPriority,
    "score.total": String(score.score),
    "score.reasons": renderBulletList(score.reasons),
    "techStack.default": renderTechStack(techStack.defaultStack),
    "techStack.categoryOverride": renderBulletList(techStack.categoryOverride),
  }
}

async function renderMarkdownFile(
  fileName: PackFileName,
  context: TemplateContext
): Promise<string> {
  const template = await readFile(path.join(templateRoot, fileName), "utf8")
  return renderTemplate(template, context)
}

export async function generateFeaturePack(
  options: GenerateFeaturePackOptions
): Promise<GenerateFeaturePackResult> {
  const candidate = appCandidateSchema.parse(options.candidate)
  const outputDirectory = options.outputDirectory ?? resolveGeneratedPacksPath()
  const packDirectory = path.join(
    outputDirectory,
    candidate.internalCategory,
    candidate.id
  )
  const context = buildPackContext(candidate)
  const writtenFiles: string[] = []

  await mkdir(packDirectory, { recursive: true })

  const requiredFiles = getRequiredPackFileNames()
  for (const fileName of requiredFiles) {
    const outputPath = path.join(packDirectory, fileName)

    if (fileName === "00-candidate.json") {
      await writeFile(
        outputPath,
        `${JSON.stringify(candidate, null, 2)}\n`,
        "utf8"
      )
    } else {
      await writeFile(
        outputPath,
        await renderMarkdownFile(fileName, context),
        "utf8"
      )
    }

    writtenFiles.push(outputPath)
  }

  const expectedFileCount = packTemplateEntries.length
  if (writtenFiles.length !== expectedFileCount) {
    throw new Error(
      `Generated ${writtenFiles.length} files, expected ${expectedFileCount}.`
    )
  }

  return {
    candidate,
    packDirectory,
    writtenFiles,
  }
}
