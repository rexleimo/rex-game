import Link from 'next/link';

export function PlayCta({
  href,
  label,
  secondaryHref,
  secondaryLabel,
}: {
  href: string;
  label: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="play-cta-row">
      <Link className="btn-primary" href={href}>
        {label}
      </Link>
      {secondaryHref && secondaryLabel ? (
        <Link className="btn-secondary" href={secondaryHref}>
          {secondaryLabel}
        </Link>
      ) : null}
    </div>
  );
}
