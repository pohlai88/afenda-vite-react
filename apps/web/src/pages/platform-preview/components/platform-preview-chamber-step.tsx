import { useEffect, useMemo, useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"

import {
  DEFAULT_TRUTH_CHAMBER,
  getTruthChamberSeed,
  getLegacyChamberRedirect,
  isTruthChamberId,
} from "../data/platform-preview-truth-seed"
import { createTruthChamberViewModel } from "../services/platform-preview-orchestration-service"
import type { TruthCaseId } from "../types/platform-preview-orchestration-types"

export function PlatformPreviewChamberStep() {
  const { chamber } = useParams<{ chamber: string }>()

  if (!isTruthChamberId(chamber)) {
    const legacyRedirect = getLegacyChamberRedirect(chamber)
    if (legacyRedirect !== DEFAULT_TRUTH_CHAMBER) {
      return <Navigate replace to={`/platform-preview/${legacyRedirect}`} />
    }
    return <Navigate replace to={`/platform-preview/${DEFAULT_TRUTH_CHAMBER}`} />
  }

  const chamberSeed = getTruthChamberSeed(chamber)
  const [activeCaseId, setActiveCaseId] = useState<TruthCaseId>(
    chamberSeed.defaultCaseId
  )

  useEffect(() => {
    setActiveCaseId(chamberSeed.defaultCaseId)
  }, [chamberSeed.defaultCaseId])

  const model = useMemo(
    () => createTruthChamberViewModel(chamber, activeCaseId),
    [activeCaseId, chamber]
  )

  return (
    <main
      id="platform-preview-page"
      data-page="platform-preview"
      data-chamber={model.chamberId}
      data-case={model.activeCaseId}
      className="platform-truth-preview platform-truth-preview--chamber"
    >
      <header className="platform-truth-preview__mast">
        <div className="platform-truth-preview__mast-copy">
          <Link className="platform-truth-preview__back-link" to="/platform-preview">
            Threshold
          </Link>
          <p className="platform-truth-preview__eyebrow">{model.doctrineLine}</p>
          <h1>{model.chamberTitle}</h1>
          <p>{model.chamberSubtitle}</p>
        </div>
        <div className="platform-truth-preview__mast-meta">
          <p className="platform-truth-preview__meta-label">Visual posture</p>
          <strong>{model.visualTone}</strong>
        </div>
      </header>

      <section
        className="platform-truth-preview__case-selector"
        aria-label={`${model.chamberTitle} cases`}
      >
        {model.cases.map((entry) => (
          <button
            key={entry.caseId}
            type="button"
            data-active={entry.caseId === model.activeCaseId}
            onClick={() => setActiveCaseId(entry.caseId)}
          >
            <strong>{entry.caseTitle}</strong>
            <span>{entry.caseSignal}</span>
          </button>
        ))}
      </section>

      <section className="platform-truth-preview__risk-band" aria-label="Statutory risk line">
        <p className="platform-truth-preview__risk-line">{model.riskLine}</p>
        <p className="platform-truth-preview__risk-posture">
          {model.statutoryPosture}
        </p>
      </section>

      <section className="platform-truth-preview__rails">
        {model.activeCase.rails.map((rail) => (
          <article
            key={rail.railId}
            className="platform-truth-preview__rail"
            data-rail={rail.railId}
            data-severity={rail.riskSeverity}
          >
            <header>
              <p className="platform-truth-preview__eyebrow">{rail.eyebrow}</p>
              <h2>{rail.headline}</h2>
            </header>
            <p>{rail.body}</p>
            <dl>
              {rail.fixtureItems.map((item) => (
                <div key={item.id}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </section>

      <footer className="platform-truth-preview__consequence">
        <p>{model.activeCase.caseConsequence}</p>
      </footer>
    </main>
  )
}
