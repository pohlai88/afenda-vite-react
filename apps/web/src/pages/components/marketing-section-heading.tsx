export function MarketingSectionHeading(props: {
  readonly eyebrow?: string
  readonly title: string
  readonly description?: string
  /** Optional id for the section title (e.g. `aria-labelledby` on `<section>`). */
  readonly titleId?: string
}) {
  const { eyebrow, title, description, titleId } = props

  return (
    <div className="space-y-2">
      {eyebrow ? <p className="ui-marketing-eyebrow">{eyebrow}</p> : null}
      <div className="space-y-1">
        <h2 className="ui-title-section text-balance" id={titleId}>
          {title}
        </h2>
        {description ? (
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}
