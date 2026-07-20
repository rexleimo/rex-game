import { SITE_DISCLAIMER, TRUST_METRICS } from '@/content/site';

export function HomeTrust() {
  return (
    <div className="trust">
      <ul className="trust__metrics">
        {TRUST_METRICS.map((m) => (
          <li key={m.label}>
            <strong>{m.value}</strong>
            <span>{m.label}</span>
          </li>
        ))}
      </ul>
      <p className="trust__disclaimer">{SITE_DISCLAIMER}</p>
    </div>
  );
}
