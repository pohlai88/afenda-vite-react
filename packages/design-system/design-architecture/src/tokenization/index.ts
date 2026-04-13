/**
 * Public barrel for `@afenda/design-system/tokenization` (and legacy `./tokens`).
 *
 * Subpath exports in package.json point here; keep exports stable for consumers.
 *
 * **Integration map:** see `pipeline.ts` for compile order and default re-exports.
 */

export * from '../governance'
export * from './pipeline'
export * from './shadcn-registry'
export * from './token-bridge'
export * from './token-color-collision-policy'
export * from './token-constants'
export * from './token-contract'
export * from './token-emit'
export * from './token-manifest'
export * from './token-pipeline-order'
export * from './token-normalize'
export * from './token-serialize'
export * from './token-source'
export * from './token-tailwind-adapter'
export * from './token-text'
export * from './token-types'
