export type { AppCandidate } from "./schema/candidate.schema.js"
export {
  appCandidateArraySchema,
  appCandidateSchema,
} from "./schema/candidate.schema.js"
export type { CandidateSelection } from "./candidate-selection.js"
export {
  candidateSelectionSchema,
  describeCandidateSelection,
  filterCandidates,
  hasCandidateSelection,
} from "./candidate-selection.js"
export type { FeatureCategory, FeatureLane } from "./schema/category.schema.js"
export {
  categoryLaneMap,
  featureCategories,
  featureCategorySchema,
  featureLanes,
  featureLaneSchema,
  getFeatureLane,
} from "./schema/category.schema.js"
export type { AppPriority } from "./schema/priority.schema.js"
export { appPriorities, appPrioritySchema } from "./schema/priority.schema.js"
export type {
  BuildMode,
  CandidateStatus,
  DataSensitivity,
} from "./schema/review.schema.js"
export {
  buildModeSchema,
  buildModes,
  candidateStatusSchema,
  candidateStatuses,
  dataSensitivities,
  dataSensitivitySchema,
} from "./schema/review.schema.js"
export type {
  PackFileName,
  PackTemplateKind,
} from "./schema/pack-template.schema.js"
export {
  getRequiredPackFileNames,
  packFileNameSchema,
  packFileNames,
  packTemplateEntries,
  packTemplateEntrySchema,
  packTemplateKindSchema,
  packTemplateKinds,
  packTemplateSchema,
} from "./schema/pack-template.schema.js"
export type {
  TechStackMatrix,
  TechStackRecommendation,
} from "./schema/tech-stack.schema.js"
export {
  categoryTechStackOverrides,
  defaultTechStack,
  getAllTechStackRecommendations,
  getTechStackForCategory,
  techStackMatrix,
  techStackMatrixSchema,
  techStackRecommendationSchema,
  techStackSectionSchema,
} from "./schema/tech-stack.schema.js"
export type {
  DependencyVersionSource,
  StackDependency,
  StackDependencyGroup,
  StackScaffoldManifest,
  StackScaffoldPlacement,
  StackRouteSuggestion,
  StackRouteSurface,
} from "./schema/stack-contract.schema.js"
export {
  dependencyVersionSourceSchema,
  stackDependencyGroupSchema,
  stackDependencySchema,
  stackRouteSuggestionSchema,
  stackRouteSurfaceSchema,
  stackScaffoldManifestSchema,
  stackScaffoldPlacementSchema,
} from "./schema/stack-contract.schema.js"
export type { CandidatePriorityScore } from "./scoring/score-candidate.js"
export { scoreCandidate } from "./scoring/score-candidate.js"
export {
  criticalPrioritySignals,
  essentialPrioritySignals,
  priorityScoreThresholds,
  priorityScoreWeights,
} from "./scoring/priority-rules.js"
export type {
  GenerateFeaturePackOptions,
  GenerateFeaturePackResult,
} from "./generator/generate-pack.js"
export { generateFeaturePack } from "./generator/generate-pack.js"
export type {
  CandidateReportGroups,
  CandidateReportOptions,
} from "./generator/generate-report.js"
export {
  generateCandidateReport,
  groupCandidates,
} from "./generator/generate-report.js"
export type {
  WriteTechStackScaffoldOptions,
  WriteTechStackScaffoldResult,
} from "./scaffold/stack-scaffold.js"
export {
  createTechStackScaffoldManifest,
  writeTechStackScaffold,
} from "./scaffold/stack-scaffold.js"
export {
  readWorkspaceCatalogVersions,
  type WorkspaceCatalogVersions,
} from "./scaffold/workspace-catalog.js"
export type {
  RunSyncPackDoctorOptions,
  SyncPackDoctorFinding,
  SyncPackDoctorResult,
  SyncPackDoctorSeverity,
} from "./doctor/stack-doctor.js"
export { runSyncPackDoctor } from "./doctor/stack-doctor.js"
export type {
  CheckGeneratedPacksOptions,
  SyncPackCheckFinding,
  SyncPackCheckResult,
  SyncPackCheckSeverity,
} from "./check/pack-check.js"
export { checkGeneratedPacks } from "./check/pack-check.js"
export type {
  SyncPackFinding,
  SyncPackFindingRemediation,
  SyncPackFindingResult,
  SyncPackFindingSeverity,
} from "./finding.js"
export {
  countFindings,
  createFindingRemediation,
  syncPackFindingContractId,
} from "./finding.js"
export type {
  CheckFeatureSdkPackageContractOptions,
  FeatureSdkPackageContractFinding,
  FeatureSdkPackageContractResult,
  FeatureSdkPackageContractSeverity,
} from "./package-contract.js"
export {
  checkFeatureSdkPackageContract,
  featureSdkPackageContractId,
} from "./package-contract.js"
export type {
  RunSyncPackValidateOptions,
  SyncPackValidateFinding,
  SyncPackValidateResult,
  SyncPackValidateSeverity,
} from "./validate/index.js"
export { runSyncPackValidate } from "./validate/index.js"
export type {
  RunSyncPackVerifyOptions,
  SyncPackVerifyFinding,
  SyncPackVerifyResult,
  SyncPackVerifySeverity,
  SyncPackVerifyStatus,
  SyncPackVerifyStepName,
  SyncPackVerifyStepResult,
  SyncPackVerifyVerdict,
} from "./verify/index.js"
export {
  runSyncPackVerify,
  summarizeSyncPackVerifyResult,
  summarizeSyncPackVerifyStep,
} from "./verify/index.js"
export type {
  RunSyncPackQualityValidationOptions,
  SyncPackQualityValidationDisposition,
  SyncPackQualityValidationFinding,
  SyncPackQualityValidationPhase,
  SyncPackQualityValidationResult,
  SyncPackQualityValidationStatus,
  SyncPackQualityValidationStepName,
  SyncPackQualityValidationStepResult,
  SyncPackQualityValidationVerdict,
} from "./quality-validation/index.js"
export {
  runSyncPackQualityValidation,
  type ExternalCommandResult,
  type ExternalCommandRunner,
  type ExternalCommandSpec,
} from "./quality-validation/index.js"
export {
  findFeaturesSdkRoot,
  findWorkspaceRoot,
  readSeedCandidates,
  resolveGeneratedPacksPath,
  resolveSeedPath,
} from "./workspace.js"
