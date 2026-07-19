export function SectionHeader({
  index,
  eyebrow,
  title,
}: {
  index: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className="section-header">
      <span className="section-header__index">{index}</span>
      <div>
        {eyebrow ? <p>{eyebrow}</p> : null}
        <h2>{title}</h2>
      </div>
    </div>
  );
}
