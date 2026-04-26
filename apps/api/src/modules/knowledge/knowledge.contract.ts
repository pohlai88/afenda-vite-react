export const knowledgeDocumentViewPermission = "ops:event:view" as const
export const knowledgeDocumentWritePermission =
  "admin:workspace:manage" as const

export type KnowledgePermission =
  | typeof knowledgeDocumentViewPermission
  | typeof knowledgeDocumentWritePermission
