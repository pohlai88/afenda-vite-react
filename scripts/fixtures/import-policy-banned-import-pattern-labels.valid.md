```ts
// valid: importPolicy.bannedImportPatternLabels lists semantic AST labels (e.g. barrel-import-in-feature)
// Example: pattern labels resolved by governance docs / ast-grep — not npm path strings.
```

Labels stay in `importPolicy`; path-level bans use `bannedImportPrefixes` / `bannedExactImportPaths`.
