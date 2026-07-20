'use client';

import { useState } from 'react';
import type { ActCharacter } from '../content/acts.ts';

export function DialogueBar({
  character,
  lines,
  onDone,
}: {
  character: ActCharacter;
  lines: string[];
  onDone?: () => void;
}) {
  const [index, setIndex] = useState(0);
  if (!lines.length) return null;
  const last = index >= lines.length - 1;

  return (
    <div className="th-dialog">
      <div className="th-avatar" aria-hidden="true">
        {character.avatar}
      </div>
      <div className="th-bubble">
        <div className="th-who">
          {character.name} · {character.role}
        </div>
        <p className="th-line">{lines[index]}</p>
      </div>
      <button
        type="button"
        className="th-next"
        onClick={() => {
          if (last) {
            setIndex(0);
            onDone?.();
          } else {
            setIndex((i) => i + 1);
          }
        }}
      >
        {last ? '开剪 ▸' : '继续 ▸'}
      </button>
      {lines.length > 1 ? (
        <button
          type="button"
          className="th-skip"
          onClick={() => {
            setIndex(0);
            onDone?.();
          }}
        >
          跳过
        </button>
      ) : null}
    </div>
  );
}
