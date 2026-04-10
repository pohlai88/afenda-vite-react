```ts
// invalid: treating a barrel label as a path ban — do not add "barrel-import-in-feature" to bannedExactImportPaths
```

Module-boundary semantics belong in `bannedImportPatternLabels` and the AST checker (`UIX-AST-IMPORT-005`), not as a package path.
