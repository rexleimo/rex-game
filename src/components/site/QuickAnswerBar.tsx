export function QuickAnswerBar({ sentences }: { sentences: string[] }) {
  return (
    <div className="cqa">
      <div className="g-container cqa__inner">
        <span className="cqa__label">快速回答</span>
        <p className="cqa__text">{sentences.join('')}</p>
      </div>
    </div>
  );
}
