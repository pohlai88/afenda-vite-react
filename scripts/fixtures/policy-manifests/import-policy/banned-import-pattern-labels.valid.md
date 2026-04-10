```ts
// valid: importPolicy.bannedImportPatternLabels lists semantic AST labels (e.g. barrel-import-in-feature)
// resolved by scripts/check-ui-drift-ast.ts — not npm path strings.
```

Labels stay in `importPolicy`; path-level bans use `bannedImportPrefixes` / `bannedExactImportPaths`.
