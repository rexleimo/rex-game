'use client';

import { useEffect, useRef } from 'react';

export function HeroInstallation() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-depth]'));
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        for (const el of layers) {
          const depth = Number(el.dataset.depth ?? 0);
          el.style.transform = `translate3d(0, ${(-y * depth).toFixed(1)}px, 0)`;
        }
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div ref={ref} className="hi" aria-hidden="true">
      <span className="hi__layer hi__ring" data-depth="0.06">
        <svg className="hi__float-slow" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(201,162,75,0.55)" strokeWidth="1" />
        </svg>
      </span>
      <span className="hi__layer hi__diamond" data-depth="0.12">
        <svg className="hi__float-mid" viewBox="0 0 64 64">
          <polygon points="32,2 62,32 32,62 2,32" fill="#C82E21" />
          <polygon points="32,14 50,32 32,50 14,32" fill="#0A0705" />
          <polygon points="32,22 42,32 32,42 22,32" fill="#D23627" />
        </svg>
      </span>
      <span className="hi__layer hi__crescent-a" data-depth="0.18">
        <svg className="hi__float-fast" viewBox="0 0 27 42">
          <path d="M13 2 a26 26 0 0 0 0 38 a20 20 0 0 1 0 -38z" fill="#C9A24B" />
        </svg>
      </span>
      <span className="hi__layer hi__crescent-b" data-depth="0.18">
        <svg className="hi__float-fast" viewBox="0 0 27 42">
          <path d="M14 2 a26 26 0 0 1 0 38 a20 20 0 0 0 0 -38z" fill="#C9A24B" opacity="0.85" />
        </svg>
      </span>
      <span className="hi__layer hi__sticks" data-depth="0.1">
        <svg className="hi__float-mid" viewBox="0 0 80 56">
          <rect x="8" y="4" width="7" height="46" rx="3.5" fill="#E8CF9A" transform="rotate(18 11 27)" />
          <rect x="65" y="4" width="7" height="46" rx="3.5" fill="#E8CF9A" transform="rotate(-18 68 27)" />
          <circle cx="40" cy="34" r="16" fill="none" stroke="#C82E21" strokeWidth="4" />
          <circle cx="40" cy="34" r="5" fill="#C9A24B" />
        </svg>
      </span>
    </div>
  );
}
