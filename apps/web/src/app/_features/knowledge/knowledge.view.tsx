import { useState } from "react"

import {
  addKnowledgeRelation,
  addKnowledgeComment,
  addKnowledgeRevision,
  answerKnowledge,
  captureKnowledge,
  extractKnowledgeEntities,
  getKnowledgeIntelligenceKpis,
  listKnowledgeActivity,
  listKnowledgeComments,
  listKnowledgeRelations,
  listKnowledgeRevisions,
  runKnowledgeWorkflowAlpha,
  searchKnowledgeSemantic,
  searchKnowledge,
} from "./knowledge.api"

const demoWorkspaceId = "knowledge-demo-workspace"

export function KnowledgePage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tagsInput, setTagsInput] = useState("")
  const [parentDocumentId, setParentDocumentId] = useState("")
  const [backlinksInput, setBacklinksInput] = useState("")
  const [query, setQuery] = useState("")
  const [selectedDocumentId, setSelectedDocumentId] = useState("")
  const [commentBody, setCommentBody] = useState("")
  const [revisionSummary, setRevisionSummary] = useState("")
  const [resultCount, setResultCount] = useState<number | null>(null)
  const [commentCount, setCommentCount] = useState<number | null>(null)
  const [revisionCount, setRevisionCount] = useState<number | null>(null)
  const [activityCount, setActivityCount] = useState<number | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [semanticCount, setSemanticCount] = useState<number | null>(null)
  const [citationCount, setCitationCount] = useState<number | null>(null)
  const [relationCount, setRelationCount] = useState<number | null>(null)
  const [entityCount, setEntityCount] = useState<number | null>(null)
  const [workflowStatus, setWorkflowStatus] = useState<string | null>(null)
  const [kpiSummary, setKpiSummary] = useState<string | null>(null)

  async function handleCapture() {
    const tags = tagsInput
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
    const backlinks = backlinksInput
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

    setStatus("Saving...")
    await captureKnowledge({
      workspaceId: demoWorkspaceId,
      title,
      content,
      tags,
      parentDocumentId: parentDocumentId.trim() || undefined,
      backlinks,
      source: "editor",
    })
    setStatus("Saved knowledge entry.")
  }

  async function handleSearch() {
    setStatus("Searching...")
    const response = await searchKnowledge({
      workspaceId: demoWorkspaceId,
      query,
    })

    if (!response.ok) {
      setResultCount(0)
      setStatus("Search failed.")
      return
    }

    setResultCount(response.data.length)
    setStatus("Search completed.")
  }

  async function handleAddComment() {
    setStatus("Adding comment...")
    await addKnowledgeComment({
      workspaceId: demoWorkspaceId,
      documentId: selectedDocumentId,
      body: commentBody,
      mentions: [],
    })
    setStatus("Comment added.")
  }

  async function handleAddRevision() {
    setStatus("Adding revision...")
    await addKnowledgeRevision({
      workspaceId: demoWorkspaceId,
      documentId: selectedDocumentId,
      summary: revisionSummary,
    })
    setStatus("Revision added.")
  }

  async function handleLoadCollaboration() {
    setStatus("Loading collaboration data...")
    const [commentsResponse, revisionsResponse, activityResponse] =
      await Promise.all([
        listKnowledgeComments({
          workspaceId: demoWorkspaceId,
          documentId: selectedDocumentId,
        }),
        listKnowledgeRevisions({
          workspaceId: demoWorkspaceId,
          documentId: selectedDocumentId,
        }),
        listKnowledgeActivity({
          workspaceId: demoWorkspaceId,
          documentId: selectedDocumentId,
        }),
      ])

    setCommentCount(commentsResponse.data.length)
    setRevisionCount(revisionsResponse.data.length)
    setActivityCount(activityResponse.data.length)
    setStatus("Collaboration data loaded.")
  }

  async function handlePhase3Semantic() {
    setStatus("Running semantic search and cited answer...")
    const [semanticRes, answerRes] = await Promise.all([
      searchKnowledgeSemantic({
        workspaceId: demoWorkspaceId,
        query,
      }),
      answerKnowledge({
        workspaceId: demoWorkspaceId,
        query,
      }),
    ])
    setSemanticCount(semanticRes.data.length)
    setCitationCount(answerRes.data.citations.length)
    setStatus("Phase 3 semantic response loaded.")
  }

  async function handlePhase3RelationsEntities() {
    setStatus("Linking relation + extracting entities...")
    await addKnowledgeRelation({
      workspaceId: demoWorkspaceId,
      fromDocumentId: selectedDocumentId,
      relationType: "related_to",
      toDocumentId: selectedDocumentId,
      confidence: 0.8,
    })

    const [relationsRes, entitiesRes] = await Promise.all([
      listKnowledgeRelations({
        workspaceId: demoWorkspaceId,
        documentId: selectedDocumentId,
      }),
      extractKnowledgeEntities({
        workspaceId: demoWorkspaceId,
        documentId: selectedDocumentId,
      }),
    ])
    setRelationCount(relationsRes.data.length)
    setEntityCount(entitiesRes.data.length)
    setStatus("Phase 3 relations/entities loaded.")
  }

  async function handlePhase3WorkflowAlpha() {
    setStatus("Running workflow alpha plugin...")
    const workflowRes = await runKnowledgeWorkflowAlpha({
      workspaceId: demoWorkspaceId,
      documentId: selectedDocumentId,
      plugin: "summary",
    })
    setWorkflowStatus(String(workflowRes.data.output.status ?? "generated"))
    setStatus("Workflow alpha completed.")
  }

  async function handleLoadIntelligenceKpis() {
    setStatus("Loading intelligence KPIs...")
    const kpiRes = await getKnowledgeIntelligenceKpis({
      workspaceId: demoWorkspaceId,
    })
    setKpiSummary(
      `semantic=${kpiRes.data.semanticQueryCount}, answers=${kpiRes.data.answerQueryCount}, citations=${kpiRes.data.totalCitationCount}, relations=${kpiRes.data.relationCount}, entities=${kpiRes.data.entityExtractionCount}, workflows=${kpiRes.data.workflowRunCount}`
    )
    setStatus("Intelligence KPIs loaded.")
  }

  return (
    <section style={{ display: "grid", gap: 12, maxWidth: 720 }}>
      <h2>Knowledge Workspace (Phase 1 scaffold)</h2>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Knowledge title"
      />
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Capture team knowledge"
        rows={6}
      />
      <input
        value={tagsInput}
        onChange={(event) => setTagsInput(event.target.value)}
        placeholder="Tags (comma separated)"
      />
      <input
        value={parentDocumentId}
        onChange={(event) => setParentDocumentId(event.target.value)}
        placeholder="Parent document ID (tree-ready, optional)"
      />
      <input
        value={backlinksInput}
        onChange={(event) => setBacklinksInput(event.target.value)}
        placeholder="Backlink document IDs (comma separated)"
      />
      <button type="button" onClick={() => void handleCapture()}>
        Capture
      </button>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search knowledge"
      />
      <button type="button" onClick={() => void handleSearch()}>
        Search
      </button>
      <hr />
      <h3>Phase 2 Collaboration</h3>
      <input
        value={selectedDocumentId}
        onChange={(event) => setSelectedDocumentId(event.target.value)}
        placeholder="Document ID for comments/revisions/activity"
      />
      <input
        value={commentBody}
        onChange={(event) => setCommentBody(event.target.value)}
        placeholder="Comment body"
      />
      <button type="button" onClick={() => void handleAddComment()}>
        Add comment
      </button>
      <input
        value={revisionSummary}
        onChange={(event) => setRevisionSummary(event.target.value)}
        placeholder="Revision summary"
      />
      <button type="button" onClick={() => void handleAddRevision()}>
        Add revision
      </button>
      <button type="button" onClick={() => void handleLoadCollaboration()}>
        Load comments/revisions/activity
      </button>
      <hr />
      <h3>Phase 3 Truth Intelligence</h3>
      <button type="button" onClick={() => void handlePhase3Semantic()}>
        Run semantic search + cited answer
      </button>
      <button
        type="button"
        onClick={() => void handlePhase3RelationsEntities()}
      >
        Link relation + extract entities
      </button>
      <button type="button" onClick={() => void handlePhase3WorkflowAlpha()}>
        Run workflow alpha plugin
      </button>
      <button type="button" onClick={() => void handleLoadIntelligenceKpis()}>
        Load intelligence KPIs
      </button>
      {resultCount !== null ? <p>Results: {resultCount}</p> : null}
      {commentCount !== null ? <p>Comments: {commentCount}</p> : null}
      {revisionCount !== null ? <p>Revisions: {revisionCount}</p> : null}
      {activityCount !== null ? <p>Activity events: {activityCount}</p> : null}
      {semanticCount !== null ? <p>Semantic results: {semanticCount}</p> : null}
      {citationCount !== null ? <p>Citations: {citationCount}</p> : null}
      {relationCount !== null ? <p>Relations: {relationCount}</p> : null}
      {entityCount !== null ? <p>Entities: {entityCount}</p> : null}
      {workflowStatus ? <p>Workflow status: {workflowStatus}</p> : null}
      {kpiSummary ? <p>KPI: {kpiSummary}</p> : null}
      {status ? <p>{status}</p> : null}
    </section>
  )
}
