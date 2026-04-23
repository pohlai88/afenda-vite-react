# Wave C.7 Shell Route-Handle Path Matrix

This matrix records the bounded retirement of the deleted shell route-handle path surface in the `web-runtime-shell` lane.

| Legacy path surface                                                                             | Live owner                                               | Decision                                                                                                                                   | Result                                                                             |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `apps/web/src/app/_platform/shell/types/shell-route-handle.ts` mentioned in shell contract/docs | `apps/web/src/app/_platform/shell/shell-route-handle.ts` | Retire the deleted `types/` path from contract and route documentation, and point all active truth surfaces at the live route-handle file. | Shell contract/docs now reference the real route-handle augmentation surface only. |
