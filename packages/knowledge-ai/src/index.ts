import {
  knowledgeWorkflowPluginRegistryEntrySchema,
  type KnowledgeWorkflowPluginRegistryEntry,
} from "@afenda/knowledge-contracts"
import type { KnowledgeSearchResult } from "@afenda/knowledge-search"

export { runHybridSemanticKnowledgeSearch } from "./hybrid-search"

export type KnowledgeCitation = {
  readonly documentId: string
  readonly snippet: string
}

export type KnowledgeAnswer = {
  readonly answer: string
  readonly citations: readonly KnowledgeCitation[]
}

export type KnowledgeWorkflowPluginId =
  | "summary"
  | "action-items"
  | "follow-up-checklist"

export type KnowledgeWorkflowPluginRunInput = {
  readonly workspaceId: string
  readonly documentId: string
  readonly content: string
}

export type KnowledgeWorkflowPluginRunOutput = {
  readonly plugin: KnowledgeWorkflowPluginId
  readonly output: Record<string, unknown>
}

export type KnowledgeWorkflowPlugin = {
  readonly id: KnowledgeWorkflowPluginId
  run(input: KnowledgeWorkflowPluginRunInput): KnowledgeWorkflowPluginRunOutput
}

export function buildCitedKnowledgeAnswer(
  question: string,
  results: readonly KnowledgeSearchResult[]
): KnowledgeAnswer {
  const citations = results.slice(0, 3).map((item) => ({
    documentId: item.id,
    snippet: item.snippet,
  }))

  if (citations.length === 0) {
    return {
      answer: `No indexed knowledge found for: ${question}`,
      citations: [],
    }
  }

  return {
    answer: `Draft answer for: ${question}`,
    citations,
  }
}

const defaultWorkflowPlugins: Readonly<
  Record<KnowledgeWorkflowPluginId, KnowledgeWorkflowPlugin>
> = {
  summary: {
    id: "summary",
    run(input) {
      return {
        plugin: "summary",
        output: {
          headline: `Summary for ${input.documentId}`,
          workspaceId: input.workspaceId,
        },
      }
    },
  },
  "action-items": {
    id: "action-items",
    run(input) {
      return {
        plugin: "action-items",
        output: {
          items: [`Review document ${input.documentId}`],
          workspaceId: input.workspaceId,
        },
      }
    },
  },
  "follow-up-checklist": {
    id: "follow-up-checklist",
    run(input) {
      return {
        plugin: "follow-up-checklist",
        output: {
          checklist: ["Confirm owner", "Set due date"],
          workspaceId: input.workspaceId,
        },
      }
    },
  },
}

export function resolveKnowledgeWorkflowPlugin(
  pluginId: KnowledgeWorkflowPluginId,
  registry: Readonly<
    Partial<Record<KnowledgeWorkflowPluginId, KnowledgeWorkflowPlugin>>
  > = {}
): KnowledgeWorkflowPlugin {
  const plugin = registry[pluginId] ?? defaultWorkflowPlugins[pluginId]
  if (!plugin || plugin.id !== pluginId) {
    throw new Error(
      `Invalid knowledge workflow plugin registration for ${pluginId}.`
    )
  }
  return plugin
}

export type KnowledgeWorkflowPluginRegistry = Readonly<
  Partial<
    Record<KnowledgeWorkflowPluginId, KnowledgeWorkflowPluginRegistryEntry>
  >
>

export const DEFAULT_KNOWLEDGE_WORKFLOW_PLUGIN_REGISTRY: Required<KnowledgeWorkflowPluginRegistry> =
  {
    summary: knowledgeWorkflowPluginRegistryEntrySchema.parse({
      id: "summary",
      version: "1.0.0",
      owner: "afenda-knowledge",
      enabled: true,
      rollout: "ga",
    }),
    "action-items": knowledgeWorkflowPluginRegistryEntrySchema.parse({
      id: "action-items",
      version: "1.0.0",
      owner: "afenda-knowledge",
      enabled: true,
      rollout: "alpha",
    }),
    "follow-up-checklist": knowledgeWorkflowPluginRegistryEntrySchema.parse({
      id: "follow-up-checklist",
      version: "1.0.0",
      owner: "afenda-knowledge",
      enabled: true,
      rollout: "alpha",
    }),
  }

export function assertWorkflowPluginAllowed(
  pluginId: KnowledgeWorkflowPluginId,
  productRegistry: KnowledgeWorkflowPluginRegistry = {}
): void {
  const effective =
    productRegistry[pluginId] ??
    DEFAULT_KNOWLEDGE_WORKFLOW_PLUGIN_REGISTRY[pluginId]
  if (!effective) {
    throw new Error(`Unknown knowledge workflow plugin: ${pluginId}`)
  }
  if (!effective.enabled) {
    throw new Error(`Knowledge workflow plugin is disabled: ${pluginId}`)
  }
  if (effective.rollout === "off") {
    throw new Error(`Knowledge workflow plugin rollout is off: ${pluginId}`)
  }
  const semver = /^\d+\.\d+\.\d+$/u
  if (!semver.test(effective.version)) {
    throw new Error(
      `Knowledge workflow plugin version must be semver major.minor.patch: ${pluginId}@${effective.version}`
    )
  }
}

export function runKnowledgeWorkflowPluginAlpha(
  pluginId: KnowledgeWorkflowPluginId,
  input: KnowledgeWorkflowPluginRunInput,
  registry: Readonly<
    Partial<Record<KnowledgeWorkflowPluginId, KnowledgeWorkflowPlugin>>
  > = {},
  productRegistry: KnowledgeWorkflowPluginRegistry = {}
): KnowledgeWorkflowPluginRunOutput {
  assertWorkflowPluginAllowed(pluginId, productRegistry)
  const plugin = resolveKnowledgeWorkflowPlugin(pluginId, registry)
  const result = plugin.run(input)
  if (result.plugin !== pluginId) {
    throw new Error(`Plugin ${pluginId} returned mismatched output plugin id.`)
  }
  if (!result.output || typeof result.output !== "object") {
    throw new Error(`Plugin ${pluginId} returned invalid output payload.`)
  }
  return result
}
