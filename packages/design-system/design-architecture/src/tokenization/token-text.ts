/**
 * TOKEN TEXT
 *
 * Shared newline and section-gap strings for serialization and emit so byte boundaries stay aligned.
 *
 * Pipeline: shared formatting between `token-serialize` (fragments) and `token-emit` (final artifact).
 *
 * Rules:
 * - string constants only; no logic
 * - consumed by `token-serialize.ts` and `token-emit.ts`
 */

/** Single line break (declarations, header lines, inner blocks). */
export const TOKEN_LINE_BREAK = '\n' as const

/** Blank line between major fragments (serialized sections, header/body, adjacent @keyframes). */
export const TOKEN_SECTION_GAP = '\n\n' as const
