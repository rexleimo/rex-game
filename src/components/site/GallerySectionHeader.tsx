export function GallerySectionHeader({
  index,
  title,
  note,
}: {
  index: string;
  title: string;
  note?: string;
}) {
  return (
    <div className="gsh">
      <span className="gsh__index">{index}</span>
      <h2 className="gsh__title">{title}</h2>
      {note ? <span className="gsh__note">{note}</span> : null}
    </div>
  );
}
