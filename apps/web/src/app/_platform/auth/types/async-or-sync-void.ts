/**
 * Handlers that may be sync or async. Using this alias avoids `() => Promise<void>`
 * patterns that trip the repo's i18n JSX scanner (`=>` … `Promise<` looks like `>…<` text).
 */
export type AsyncOrSyncVoid = void | Promise<void>
