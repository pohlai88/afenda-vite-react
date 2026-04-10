export interface ResolutionSpec {
  readonly key: string
  readonly type: 'auto' | 'manual' | 'assisted'
  readonly actionPath?: string
}

export interface ResolutionSuggestion {
  readonly id: string
  readonly problemKey: string
  readonly description: string
  readonly suggestedAction: string
  readonly confidence: number
  readonly doctrineRef?: string
  readonly resolution: ResolutionSpec
}
