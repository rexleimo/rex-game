export function QuickAnswer({ sentences }: { sentences: string[] }) {
  return (
    <div className="quick-answer">
      <p className="quick-answer__label">快速回答</p>
      {sentences.map((sentence) => (
        <p key={sentence.slice(0, 32)}>{sentence}</p>
      ))}
    </div>
  );
}
