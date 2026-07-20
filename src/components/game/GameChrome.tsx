import type { ReactNode } from 'react';

export interface GameChromeProps {
  title: string;
  edition?: string;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
}

/** 沉浸式游戏顶栏：返回展厅 / 标题 / 副标。class 前缀 gs-，样式见 game-shell.css */
export function GameChrome({
  title,
  edition,
  backHref = '/',
  backLabel = '返回展厅',
  children,
}: GameChromeProps) {
  return (
    <div className="gs-root">
      <header className="gs-head">
        <a className="gs-back" href={backHref} aria-label="返回首页">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
            <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {backLabel}
        </a>
        <h1 className="gs-title">{title}</h1>
        {edition ? <span className="gs-edition">{edition}</span> : <span className="gs-edition" />}
      </header>
      <div className="gs-body">{children}</div>
    </div>
  );
}
