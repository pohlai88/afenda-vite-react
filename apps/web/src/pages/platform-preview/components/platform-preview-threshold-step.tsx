import { Link } from "react-router-dom"

import { truthChamberOrder } from "../data/platform-preview-truth-seed"

export function PlatformPreviewThresholdStep() {
  return (
    <section
      data-page="platform-preview"
      className="platform-truth-preview platform-truth-preview--threshold"
    >
      <div className="platform-truth-preview__threshold-copy">
        <p className="platform-truth-preview__eyebrow">
          AFENDA Three Chambers of Truth
        </p>
        <h1>
          Truth does not fail at the boardroom first. It fails when posting,
          reporting, and governance drift apart.
        </h1>
        <p>
          Enter the public chambers where regulated finance pain is made visible
          through distortion, evidence, governance, and resolution.
        </p>
      </div>

      <div className="platform-truth-preview__door-grid">
        {truthChamberOrder.map((chamber) => (
          <article
            key={chamber.chamberId}
            className="platform-truth-preview__door"
            data-chamber={chamber.chamberId}
          >
            <h2>{chamber.chamberTitle}</h2>
            <ul aria-label={`${chamber.chamberTitle} pain points`}>
              {chamber.painPoints.map((painPoint) => (
                <li key={painPoint}>{painPoint}</li>
              ))}
            </ul>
            <p>{chamber.riskLine}</p>
            <Link
              className="platform-truth-preview__door-action"
              to={`/platform-preview/${chamber.chamberId}`}
            >
              {chamber.entryActionLabel}
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
