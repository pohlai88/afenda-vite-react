/** In-repo deterministic embedding (no external model). Replace with provider in production. */
export const KNOWLEDGE_EMBEDDING_MODEL_V1 =
  "afenda-deterministic-hash-v1" as const

export const DEFAULT_EMBEDDING_DIMENSIONS = 128

export function l2Normalize(vector: readonly number[]): number[] {
  let sum = 0
  for (const value of vector) {
    sum += value * value
  }
  const mag = Math.sqrt(sum)
  if (mag === 0) {
    return [...vector]
  }
  return vector.map((v) => v / mag)
}

/**
 * Hashing trick embedding: stable across runs, suitable for dev/test and lexical-adjacent ranking.
 * Swap for OpenAI/Vertex/etc. without changing call sites that consume normalized vectors.
 */
export function deterministicEmbedding(
  text: string,
  dimensions: number = DEFAULT_EMBEDDING_DIMENSIONS
): number[] {
  const v = new Array(dimensions).fill(0)
  const s = text.toLowerCase()
  for (let i = 0; i < s.length; i += 1) {
    const c = s.codePointAt(i) ?? 0
    const h = (c * 2_654_435_761 + i * 1_597_334_677) >>> 0
    const idx = h % dimensions
    v[idx] += ((c % 128) + 1) / 128
  }
  for (const word of s.split(/\W+/u)) {
    if (word.length === 0) {
      continue
    }
    for (let j = 0; j < word.length; j += 1) {
      const cp = word.codePointAt(j) ?? 0
      const h = cp * 31 + j
      const idx = Math.abs(h) % dimensions
      v[idx] += 0.12
    }
  }
  return l2Normalize(v)
}

export function cosineSimilarity(
  a: readonly number[],
  b: readonly number[]
): number {
  let dot = 0
  const len = Math.min(a.length, b.length)
  for (let i = 0; i < len; i += 1) {
    dot += a[i] * b[i]
  }
  return dot
}
