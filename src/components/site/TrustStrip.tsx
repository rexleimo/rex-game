import { TRUST_METRICS } from '@/content/site';

export function TrustStrip({
  items = TRUST_METRICS,
}: {
  items?: readonly { value: string; label: string }[];
}) {
  return (
    <div className="trust-strip" role="list">
      {items.map((item) => (
        <div key={item.label} role="listitem">
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
