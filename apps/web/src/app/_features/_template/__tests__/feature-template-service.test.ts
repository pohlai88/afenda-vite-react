import { describe, expect, it } from "vitest"

import { fetchFeatureTemplate } from "../services/feature-template-service"

describe("fetchFeatureTemplate", () => {
  it("returns a fresh feature definition for each request", async () => {
    const first = await fetchFeatureTemplate("events")
    const second = await fetchFeatureTemplate("events")

    expect(first).toEqual(second)
    expect(first).not.toBe(second)
    expect(first.metrics).not.toBe(second.metrics)
    expect(first.records).not.toBe(second.records)
    expect(first.metrics[0]).not.toBe(second.metrics[0])
    expect(first.records[0]).not.toBe(second.records[0])
  })

  it("does not leak consumer mutations back into the seed store", async () => {
    const feature = await fetchFeatureTemplate("audit")

    ;(feature as { title: string }).title = "Mutated feature"
    ;(feature.metrics as unknown as FeatureTemplateMutableMetric[])[0].label =
      "Mutated metric"
    ;(feature.records as unknown as FeatureTemplateMutableRecord[])[0].title =
      "Mutated record"

    const fresh = await fetchFeatureTemplate("audit")

    expect(fresh.title).toBe("Audit trail")
    expect(fresh.metrics[0]?.label).toBe("Open findings")
    expect(fresh.records[0]?.title).toBe(
      "Policy override requires justification"
    )
  })
})

type FeatureTemplateMutableMetric = {
  label: string
}

type FeatureTemplateMutableRecord = {
  title: string
}
