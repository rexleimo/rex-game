import Link from 'next/link';

export function HeroBand({
  kicker,
  title,
  lead,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  altar = false,
}: {
  kicker?: string;
  title: string;
  lead: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  altar?: boolean;
}) {
  return (
    <section className={altar ? 'site-hero site-hero--altar' : 'site-hero'}>
      {kicker ? <p className="site-hero__kicker">{kicker}</p> : null}
      <h1>{title}</h1>
      <p className="site-hero__lead">{lead}</p>
      <div className="site-hero__actions">
        <Link className="btn-primary" href={primaryHref}>
          {primaryLabel}
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link className="btn-secondary" href={secondaryHref}>
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
