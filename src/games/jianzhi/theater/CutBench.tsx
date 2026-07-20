import type { RefObject } from 'react';
import type { FoldMode } from '../core/types';
import styles from '../JianzhiGame.module.css';

type ToolMode = 'motif' | 'cut';

const FOLD_LABEL: Record<FoldMode, string> = {
  single: '单面',
  book: '对折',
  four: '四折',
  rosette: '团花',
};

const FOLD_HINT: Record<FoldMode, string> = {
  single: '不折叠,自由剪',
  book: '左右镜像,剪「福」最宜',
  four: '四向对称,窗花首选',
  rosette: '旋转放射,丝路团花',
};

export function CutBench({
  canvasHostRef,
  effectiveFold,
  foldLocked,
  onFoldChange,
  tool,
  onToolChange,
  onUndo,
  onClear,
  onContinue,
  onUnfold,
  unfoldReady,
  onSave,
  onDownload,
}: {
  canvasHostRef: RefObject<HTMLDivElement | null>;
  effectiveFold: FoldMode;
  foldLocked: boolean;
  onFoldChange: (fold: FoldMode) => void;
  tool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
  onUndo: () => void;
  onClear: () => void;
  onContinue: () => void;
  onUnfold: () => void;
  unfoldReady: boolean;
  onSave: () => void;
  onDownload: () => void;
}) {
  return (
    <div className={`${styles.stage} th-stage`}>
      <div className={styles.canvasFrame}>
        <div ref={canvasHostRef} className={styles.canvasHost} />
      </div>

      <div className={styles.controls}>
        <div className={styles.foldRow} role="group" aria-label="折法">
          {(Object.keys(FOLD_LABEL) as FoldMode[]).map((id) => (
            <button
              key={id}
              type="button"
              className={`${styles.foldBtn} ${effectiveFold === id ? styles.foldActive : ''}`}
              title={foldLocked ? `本课指定:${FOLD_HINT[id]}` : FOLD_HINT[id]}
              disabled={foldLocked}
              aria-disabled={foldLocked}
              onClick={() => {
                if (foldLocked) return;
                onFoldChange(id);
              }}
            >
              {FOLD_LABEL[id]}
            </button>
          ))}
        </div>
        <div className={styles.toolRow}>
          <button
            type="button"
            className={`${styles.toolBtn} ${tool === 'motif' ? styles.toolActive : ''}`}
            onClick={() => onToolChange('motif')}
          >
            纹样戳印
          </button>
          <button
            type="button"
            className={`${styles.toolBtn} ${tool === 'cut' ? styles.toolActive : ''}`}
            onClick={() => onToolChange('cut')}
          >
            自由剪
          </button>
          <span className={styles.toolHint}>
            {tool === 'motif' ? '点折面落剪,纹样自动对称' : '在折面里拖动,划出镂空'}
          </span>
        </div>
        <div className={styles.actionRow}>
          <button type="button" className={styles.actionBtn} onClick={onUndo}>
            撤销
          </button>
          <button type="button" className={styles.actionBtn} onClick={onClear}>
            清空
          </button>
          <button type="button" className={styles.actionBtn} onClick={onContinue}>
            继续剪
          </button>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.unfoldBtn} ${unfoldReady ? styles.unfoldReady : ''}`}
            onClick={onUnfold}
          >
            展开 ✦
          </button>
        </div>
        <div className={styles.saveRow}>
          <button type="button" className={styles.ghostBtn} onClick={onSave}>
            存入作品
          </button>
          <button type="button" className={styles.ghostBtn} onClick={onDownload}>
            下载图片
          </button>
        </div>
      </div>
    </div>
  );
}
