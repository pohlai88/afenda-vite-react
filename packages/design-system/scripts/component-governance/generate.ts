import { generateGovernanceArtifacts } from "./core"

const result = await generateGovernanceArtifacts({ write: true })

console.log(
  [
    "Component governance artifacts generated.",
    `Primitives: ${result.registryPrimitives.length}`,
    `Artifacts: component-manifests.json, component-variants.json, component-coverage.json`,
  ].join(" ")
)
